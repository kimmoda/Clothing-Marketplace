import React, { Component } from 'react';
import axios from 'axios';
import {Link, Redirect} from 'react-router-dom';
import {Button, Form, Image, Modal} from 'semantic-ui-react';

import firebase from '../config/firebase';

// Initialize Cloud Firestore through firebase
var db = firebase.firestore();

class Clothing extends Component {
    constructor(props){
        super(props);
        this.state = {
            clothingData: false,
            brandData: false,
            loadPage: false,
            clothingDataLoaded: false,
            active: false
        }
       this.productDetails = {}
       this.brandDetails = {}
    }


    componentWillMount() {
        console.log(this.props)
        let brandID = Number(this.props.match.params.brand_id);
        let productTitle = this.props.match.params.product_title;
        let productID = Number(this.props.match.params.id);
        let brandRef = db.collection('brands').where('id', "==", brandID);
        let brandData = {};
        let productData = {};
        let brandUID = undefined;

        brandRef.get().then((res)=>{
            if(res.empty){
                this.setState({
                    clothingData: false,
                    dontLoad: true,
                    clothingDataLoaded: false
                })
            }else{
                res.forEach((res)=>{
                    brandUID = res.id;
                    this.brandDetails = res.data();
                    return brandData = res.data();
                })
                db.collection('brands').doc(brandUID).collection('products').where("id", "==", productID).where("title", "==", productTitle).get()
                .then((res)=>{
                    if(res.empty){
                        this.setState({
                            clothingData: false,
                            clothingDataLoaded: false
                        })
                    }else{
                        res.forEach((product)=>{
                            this.productDetails = product.data();
                            return productData = product.data();
                        })
                        this.setState({clothingData: productData, clothingDataLoaded: true, loadPage: true})
                    }
                }).catch(err=>(console.log(err)))
                this.setState({brandData: brandData})
            }
        }).catch(err=>{console.log(err)})
    }

    handleChange = (e) => {
        console.log(this.productDetails)
        let name = e.target.name;
        let value = e.target.value;

        this.setState({
            [name]: value
        })
    }

    handleSubmit = (e) => {
        e.preventDefault();
        let productToAdd = this.productDetails;
        let brandDetails = this.brandDetails;
        let button = document.querySelector('#cart-button')
        button.setAttribute('disabled', 'true');
        this.setState({active: true})

        firebase.auth().onAuthStateChanged((user)=>{
            if(user){
                if(productToAdd.inventory_total > 0){

                    let data = {
                        shipping: 6.00,
                        total: (Number(productToAdd.price) + 6),
                        cost: Number(productToAdd.price),
                        description: productToAdd.descritpion,
                        designer: productToAdd.designer,
                        title: productToAdd.title,
                        id: productToAdd.id,
                        size: this.state.size,
                        paypal_email: brandDetails.paypal_email,
                        designer_id: brandDetails.id
                    }

                    db.collection('users').doc(user.uid).collection('transactions').doc(new Date().toString()).set({
                        shipping: 6.00,
                        total: (Number(productToAdd.price) + 6),
                        cost: Number(productToAdd.price),
                        title: productToAdd.title,
                        id: productToAdd.id,
                        size: this.state.size,
                        paypal_email: brandDetails.paypal_email,
                        designer_id: brandDetails.id
                    },{merge: true}).then(()=>{
                        axios.post('/pay',data,{
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': 'https://streetwearboutiques.com/',
                                "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
                            },
                            mode: 'cors',
                        }).then((res)=>{
                            console.log(res)
                            window.location.href = res.data;
                        }).catch(err=>console.log(err))
                    }).catch(err=>console.log(err))
                }else{
                    let errorFrom = document.querySelector('#error');
                    let message = ("<pCurrently out of stock</p>")
                    errorFrom.innerHTML = message;
                }
            }else{
                let errorFrom = document.querySelector('#error');
                let message = ("<p><a href='/account/login'>In order to protect all of our users, we ask that you Login or Sign up first before you are allowed to make purchases.</a></p>")
                errorFrom.innerHTML = message;
            }
        })
    }

    handleImageChange=(image)=>{
       let bigImage = document.querySelector('div.imgHolder img');

       bigImage.src = (image);
    }
    renderSizes(){
        return(
            <select required name="size" onChange={(e)=>this.handleChange(e)}>
            <option value="">SELECT</option>
            {this.state.clothingData.inventory.xs > 0 ? <option value="xs">XS</option> : <option disabled>XS</option>}
            {this.state.clothingData.inventory.s > 0 ? <option value="s">S</option> : <option disabled>S</option>}
            {this.state.clothingData.inventory.m > 0 ? <option value="m">M</option> : <option disabled>M</option>}
            {this.state.clothingData.inventory.l > 0 ? <option value="l">L</option> : <option disabled>L</option>}
            {this.state.clothingData.inventory.xl > 0 ? <option value="xl">XL</option> : <option disabled>XL</option>}
        </select>
        )
    }

    renderOneSize(){
        return(
            <select required name="size"  onChange={(e)=>this.handleChange(e)}>
            <option value="">SELECT</option>
            <option value="os">One Size</option>
        </select>
        )
    }
    renderShoeSize(){
        return(
            <select required name="size"  onChange={(e)=>this.handleChange(e)}>
            <option value="">SELECT</option>
            <option value="">XS</option>
        </select>
        )
    }

    handleWishlist = (e, data) =>{
        let productId = data.id;
        let productTitle = data.title;
        let productToAdd = this.state.clothingData;
        let likedItem = e.target;
        
        console.log(e, data)
        
        firebase.auth().onAuthStateChanged((user)=>{
            if(user){
                if(localStorage.getItem(productId) === "red"){
                    localStorage.removeItem(productId);
                    likedItem.style.color = "gray";
                    db.collection('users').doc(user.uid).collection('wishlist').doc(productTitle).delete()
                    .then(res=>console.log(res)).catch(err=>(console.log(err)))
                }else{
                    likedItem.style.color = "red";
                    db.collection('users').doc(user.uid).collection('wishlist').doc(productTitle).set({
                        main_image: productToAdd.main_image,
                        title: productTitle,
                        designer: productToAdd.designer,
                        price: productToAdd.price,
                        category: productToAdd.category,
                        description: productToAdd.description,
                        id: productId,
                        designerId: this.state.brandData.id
                    },{merge: true})
                    .then(()=>{
                        localStorage.setItem(productId, "red")
                    })
                    .catch(err=>(console.log(err)))
                }
            }else{
                alert("You must be signed in first to do that!")
            }
        })
    }

    renderAdditonalImages=(clothingData)=>{
        return(
            Object.values(clothingData.additonal_images).map((image, i)=>{
                return(
                    <Image key={i} src={image} />
                )
            })
        )
    }

    renderAdditonalImagesSmall=(clothingData)=>{
        return(
            Object.values(clothingData.additonal_images).map((image, i)=>{
                return(
                    <div className="img" key={i} data-img={image} onClick={(e)=>this.handleImageChange(e.target.dataset.img)} style={{backgroundImage: `url('${image}')`}}>
                    </div> 
                )
            })
        )
    }

    renderPage(){
        if(this.state.clothingData !== false && this.state.clothingDataLoaded !== false){
            const {clothingData, brandData} = this.state;
            return(
                <div className="single-clothing">
                    <div className="page-container ui container">
                        <div className="product-info">
                            <div className="imgHolder">
                                <Modal trigger={<img src={clothingData.main_image} alt={clothingData.description} title={clothingData.title}/>} closeOnDocumentClick={true} closeIcon>
                                    <Modal.Content image>
                                            <Image src={clothingData.main_image} />
                                            {clothingData.hasOwnProperty("additonal_images") ? this.renderAdditonalImages(clothingData) : null}
                                    </Modal.Content>
                                </Modal>
                            </div>
                            <div className="product-text">
                            <div className={this.state.active ? "ui active inverted dimmer" : "ui disabled inverted dimmer"}>
                                <div className="ui indeterminate text loader">Contacting PayPal. If this last longer than a minute refresh the page</div>
                            </div>
                                <Link to={`/designers/${brandData.name}/${brandData.id}`}><h1 className="ui header">{brandData.name}</h1></Link>
                                <h3 className="ui header">{clothingData.title}</h3>
                                <h3 className="ui header">${clothingData.price}</h3>
                                <p className="text"><span id="details">Details: </span>{clothingData.description}</p>
                                <div className="add-to-bag">
                                    <Form required onSubmit={this.handleSubmit}>
                                        <div id="error"></div>
                                        <Form.Group required>
                                            {clothingData.category === 'FOOTWEAR' ? this.renderShoeSize() : clothingData.category === 'ACCESSORIES' ? this.renderOneSize() : this.renderSizes()}
                                        </Form.Group>
                                        <Button secondary id="cart-button" disabled={clothingData.inventory_total <= 0 ? true : false}>{clothingData.inventory_total <= 0 ? "Sold out" : "Checkout with Paypal"}</Button>
                                    </Form>
                                    <Button secondary data-id={clothingData.id} data-title={clothingData.title} onClick={(e)=>this.handleWishlist(e,e.target.dataset)}><i className="like icon"></i> Wishlist</Button>
                                </div>
                                <div className="more-images">
                                    <div className="img" key={clothingData.id} style={{backgroundImage: `url('${clothingData.main_image}')`}} data-img={clothingData.main_image} onClick={(e)=>this.handleImageChange(e.target.dataset.img)}></div> 
                                    {clothingData.hasOwnProperty("additonal_images") ? this.renderAdditonalImagesSmall(clothingData) : null}
                                </div>
                                <Button>Report This Item</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        else if(this.state.clothingDataLoaded === undefined && this.state.loadPage === false){
            return(
                <div className="ui active inverted dimmer">
                    <div className="ui indeterminate text loader">Preparing Files</div>
                </div>
            )
        }else if(this.state.dontLoad === true && this.state.clothingDataLoaded === false){
            return(
                <div className="single-brand">
                    <h1 className="ui header title"> 404 - Page not found</h1>
                    <Link to='/designers'><Button secondary>Check Out Some Designers</Button></Link>
                    <div className="page-container">
                        <img src="" alt=""/>
                    </div>
                </div>
            )
        }
    }

    render(){
        const {redirect, currentPage} = this.state;
        return(
            <section id="single-clothing">
                {redirect ? <Redirect to={currentPage} /> : null}
                {this.renderPage()}
            </section>
        )
    }
}

export default Clothing;