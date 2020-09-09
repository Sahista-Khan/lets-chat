import React, { Component } from 'react';
import { Card } from 'react-bootstrap';
import ReactLoading from 'react-loading';
import 'react-toastify/dist/ReactToastify.css';
import firebase from '../../FirebaseService/firebase';
import moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css';
import Avatar from '@material-ui/core/Avatar';
import './ChatBox.css';
import SendIcon from '@material-ui/icons/Send';


class ChatBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            inputValue: ""

        }
        this.currentDocumentId = localStorage.getItem("FirebaseDocumentId");
        this.currentUserId = localStorage.getItem("Id");
        this.currentUserName = localStorage.getItem("Name");
        this.currentUserEmail = localStorage.getItem("Email");
        this.currentPeerUser = this.props.currentPeerUser;
        this.groupChatId = null;
        this.listMessage = [];
        this.currentPeerUserNotificationMessages = [];
        this.removeListener = null;
        this.currentPhotoFile = null;
        this.notifyPending = true;


    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    componentWillReceiveProps(newprops) {
        if (newprops.currentPeerUser) {
            this.currentPeerUser = newprops.currentPeerUser;
            this.getListHistory();
        }
        this.notifyPending = true;
    }
    componentDidMount() {
        this.getListHistory();

    }

    getListHistory = () => {

        if (this.removeListener) {
            this.removeListener()
        }
        this.listMessage.length = 0
        this.setState({ isLoading: true });
        if (this.hashString(this.currentUserId) <= this.hashString(this.currentPeerUser.id)) {
            this.groupChatId = `${this.currentUserId}-${this.currentPeerUser.id}`;
        }
        else {
            this.groupChatId = `${this.currentPeerUser.id}-${this.currentUserId}`;
        }


        //get History and listen new data add

        console.log(this.groupChatId);
        this.removeListener = firebase.firestore()
            .collection("Messages")
            .doc(this.groupChatId)
            .collection(this.groupChatId)
            .onSnapshot(Snapshot => {

                console.log(Snapshot);
                Snapshot.docChanges().forEach(change => {

                    if (change.doc.data().type === 0) {
                        this.listMessage.push(change.doc.data())
                    }
                })
                console.log(this.listMessage);
                this.setState({ isLoading: false });
            },
                err => {
                    this.props.showToast(0, err.toString());
                })
    }

    onSendMessage = (content, type) => {
        let notificationMessages = [];

        if (content.trim() === '') {
            return
        }
        const timestamp = moment().valueOf().toString();

        const itemMessage = {
            idFrom: this.currentUserId,
            idTo: this.currentPeerUser.id,
            timestamp: timestamp,
            content: content.trim(),
            type: type
        }



        firebase.firestore()
            .collection("Messages")
            .doc(this.groupChatId)
            .collection(this.groupChatId)
            .doc(timestamp)
            .set(itemMessage)
            .then(() => {

                this.setState({ inputValue: '' })
            })


        if (this.notifyPending) {
            notificationMessages.push({
                notificationId: this.currentUserId,
                number: 0
            });

            this.currentPeerUserNotificationMessages.map((item) => {
                if (item.notificationId != this.currentUserId) {
                    notificationMessages.push({
                        notificationId: item.notificationId,
                        number: item.number
                    });
                }
            })
            console.log("------------%%665")
            console.log(this.notifyPending)
            console.log(notificationMessages)
            this.notifyPending = false;
        }


        firebase.firestore().collection('users').doc(this.currentPeerUser.documentKey).get()
            .then((docRef) => {
                this.currentPeerUserNotificationMessages = docRef.data().messages;
                console.log("I am constructore.......");
                console.log(docRef.data().messages);

                firebase.firestore()
                    .collection('users')
                    .doc(this.currentPeerUser.documentKey)
                    .update({
                        messages: notificationMessages
                    })
                    .then((data) => { })
                    .catch(err => {
                        this.props.showToast(0, err.toString())
                    })
            })



    }

    scrollToBottom = () => {
        if (this.messagesEnd) {
            this.messagesEnd.scrollIntoView({})
        }
    }

    onKeyBoardPress = (event) => {
        if (event.key === 'Enter') {
            this.onSendMessage(this.state.inputValue, 0)
        }

    }

    componentWillUnmount() {
        if (this.removeListener) {
            this.removeListener()
        }
    }

    render() {
        return (
            <Card className="viewChatBoard">
                <div className="headerChatBoard">
                    <Avatar
                        className="viewAvatarItem"
                        src="https://www.demo.com"
                        alt={this.currentPeerUser.name}
                    />
                    <span className="textHeaderChatBoard">
                        <p style={{ fontSize: '20px' }}>{this.currentPeerUser.name}</p>
                    </span>
                </div>
                <div className="viewListContentChat">
                    {this.renderListMessage()}
                    <div
                        style={{ float: 'left', clear: 'both' }}
                        ref={el => {
                            this.messagesEnd = el
                        }
                        } />
                </div>

                <div className="viewBottom">
                    <input className="viewInput"
                        placeholder="Type a message"
                        value={this.state.inputValue}
                        onChange={event => {
                            this.setState({ inputValue: event.target.value })
                        }}
                        onKeyPress={this.onKeyBoardPress}
                    />
                    <SendIcon
                        className="icSend"
                        onClick={() => { this.onSendMessage(this.state.inputValue) }}
                    />
                </div>
                {this.state.isLoading ? (
                    <div className="viewLoading">
                        <ReactLoading
                            type={'spin'}
                            color={'#203152'}
                            height={'3%'}
                            width={'3%'} />

                    </div>
                ) : (null)
                }


            </Card>
        );
    }

    renderListMessage = () => {
        let viewListMessage = [];

        if (this.listMessage.length > 0) {

            this.listMessage.forEach((item, index) => {
                if (item.idFrom === this.currentUserId) {

                    if (item.type === 0) {
                        console.log('------' + "Render");
                        viewListMessage.push(
                            <div className="viewItemRight" key={item.timestamp}>
                                <span className="textContentItem">{item.content}</span>
                            </div>
                        )
                    }

                }
                else {
                    if (item.type === 0) {
                        viewListMessage.push(
                            <div className="viewWrapItemLeft" key={item.timestamp}>
                                <div className="viewWrapItemLeft3">
                                    {this.isLastMessageLeft(index) ? (
                                        <Avatar
                                            className="peerAvatarLeft"
                                            src="https://demo.com"
                                            alt={this.currentPeerUser.name} />
                                    ) : (
                                            <div className="viewPaddingLeft" />
                                        )}
                                    <div className="viewItemLeft">
                                        <span className="textContentItem3">{item.content}</span>
                                    </div>
                                </div>
                                {this.isLastMessageLeft(index) ? (
                                    <span className="textTimeLeft">
                                        <div className="time">
                                            {moment(Number(item.timestamp)).format("L")}
                                        </div>
                                    </span>
                                ) : (null)
                                }
                            </div>
                        )
                    }
                }
            })
        }

        return viewListMessage;
    }

    isLastMessageLeft(index) {
        if (
            (index + 1 < this.listMessage.length &&
                this.listMessage[index + 1].idFrom === this.currentUserId) ||
            index === this.listMessage.length - 1
        ) {
            return true
        }
        else {
            return false
        }
    }

    isLastMessageRight(index) {
        if (
            (index + 1 < this.listMessage.length &&
                this.listMessage[index + 1].idFrom !== this.currentUserId) ||
            index === this.listMessage.length - 1
        ) {
            return true
        }
        else {
            return false
        }
    }

    hashString = str => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash += Math.pow(str.charCodeAt(i) * 31, str.length - 1);
            hash = hash && hash   // covert to 32 bit Integer

        }

        return hash;
    }
}

export default ChatBox;