import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';
import firebase from '../config/firebase';

// Initialize Cloud Firestore through firebase
var db = firebase.firestore();

class ReadArticle extends Component {
    constructor(props){
        super(props);
        this.state = {
            articleData: false,
            articleDataLoaded: false,
        }
    }

    componentWillMount() {
        let articleId = Number(this.props.match.params.id);
        let articleRef = db.collection('articles').doc(`article_${articleId}`);
        let articleInfo = {};

        articleRef.get().then((res)=>{
            if(res.exists){
                this.setState({
                    redirect: false,
                    currentPage: '',
                })
                console.log(res.data());
                return articleInfo = res.data();
            }else{
                this.setState({
                    redirect: true,
                    currentPage: '/editorial'
                })
            }
        }).then(()=>{
            this.setState({
                articleData: articleInfo,
                articleDataLoaded: true
            })
        })
        .catch(err=>console.log(err))

    }

    componentWillUpdate(prevProps, prevState) {
        console.log(prevProps, prevState)
        JSON.stringify()
    }

    rendePage(){
        if(this.state.articleDataLoaded && this.state.articleData.hasOwnProperty("id")){
            const {articleData} = this.state;
            return(
                <div className="page-container single-article ui container">
                    <img src={articleData.screen_image} alt={articleData.title} title={articleData.title} className="article-image"/>
                    <h1 className="ui header title">{articleData.title}</h1>
                    <h3 className="ui header title">{articleData.subtitle}</h3>
                    
                    <div className="article-info">
                        <p className="author">Written by: {articleData.author}</p>
                        <p className="photographer">Photos by: {articleData.photographer}</p>
                        <p className="data">Date: {articleData.created}</p>
                        <div className="share">
                            <a href="#"><i className="facebook square icon"></i></a>
                            <a href="#"><i className="twitter icon"></i></a>
                            <a href="#"><i className="mail icon"></i></a>
                        </div>
                    </div>

                    <div className="article-text" dangerouslySetInnerHTML={{__html: articleData.text}}>
                    </div>

                    {/* Todo: Render previous, next articles or recommdations */}
                </div>
            )
        }else if(this.state.articleDataLoaded && !this.state.articleData.hasOwnProperty("id")){
            return(
                <div className="page-container">
                    <h1 className="ui header title">Sorry this article wasn't found!</h1>
                    
                </div>
            )
        }else{
            return(
                <div className="ui active inverted dimmer">
                    <div className="ui indeterminate text loader">Preparing Files</div>
                </div>
            )
        }
    }

    render(){
        const {redirect, currentPage} = this.state;
        return(
            <section id="single-article">
                {redirect ? <Redirect to={currentPage} /> : null}
                {this.rendePage()}
            </section>
        )
    }
}

export default ReadArticle;