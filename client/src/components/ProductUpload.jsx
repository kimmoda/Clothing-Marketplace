import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';
import {Button, Form} from 'semantic-ui-react';
import ChooseSize from '../options/Sizes';
import ChooseSubCategory from '../options/SubCategories';
import firebase from '../config/firebase';

// Initialize Cloud Firestore through firebase
var db = firebase.firestore();
var storage = firebase.storage();
var storageRef = storage.ref();

class ProductUpload extends Component {
    constructor(props){
        super(props);
        this.state = {
            uploadCount: 0,
            category: false,
            chooseSize: false,
        }
    }

    componentWillMount() {
        firebase.auth().onAuthStateChanged(user=>{
            if(user){
                db.collection('users').doc(user.uid).get()
                .then(res=>{
                    this.setState({currentUser: res.data()})
                }).catch(err=>console.log(err))

                this.setState({
                    uid: user.uid,
                    redirect: false,
                    currentPage: ''
                })

                let brandRef = db.collection("brands").doc(this.state.uid);
                brandRef.get().then((res)=>{
                    if(res.exists && res.data().approved){
                        this.setState({
                            brandStatus: true,
                            brandCreated: true,
                            brandData: res.data(),
                        })
                    }else if(res.exists){
                        this.setState({
                            brandCreated: true
                        })
                    }
                })
            }else{
                this.setState({
                    redirect: true,
                    currentPage: '/account/login'
                }) 
            }
        })
    }

    uploadMainPhoto=(e)=>{
        let imageToUplaod = e.target.files[0];
        console.log(imageToUplaod);
    }

    renderPicPreviews = (e) =>{
        let fileList = e.target.files;
        let picPreview = document.querySelector('#pic-preview ul');
        for(var i = 0; i <fileList.length; i++){
            var file = fileList[i];
            var fileURL = URL.createObjectURL(file);
            var tempListTag = document.createElement('li');
            var tempPic = document.createElement('img');
            var removeIcon = document.createElement('i');

            tempPic.src = fileURL;
            tempPic.dataset.name = file.name;
            tempPic.id = i;
            tempPic.className = 'temp-pic';
            
            tempListTag.appendChild(removeIcon)
            picPreview.appendChild(tempListTag).appendChild(tempPic)
        }
    }

    handleSubmit = (e) =>{
        e.preventDefault();
        var uploadedFiles = document.querySelector('#products_upload').files;
        let imageRef = storageRef.child(`${this.state.uid}/${this.state.title}`);
        let mainImage = document.querySelector("#main_image").files[0];
        let downloadUrl = '';
        let count = 0;
        let itemCount = (Number(this.state.xs) + Number(this.state.s) + Number(this.state.m) + Number(this.state.l) + Number(this.state.xl))
    
        db.collection("brands").doc(this.state.uid).collection("products").doc(this.state.title).set({
            title: this.state.title,
            inventory_total: itemCount,
            designer: this.state.brandData.name,
            price: this.state.price, 
            category: this.state.category,
            sub_category: this.state.sub_category,
            description: this.state.description,
            id: new Date().getTime(),
            created_date: new Date().toString(),
            sold_out: false,
            amount_sold: 0,
            clothing_label: this.state.brandData,
            inventory: {
                xs: this.state.xs,
                s: this.state.s,
                m: this.state.m,
                l: this.state.l,
                xl: this.state.xl,
                os: this.state.os > 0 ? this.state.os :0,
            },
        },{ merge: true })
        .then((res)=>{
            console.log(res)
            imageRef.child(mainImage.name).put(mainImage).then((res)=>{
                console.log(res)
                downloadUrl = res.downloadURL;
                db.collection("brands").doc(this.state.uid).collection("products").doc(this.state.title).set({
                    main_image: downloadUrl
                },{ merge: true })
                .then((res)=>{
                    this.redirectPage()
                })
                .catch(err=>console.log(err))
            })
        }).catch(err=>console.log(err))

        if(uploadedFiles.length > 0){
            for(let i = 0; i < uploadedFiles.length; i++){
                let currentFile = uploadedFiles[i];
                
                imageRef.child(currentFile.name).put(currentFile).then((res)=>{
                    console.log(res)
                    downloadUrl = res.downloadURL;
                    db.collection("brands").doc(this.state.uid).collection("products").doc(this.state.title).set({
                        additonal_images:{
                            [currentFile.name]: downloadUrl
                        }
                    },{ merge: true })
                    .catch(err=>console.log(err))
                }).then(()=>{
                    count++;
                    this.setState({
                        uploadCount: count
                    })
                    console.log(this.state.uploadCount)
                    if(this.state.uploadCount === uploadedFiles.length){
                        console.log("all files uploaded")
                        this.redirectPage()
                    }else{
                        console.log("all files not uploaded")
                    }
                }).catch(err=>console.log(err))
            }
        }
    }

    redirectPage = () =>{
        this.setState({
            redirect: true,
            currentPage: '/profile/brand'
        })
    }

    handleChange = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        let regEx = /[^a-zA-Z0-9_^ (),"-]/gi;
        let filteredWord = '';
        if(e.target.name === 'title'){
            filteredWord = e.target.value.replace(regEx, "");
            e.target.value = filteredWord;
            this.setState({
                title: filteredWord 
            })
        }else{
            this.setState({
                [name]: value
            })
        }
    }

    render(){
        const options = [
            { key: 'm', text: 'Male', value: 'male' },
            { key: 'f', text: 'Female', value: 'female' },
          ];
        const {redirect, currentPage} = this.state;
        return(
            <section id="product-upload">
                {redirect ? <Redirect to={currentPage} /> : null}
                <h1 className="ui header title">Upload A New Product</h1>
                <Form required onSubmit={this.handleSubmit} className="ui form">
                    <Form.Group widths="equal">
                        <Form.Field required>
                            <label>Title</label>
                            <input required="true" name="title" type="text" placeholder="Product Name" onChange={(e)=>this.handleChange(e)}/>
                        </Form.Field>
                        <Form.Field required>
                            <label>Listing Price in USD</label>
                            <input required="true" name="price" type="number" placeholder="USD Price" onChange={(e)=>this.handleChange(e)}/>
                        </Form.Field>
                    </Form.Group>
                    <Form.Group widths="equal">
                        <Form.Field required>
                            <label>Category</label>
                            <select required name="category" type="text" onChange={(e)=>this.handleChange(e)}>
                                <option defaultValue value="">Select Category</option>
                                <option value="OUTERWEAR">OUTERWEAR</option>
                                <option value="TOPS">TOPS</option>
                                <option value="BOTTOMS">BOTTOMS</option>
                                <option value="ACCESSORIES">ACCESSORIES</option>
                            </select>
                        </Form.Field>
                        <Form.Field required>
                            <label>Sub Category</label>
                            <ChooseSubCategory category={this.state.category}  handleChange={(e)=>this.handleChange(e)}/>
                        </Form.Field>
                    </Form.Group>
                    <Form.Group widths="equal">
                        <Form.Field required>
                            <label>Enter Amount Available for each size. If none enter 0. One size is for accessories.</label>
                            <ChooseSize category={this.state.category} handleChange={(e)=>this.handleChange(e)}/>
                        </Form.Field>
                    </Form.Group>
                    <Form.Group widths="equal">
                        <Form.Field required>
                            <label>Product Description</label>
                            <textarea required="true" name="description" rows="2" placeholder="Product Description" onChange={(e)=>this.handleChange(e)}></textarea>
                        </Form.Field>
                    </Form.Group>
                    <Form.Group widths="equal">
                        <Form.Field required>
                            <label>Upload Main Image for Product</label>
                            <input type="file" name="main_image" id="main_image" required onChange={(e)=>this.uploadMainPhoto(e)} />
                            <label>Upload additonal images (recommmended)</label>
                            <input type="file" name="photos" id="products_upload" multiple onChange={(e)=>this.renderPicPreviews(e)} />
                            <div id="pic-preview">
                                <ul>
                                    
                                </ul>
                            </div>
                        </Form.Field>
                    </Form.Group>
                    <Button primary>Create Product</Button>
                </Form>
            </section>
        )
    }
}

export default ProductUpload;