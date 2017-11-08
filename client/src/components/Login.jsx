import React, { Component } from 'react';
import firebase from '../config/firebase';
import ui, {uiConfig} from '../config/firebaseui';

class Login extends Component{
    constructor(props){
        super(props);
        this.state = {
            email: undefined,
            pass: undefined,
            userInfo: undefined
        }
    }
    componentDidMount(){
        // The start method will wait until the DOM is loaded.
        // ui.start('#firebaseui-auth-container', uiConfig);
    }

    handleChange=(e)=>{
        e.preventDefault();
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleLoginSubmit=(e)=>{
        e.preventDefault();
        console.log('Login Submit')
        firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
        .then(res=>{
            console.log(res)
            firebase.auth().onAuthStateChanged((user)=>{
                if (user) {
                    this.setState({userInfo: user.toJSON()})
                    this.props.authState(true)
                } else {
                    console.log('User is not logged in')
                    this.props.authState(false)
                }
            })
        })
        .catch(err=>{
            // Handle Errors here.
            var errorCode = err.code;
            var errorMessage = err.message;
            console.log(errorCode, errorMessage)
        });
    }

    handleRegisterSubmit=(e)=>{
        e.preventDefault();
        console.log('Register Submit')
        if(this.state.password === this.state.password_confirm){
            firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then(res=>{
                console.log(res)
                
            })
            .catch(err=>{
                // Handle Errors here.
                var errorCode = err.code;
                var errorMessage = err.message;
                console.log(errorCode, errorMessage)
                var formError = document.getElementById("form-error");
                formError.innerHTML = (`<div class="ui message"> <div class="header">We had some issues</div><ul class="list"><li>${errorMessage}</li></ul></div>`)
            });
        }else{
            var formError = document.getElementById("form-error");
            formError.innerHTML = ('<div class="ui message"> <div class="header">We had some issues</div><ul class="list"><li>Passwords must match</li></ul></div>')
        }
    }

    
    render(){
        return(
            <div className="auth-form">
                <div className="login-form">
                    <h1>Login</h1>
                    <form onSubmit={this.handleLoginSubmit} className="ui form">
                        <input type="text" placeholder="email" name="email" onChange={this.handleChange}/>
                        <input type="password" placeholder="password" name="password" onChange={this.handleChange}/>
                        <input type="submit" value="Login"/>
                    </form>
                </div>
                <div className="login-form">
                    <h1>Create An Account</h1>
                    <form onSubmit={this.handleRegisterSubmit} className="ui form">
                        <div id="form-error"></div>
                        <div className="two fields">
                            <div className="field">
                                <div className="ui labeled input">
                                    <div className="ui label">
                                        First Name
                                    </div>
                                    <input required="true" name="first_name" type="text" placeholder="First Name" onChange={(e)=>this.handleChange(e)}/>
                                </div>
                            </div>
                            <div className="field">
                                <div className="ui labeled input">
                                    <div className="ui label">
                                        Last Name
                                    </div>
                                    <input required="true" name="last_name" type="text" placeholder="Last Name" onChange={(e)=>this.handleChange(e)}/>
                                </div>
                            </div>
                        </div>

                        <div className="field">
                            <div className="ui labeled input">
                                <div className="ui label">
                                   Email
                                </div>
                                <input required="true" name="email" type="text" placeholder="Email" onChange={(e)=>this.handleChange(e)}/>
                            </div>
                        </div>

                        <div className="two fields">
                            <div className="field">
                                <div className="ui labeled input">
                                    <div className="ui label">
                                        Password
                                    </div>
                                    <input required="true" name="password" type="password" placeholder="Password" onChange={(e)=>this.handleChange(e)}/>
                                </div>
                            </div>
                            <div className="field">
                                <div className="ui labeled input">
                                    <div className="ui label">
                                        Confirm Password
                                    </div>
                                    <input required="true" name="password_confirm" type="password" placeholder="Confirm Password" onChange={(e)=>this.handleChange(e)}/>
                                </div>
                            </div>
                        </div>
                        <button className="ui primary button" type="submit">Create</button>
                    </form>
                </div>
                {/* <div className="login-form">
                    <h1>Or</h1>
                    <div id="firebaseui-auth-container"></div>
                </div> */}
            </div>
        )
    }
}

export default Login;