import React, { Component } from 'react'
import firebase from '../../FirebaseService/firebase';
import './Chat.css';

import Avatar from '@material-ui/core/Avatar';
import SearchIcon from '@material-ui/icons/Search';
import ChatBox from '../ChatBox/ChatBox';
import Welcome from '../Welcome/Welcome';
import Spinner from '../../Components/UI/Spinner/spinner';
import Header from "../../Components/Header";

class Chat extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            isOpenLogout: false,
            currentPeerUser: null,
            displayNotification: [],
            displayContacts:[],
            error:null
        }

        this.currentDocumentId = localStorage.getItem("FirebaseDocumentId");
        this.currentUserId = localStorage.getItem("Id");
        this.currentUserName = localStorage.getItem("Name");
        this.currentUsername = localStorage.getItem("Username");
        this.currentUserNotificationReceived = [];
        this.searchUsers=[];
        this.notificationMessageErase=[];

    }
    logout = () => {
        firebase.auth().signOut();
        this.props.history.push('/');
        localStorage.clear();
    }

    componentDidMount(){
    
         firebase.firestore().collection("users").doc(this.currentDocumentId).get()
        .then((doc) => {

            doc.data().messages.map((item)=>{
                this.currentUserNotificationReceived.push({
                    notificationId:item.notificationId,
                    number:item.number 
                });
            });

            this.setState({
                displayNotification:this.currentUserNotificationReceived
            })
        
            return true;
        })
        .catch(err => {

            this.setState({isLoading:false, error:err})
        })
        this.getListUsers();
    }

    getListUsers = ()=>{
        let result=firebase.firestore().collection("users").get()
        .then(result => {
            console.log(result.docs);
            if(result.docs.length>0){
                let listUsers=[]
                listUsers=[...result.docs]
                listUsers.forEach((item,index)=>{
                    this.searchUsers.push(
                        {
                            key:index,
                            documentKey:item.id,
                            id:item.data().id,
                            name:item.data().name,
                            messages:item.data().messages,
                            username:item.data().username
                            
                        }
                    )
                })
    
                this.setState({isLoading:false})
            }
            this.renderListUser();
        })
        .catch(err => {
            this.setState({isLoading:false, error:err})
   
        });
       
        
    }


    getClassnameforUserandNotification=(itemId)=>{
        let number=0
        let className=""
        let check=false;
        if(this.state.currentPeerUser && this.state.currentPeerUser.id === itemId){
            className="viewWrapItemFocused"
        }
        else{
            this.state.displayNotification.forEach((item) => {
                if(item.notificationId.length>0){
                    if(item.notificationId === itemId)
                    {
                        check = true;
                        number = item.number;
                    }
                }
            });

            if(check === true)
            {
                className = "viewWrapItemNotification";
            }
            else {
                className ="viewWrapItem";
            }
        }
        return className;
    }

    notificationErase = (itemId) => {
        this.state.displayNotification.forEach((el) => {
            if(el.notificationId.length>0){
                if(el.notificationId !== itemId){
                    this.notificationMessageErase.push({
                        notificationId:el.notificationId,
                        number:el.number
                    })
                }
            }
        })
        this.updaterenderList()
    }

    updaterenderList = () => {
        firebase.firestore().collection("users").doc(this.currentDocumentId)
        .update({
            messages: this.notificationMessageErase
        })

        this.setState({
            displayNotification: this.notificationMessageErase
        })

        this.notificationMessageErase=[];
    }



    renderListUser = ()=>{
        if(this.searchUsers.length>0){
            let viewListUser=[]
            let classname=""
            this.searchUsers.map(item=>{
                if(item.id !== this.currentUserId){
                    classname=this.getClassnameforUserandNotification(item.id);
                    viewListUser.push(
                        <button
                            id={item.key}
                            className={classname}
                            onClick={()=>{
                                this.notificationErase(item.id)
                                this.setState({currentPeerUser: item})
                                document.getElementById(item.key).style.backgroundColor = "#fff";
                                document.getElementById(item.key).style.color = "#fff";
                            }}
                        >
                            <Avatar 
                                className="viewAvatarItem"
                                src="https://demo.com"
                                alt={item.name}/>

                            <div className="viewWrapContentItem">
                                <span className="textItem">
                                    {item.name}
                                </span>
                            </div>

                            {classname ==="viewWrapItemNotification" ? (
                                <div className="notificationpragraph">
                                    <p id={item.key} className="newmessages">
                                        New Message
                                    </p>
                                </div>
                            ) : null}
                        </button>
                    )
                }
            });
            this.setState({displayContacts: viewListUser})
        }
        else{

            let viewListUser = (
                <div className="viewWrapContentItem">
                                <span className="textItem">
                                    {`No User Present`}
                                </span>
                            </div>
            )
            this.setState({displayContacts: viewListUser})
        }
    }


searchHandler = (event) => {
 
    let searchQuery= event.target.value.toLowerCase(),
    displayContacts=this.searchUsers.filter((el)=>{
        let searchValue=el.username.toLowerCase();
        return searchValue.indexOf(searchQuery) !== -1;
    })
    this.displayContacts=displayContacts
    this.displaySearchedContacts()

}

displaySearchedContacts = ()=>{
    if(this.searchUsers.length>0){
        let viewListUser=[]
        let classname=""
        this.displayContacts.map(item=>{
            if(item.id !== this.currentUserId){
                classname=this.getClassnameforUserandNotification(item.id);
                viewListUser.push(
                    <button
                        id={item.key}
                        className={classname}
                        onClick={()=>{
                            this.notificationErase(item.id)
                            this.setState({currentPeerUser: item})
                            document.getElementById(item.key).style.backgroundColor = "#fff";
                            document.getElementById(item.key).style.color = "#fff";
                        }}
                    >
                        <Avatar 
                            className="viewAvatarItem"
                            src=""/>
                        <div className="viewWrapContentItem">
                            <span className="textItem">
                                {`${item.username}`}
                            </span>
                        </div>

                        {classname ==="viewWrapItemNotification" ? (
                            <div className="notificationpragraph">
                                <p id={item.key} className="newmessages">
                                    New Message
                                </p>
                            </div>
                        ) : null}
                    </button>
                )
            }
        });
        this.setState({displayContacts: viewListUser})
    }
    else{

        let viewListUser = (
            <div className="viewWrapContentItem">
                            <span className="textItem">
                                {`No User Present`}
                            </span>
                        </div>
        )
        this.setState({displayContacts: viewListUser})
    }
}


    render() {

        let content = (
            <div className="root">
                <Header/>
                <div className="body">
                    <div className="viewListUser">
                        <div className="profileviewleftside">
                            <Avatar
                            src="https://www.demo.com"
                            alt={this.currentUserName}
                            />
                            <button className="Logout" onClick={this.logout}>
                                Logout
                            </button>
                        </div>
                        <div className="rootsearchbar">
                            <div className="input-container">
                                
                                <SearchIcon/>
                                <input  className="input-field"
                                 type="text"
                                 onChange={this.searchHandler}
                                placeholder="Search"/>
                            </div>
                        </div>
                        {this.state.displayContacts}
                    </div>
                    <div className="viewBoard">
                        {this.state.currentPeerUser?(
                            <ChatBox currentPeerUser={this.state.currentPeerUser}
                            showToast={this.props.showToast}/>
                        ):(
                            <Welcome currentUserName={this.currentUserName}/>
                        )}
                    </div>
                </div>
            </div>

        )

        if(this.state.isLoading){
            content = <Spinner />
        }

        return content
    }
}

export default Chat;
