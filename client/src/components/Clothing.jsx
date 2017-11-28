import React, { Component } from 'react';
import {Link, Redirect} from 'react-router-dom';
import {Button, Form, Select, Image, Modal, Message} from 'semantic-ui-react';

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
        }
    }

    componentWillMount() {
        let brandID = Number(this.props.match.params.brand_id);
        let productTitle = this.props.match.params.product_title;
        let productID = Number(this.props.match.params.id);
        let brandRef = db.collection('brands').where('id', "==", brandID);
        let brandData = {};
        let productData = {};
        let brandUID = undefined;

        brandRef.get().then((res)=>{
            console.log(res)
            if(res.empty){
                this.setState({
                    clothingData: false,
                    dontLoad: true,
                    clothingDataLoaded: false
                })
            }else{
                res.forEach((res)=>{
                    brandUID = res.id;
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
        console.log("dog")
    }

    handleSubmit = (e) => {
        console.log("cat")
    }

    handleImageChange=(image)=>{
       let bigImage = document.querySelector('div.imgHolder img');

       bigImage.src = (image);
    }
    renderSizes(){
        return(
            <select required name="size" onChange={this.handleChange}>
            <option value="">SELECT</option>
            <option value="xs">XS</option>
            <option value="s">S</option>
            <option value="m">M</option>
            <option value="l">L</option>
            <option value="xl">XL</option>
        </select>
        )
    }

    renderOneSize(){
        return(
            <select required name="size" onChange={this.handleChange}>
            <option value="">SELECT</option>
            <option value="oneSize">One Size</option>
        </select>
        )
    }
    renderShoeSize(){
        return(
            <select required name="size" onChange={this.handleChange}>
            <option value="">SELECT</option>
            <option value="">XS</option>
        </select>
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
                                            {Object.values(clothingData.additonal_images).map((image, i)=>{
                                                return(
                                                    <Image key={i} src={image} />
                                                )
                                            })}
                                    </Modal.Content>
                                </Modal>
                            </div>
                            <div className="product-text">
                                <Link to={`/designers/${brandData.name}/${brandData.id}`}><h1 className="ui header">{brandData.name}</h1></Link>
                                <h3 className="ui header">{clothingData.title}</h3>
                                <h3 className="ui header">${clothingData.price}</h3>
                                <p className="text"><span id="details">Details: </span>{clothingData.description}</p>
                                <div className="add-to-bag">
                                    <Form onSubmit={this.handleSubmit}>
                                        <Form.Group required>
                                            {clothingData.category === 'FOOTWEAR' ? this.renderShoeSize() : clothingData.category === 'ACCESSORIES' ? this.renderOneSize() : this.renderSizes()}
                                        </Form.Group>
                                        <Button secondary>Add to Cart</Button>
                                        <Button secondary><i className="like icon"></i> Wishlist</Button>
                                    </Form>
                                </div>
                                <div className="more-images">
                                    <div className="img" key={clothingData.id} style={{backgroundImage: `url('${clothingData.main_image}')`}} data-img={clothingData.main_image} onClick={(e)=>this.handleImageChange(e.target.dataset.img)}></div> 
                                    {Object.values(clothingData.additonal_images).map((image, i)=>{
                                        return(
                                            <div className="img" key={i} data-img={image} onClick={(e)=>this.handleImageChange(e.target.dataset.img)} style={{backgroundImage: `url('${image}')`}}>
                                            </div> 
                                        )
                                    })}
                                </div>
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