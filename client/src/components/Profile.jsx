import React, { Component } from 'react';
import firebase from '../config/firebase';
import {Link, Route} from 'react-router-dom';
import BrandService from '../services/BrandService';

class Profile extends Component{
    constructor(props){
        super(props);
        this.state = {
            brand: undefined
        }
        // this.rootRef = firebase.database().ref();
        // this.userProfileRef = this.rootRef.child('Users')
        // this.addBrandService = new BrandService();
    }
    
    handleSubmit=(e)=>{
        e.preventDefault(); 
        // this.userProfileRef.child(this.props.userInfo.uid).child('brand').child('name').set("Rick Owens")
        // this.userProfileRef.child(this.props.userInfo.uid).child('about').child('content').set(firebase.auth().currentUser.toJSON())
        // .then(res=>console.log(res))
        // .catch(err=>console.log(err))
        // this.addBrandService.sendData(this.state.brand)
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
    render(){
        return(
            <div className="profile-page">
                <h1 className="page-title">Profile Page</h1>
                <div className="profile-links">
                    <Link to="/profile/brand-signup"><button className="ui button">Register A Brand</button></Link>
                    <Link to="/profile/product-create"><button className="ui button">Sell A Product</button></Link>
                </div>
            </div>
        )
    }
}

export default Profile;