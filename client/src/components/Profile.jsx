import React, { Component } from 'react';
import {Link, Route, Redirect} from 'react-router-dom';
import BrandService from '../services/BrandService';
import firebase from '../config/firebase';
var db = firebase.firestore();

class Profile extends Component{
    constructor(props){
        super(props);
        this.state = {
            uid: false,
            redirect: false,
            currentPage: null,
            currentUser: false
        }
    }

    componentWillMount() {
        firebase.auth().onAuthStateChanged(user=>{
            if(user){
                console.log(`Welcome ${user.email}`);
                db.collection('users').doc(user.uid).get()
                .then(res=>{
                    console.log(res.data())
                    this.setState({currentUser: res.data()})
                }).catch(err=>console.log(err))

                this.setState({
                    uid: user.uid,
                    redirect: false,
                    currentPage: ''
                })
            }else{
                this.setState({
                    redirect: true,
                    currentPage: '/'
                }) 
            }
        })
    }

    componentWillUpdate(nextProps, nextState) {
        // console.log(nextProps, nextState)
        if(nextProps.authState == true && nextState.uid != false){
            console.log("user logged in")
            return true;
        }else{
            return false;
        }
    }
    
    handleSubmit=(e)=>{
        e.preventDefault(); 
    }

    handleLogOut=()=>{
        if(window.confirm("Do you want to log out?")){
            firebase.auth().signOut()
            .then(res=>console.log(res))
            .catch(err=>console.log(err))
            this.props.authStateChange("signed out")
        }else{
            console.log("logged out cancel")
            return null
        }
    }

    renderPage = () => {
        if(this.state.uid != false){
            return(
                <div className="profile-page">
                    <h1 className="page-title">{this.state.currentUser ? `Welcome, ${this.state.currentUser.first_name}` : `Welcome`}</h1>
                    <div className="profile-links">
                        <Link to="/profile/brand-signup"><button className="ui button">Register A Brand</button></Link>
                        <Link to="/profile/product-create"><button className="ui button">Sell A Product</button></Link>
                        <button className="ui button" onClick={this.handleLogOut} >Logout</button>
                        
                    </div>
                </div>
                
            )
        }
    }
    render(){
        const {redirect, currentPage} = this.state;
        return(
            <section id="profile-page">
                {redirect ? <Redirect to={currentPage} /> : null}
                {this.renderPage()}
            </section>
        )
    }
}

export default Profile;