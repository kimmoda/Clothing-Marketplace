import React, { Component } from 'react';
import firebase from './config/firebase';
import { BrowserRouter as Router, Redirect, Switch, Route } from 'react-router-dom';

import Home from './components/Home';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Profile from './components/Profile';
import ApprovedBrand from './components/ApprovedBrand';
import ProductUpload from './components/ProductUpload';
import BrandForm from './components/BrandForm';
import Designers from './components/Designers';
import Designer from './components/Designer';
import Clothing from './components/Clothing';
import Article from './components/Article';
import ReadArticle from './components/ReadArticle';
import ArticleCategory from './components/ArticleCategory';
import SearchQuery from './components/SearchQuery';
import About from './components/About';
import Contact from './components/Contact';
import Terms from './components/Terms';
import ProcessPayment from './components/ProcessPayment';
import Wishlist from './components/Wishlist';
import NoMatch from './components/NoMatch';
import Transactions from './components/Transactions';
import AllClothing from './components/AllClothing';

import './App.css';

var db = firebase.firestore();

class App extends Component {
  constructor(){
    super();
    this.state = {
      authState: false,
      userInfo: false,
      redirect: false,
      currentPage: '',
      uid: null,
      brandData: false,
      brandDataLoaded: false,
      productData: false,
      productDataLoaded: false,
      articleData: false,
      articleDataLoaded: false,
      image: false
    }
  }

  componentDidMount(){
    firebase.auth().onAuthStateChanged((user)=>{
      if (user) {
        console.log(`${user.email} is logged in`)
          this.setState({
            userInfo: user.toJSON(),
            authState: true,
            redirect: false,
            currentPage: '',
            uid: user.uid
          })
      } else {
          console.log('User is not logged in')
          this.setState({
            authState: false
          })
      }
    })
  }

  handleAuthState=(authChange)=>{
    if(authChange === false){
      firebase.auth().signOut()
      .then(res=>{
        console.log(res)
        this.setState({
          authState: false,
        })
      }).catch(err=>console.log(err))
    }else if(authChange === true){
      firebase.auth().onAuthStateChanged((user)=>{
        if(user){
          this.setState({
            authState: true,
          })
        }else{
          this.setState({
            authState: false
          })
        }
      })
    }else{
      return null;
    }
  }

  storeFeed = (brandData) => {
    this.setState({
      brandData: brandData,
      brandDataLoaded: true
    })
  }

  storeArticleData = (articleData, brandData) => {
    this.setState({
      articleData: articleData,
      articleDataLoaded: true,
      featBrandData: brandData,
      featBrandDataLoaded: true
    })
  }

  handleSearch=(search, kind)=>{
    console.log(search, kind)
    if(search !== undefined){
      db.collection('brands').where('approved', "==", true).where('name', "==", search).get().then((res)=>{
        console.log(res)
      })
    }
  }
  
  render() {
    const {redirect, currentPage} = this.state
    return (
      <Router>
          <div className="App">
            <div className="app-body">
            <Navbar authState={this.state.authState} userInfo={this.state.userInfo} authStateChange={(authChange)=>this.handleAuthState(authChange)} handleSearch={(search, kind)=>this.handleSearch(search, kind)}/>
              <Switch>
                <Route exact path="/" render={() => <Home authState={this.state.authState} articleData={this.state.articleData} articleDataLoaded={this.state.articleDataLoaded} featBrandData={this.state.featBrandData} storeArticleData={(articleData, brandData)=> this.storeArticleData(articleData, brandData)} /> } />
                <Route exact path="/account/login" render={() => <Login authState={(authChange)=>this.handleAuthState(authChange)} /> } />
                <Route exact path="/profile" render={() => <Profile authState={this.state.authState} userInfo={this.state.userInfo} authStateChange={(authChange)=>this.handleAuthState(authChange)}/> } />
                <Route exact path="/profile/brand-signup" component={BrandForm} />
                <Route exact path="/profile/product-create" component={ProductUpload}/>
                <Route exact path="/profile/brand" render={()=> <ApprovedBrand authState={this.state.authState} userUid={this.state.uid} /> } />
                {/* <Route exact path="/profile/cart" render={()=> <Cart authState={this.state.authState} userUid={this.state.uid} shopping_cart={this.state.shopping_cart} /> }/> */}
                <Route exact path="/profile/transactions" component={Transactions} />
                <Route exact path="/profile/process" component={ProcessPayment} />
                <Route exact path="/profile/wishlist" component={Wishlist} />
                <Route exact path="/designers" render={() => <Designers authState={this.state.authState} brandData={this.state.brandData} brandDataLoaded={this.state.brandDataLoaded} storeFeed={(brandData)=> this.storeFeed(brandData)} />} />
                <Route exact path="/designers/:brand/:brand_id" component={Designer} />
                <Route exact path="/designers/:brand/:brand_id/:product_title/:id" component={Clothing} />
                <Route exact path="/editorial/" render={() => <Article authState={this.state.authState} /> } />
                <Route exact path="/editorial/archive/:category" component={ArticleCategory} />
                <Route exact path="/editorial/:id/:article" component={ReadArticle} />
                <Route exact path="/search/products/:product_type" component={SearchQuery} />
                <Route exact path="/clothing" component={AllClothing} />
                <Route exact path="/about" component={About} />
                <Route exact path="/contact-us" component={Contact} />
                <Route exact path="/customer/terms-conditions" component={Terms} />
                {redirect ? <Redirect to={currentPage} /> : null}
                <Route component={NoMatch} />
              </Switch>
            </div>
          </div>
      </Router>
    );
  }
}

export default App;