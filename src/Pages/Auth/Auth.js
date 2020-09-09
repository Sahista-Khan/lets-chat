import React, {Component} from 'react';

import Input from "../../Components/UI/Input/Input.js"
import firebase from '../../FirebaseService/firebase'
import AuthCSS from './Auth.module.css';
import Button from '../../Components/UI/Button/Button.js'
import Spinner from '../../Components/UI/Spinner/spinner';
import { Redirect } from 'react-router-dom';

class Auth extends Component {
    state = {
        controls: {
            username: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'UserNname'
                },
                value: '',
                validation: {
                    required: true,
                    isusername: true
                },
                isValid:false,
                touched:false
            },

            password: {
                elementType: 'input',
                elementConfig: {
                    type: 'password',
                    placeholder: 'Password'
                },
                value: '',
                validation: {
                    required: true,
                    minLength: 6
                },
                isValid:false,
                touched:false
            },

            name: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Your Name'
                },
                value: '',
                validation: {
                    required: true,
                    isusername: true
                },
                isValid:false,
                touched:false
            }
        },
        isSignup: true,
        error:null,
        isAuthCompleted: false,
        loading:false
    }

    componentDidMount() {
       
    }

    checkValidity(value, rules){
        let isValid=true;

        if(!rules)
        {
            return true;
        }
        if(rules.required && isValid){
            isValid = value.trim() !=='';
        }

        if(rules.minLength && isValid){
            isValid = value.length >= rules.minLength;
        }

        if(rules.maxLength && isValid){
            isValid = value.length <= rules.maxLength;
        }

        return isValid;
    }

    inputChangedHandler = (event, controlName) => {
        const updatedControls = {
            ...this.state.controls,
            [controlName] : {
                ...this.state.controls[controlName],
                value:event.target.value,
                isValid: this.checkValidity(event.target.value, this.state.controls[controlName].validation),
                touched: true
            }
        };

        this.setState({controls: updatedControls});
    }


    submitHandler = (event) => {
        event.preventDefault();
        if(this.state.isSignup) {
            this.signUpHandle();
        }

        else {
            this.loginInHandler();
        }
    }
    
    switchAuthModeHandler = () => {


        this.setState(prevState => {
            return {isSignup: !prevState.isSignup, error:null}
        });

    }
 
    loginInHandler = () => {

        this.setState({loading: true});
        try {
             firebase.auth().signInWithEmailAndPassword(this.state.controls.username.value+"@demo.com", this.state.controls.password.value)
            .then(async (result) => {
                           
                if(result.user)
                {
                    console.log(result.user.uid)
                   await firebase.firestore().collection("users")
                    .where("id", "==", result.user.uid)
                    .get()
                    .then((querySnapshot) => {
                    
                        querySnapshot.forEach((doc) => {
                            let currData= doc.data();
                            localStorage.setItem("FirebaseDocumentId",doc.id);
                            localStorage.setItem("Id", currData.id);
                            localStorage.setItem("Name", currData.name);
                            localStorage.setItem("Username", currData.username);
                        })
                        
                        this.setState({isAuthCompleted: true, loading: false});
                    })
                    .catch(err => {

                        console.log(err.messages);
                        this.setState({error:err, loading: false});
                    }

                    )
                }
                
            
                
            })
            .catch(err => {
                console.log("Error-->" + err.messages);
                this.setState({error:err, loading: false});
            })
        }
        catch(error) {
            this.setState({error:error, loading: false});
        }
    }

    signUpHandle = () => {
        this.setState({ loading: true});   

        try {
           
            firebase.auth().createUserWithEmailAndPassword(this.state.controls.username.value+"@demo.com", this.state.controls.password.value)
            .then((result) => {
               
                firebase.firestore().collection("users")
                .add({
                    name: this.state.controls.name.value,
                    id: result.user.uid,
                    username: this.state.controls.username.value,
                    messages:[{notificationId:"", number:0}]
                })
                .then(docRef => {
                    
                    console.log(docRef);
                    let currData=result.user;
                    localStorage.setItem("FirebaseDocumentId",docRef.id);
                    localStorage.setItem("Id", currData.uid);
                    localStorage.setItem("Name", this.state.controls.name.value);
                    localStorage.setItem("Username", this.state.controls.username.value);
                
                    this.setState({isAuthCompleted: true, loading: false});
        
                })
                .catch(error => {
                    console.log("SomeThing went wrong "+error.messages);
                    this.setState({error:error, loading: false});
                })
            })
            .catch(err => {
                console.log("Error-->" + err.messages);
                this.setState({error:err, loading: false});
            })
        }
        catch(error) {
            this.setState({error:error, loading: false});
            
        }
        
    }

    render () {
        
        const formElementArray = [];
        for (let key in this.state.controls) {

            if(this.state.isSignup){
                formElementArray.push({
                    id: key,
                    config: this.state.controls[key]
                });
            }
            else {
                if(  key!=="name" ) {
                    formElementArray.push({
                        id: key,
                        config: this.state.controls[key]
                    });
                    
                }
            }
            
        };

        let form = formElementArray.map(formElement => (
            <Input 
                key = {formElement.id}
                elementType={formElement.config.elementType} 
                elementConfig={formElement.config.elementConfig}
                value={formElement.config.value}
                invalid={!formElement.config.isValid}
                shouldValidate={formElement.config.validation}
                touched={formElement.config.touched}
                changed = {(event) => this.inputChangedHandler(event, formElement.id)}
            />

            
        ));

        if(this.state.loading) {
            form = <Spinner />
        }

        let errorMessage =null;

        if(this.state.error) {
            errorMessage = (
                <p>{this.state.error.message}</p>
            );
        }

        let redirectToChat = null;
        if(this.state.isAuthCompleted) {
            console.log("Chatttt")
            redirectToChat= <Redirect to="/chat" />
        }

        return (
            

            <div className={AuthCSS.Auth}>
                {redirectToChat}
                {errorMessage}
                <form onSubmit={this.submitHandler}>
                    {form}
                    <Button btnType = "Success" > {this.state.isSignup ? 'SIGNUP' : 'LOGIN'}</Button>
                </form>

                <Button 
                    clicked= {this.switchAuthModeHandler}
                    btnType = "Danger" > Switch To {this.state.isSignup ? 'SIGNIN' : 'REGISTER'}</Button>
            </div>
        );
    }
}



export default Auth;