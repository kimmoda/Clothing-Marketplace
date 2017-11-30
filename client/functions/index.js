/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const functions = require('firebase-functions');
// CORS Express middleware to enable CORS Requests.
const cors = require('cors')({origin: true});
const paypal = require('paypal-rest-sdk');
// firebase-admin SDK init
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
// Configure your environment
paypal.configure({
  mode: 'sandbox', // sandbox or live
  client_id: "AVBubSe8JWx0VCQ_ngq3XXuN584uhLYCRUvm7Q4slkM454Snia7KFTWwGevdkr5KKpHnGxozsF9xw2tY", // run: firebase functions:config:set paypal.client_id="yourPaypalClientID" 
  client_secret: "EO3hgmGhkqw73Tn4UIXUJGr67tyrKo89AD9Dyc8K6SxdsV6GWYh-bVjM3aYb90NZjwC1wSjklaxFsBuJ" // run: firebase functions:config:set paypal.client_secret="yourPaypalClientSecret"
});

/**
 * Expected in the body the amount
 * Set up the payment information object
 * Initialize the payment and redirect the user to the PayPal payment page
 */
exports.pay = functions.https.onRequest((req, res) => {
  // 1.Set up a payment information object, Nuild PayPal payment request
  const payReq = JSON.stringify({
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: `https://streetwearboutiques.com/profile/process`,
      cancel_url: `https://streetwearboutiques.com/profile`
    },
    transactions: [{
      "amount": {
        "total": req.body.total,
        "currency": "USD",
        "details": {
          "subtotal": req.body.cost,
          "tax": '0.00',
          "shipping": req.body.shipping,
        },
      },
      // This is the payment transaction description. Maximum length: 127
      description: `Purchase on Streetwear Boutiques from ${req.body.designer}, email: ${req.body.paypal_email}`,
          item_list: {
            items: [{
              currency: 'USD',
              name: req.body.title,
              price: req.body.cost,
              quantity: 1,
              sku: req.body.id,
              description: (req.body.size, req.body.designer, req.body.designer_id),
            }]
          },
          // reference_id string .Optional. The merchant-provided ID for the purchase unit. Maximum length: 256.
          // reference_id: req.body.uid,
          custom: req.body.id,
          // soft_descriptor: req.body.designer_id
        }]
      });

      
      cors(req, res, () => {
      
      // 2.Initialize the payment and redirect the user.
    paypal.payment.create(payReq,{'Access-Control-Allow-Origin': 'https://streetwearboutiques.com'}, 
    (error, payment) => {
      const links = {};
      if (error) {
        console.error(error);
            res.status('500').end();
      }
      else {
        // Capture HATEOAS links
        payment.links.forEach((linkObj) => {
          links[linkObj.rel] = {
            href: linkObj.href,
            method: linkObj.method
          };
        });
        // If redirect url present, redirect user
        if (links.hasOwnProperty('approval_url')) {
            // REDIRECT USER TO links['approval_url'].href
            console.info(links.approval_url.href);
            // res.json({"approval_url":links.approval_url.href});
            // res.redirect(links['approval_url'].href)
            
              // res.redirect(302, links['approval_url'].href);
              res.send(links['approval_url'].href)
        } 
        else {
          console.error('no redirect URI present');
          res.status('500').end();
        }
      }
    });
  });
});

// 3.Complete the payment. Use the payer and payment IDs provided in the query string following the redirect.
exports.process = functions.https.onRequest((req, res) => {
  const paymentId = req.query.paymentId;
  const payerId = {
    payer_id: req.query.PayerID
  };
  paypal.payment.execute(paymentId, payerId, (error, payment) => {
    if (error) {
      console.error(error);
      res.redirect(`https://streetwearboutiques.com/profile/error`); // replace with your url page error
    } else {
      if (payment.state === 'approved') {
        console.info('payment completed successfully, description: ', payment.transactions[0].description);
        console.info('req.custom: : ', payment.transactions[0].custom);
        // set paid status to True in RealTime Database
        const date =Date().toString();
        const uid = payment.transactions[0].custom;
        const ref = admin.firestore().collection('payments').doc(Date().toString()).collection(uid);

        ref.add({
          'paid': true,
          'amount': payment.transactions[0].amount,
          'description': uid,
          'product': payment.transactions[0].item_list.items[0],
          'person-that-paid': payerId.payer_id,
          'date': date
        }).then(r => console.info('promise: ', r));
        res.redirect(`https://streetwearboutiques.com/profile/process`); // replace with your url, page success
      } else {
        console.warn('payment.state: not approved ?');
        // replace debug url
        res.redirect(`https://console.firebase.google.com/project/${process.env.GCLOUD_PROJECT}/functions/logs?search=&severity=DEBUG`);
      }
    }
  });
});