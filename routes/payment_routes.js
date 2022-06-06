const path = require('path')
require('dotenv').config({path: path.join(__dirname, '.env')})
const router = require('express').Router()
const axios = require('axios')
const User = require('../models/user')
const Plan = require('../models/plans')
const IdGen = require('randomstring')

// route to add payment plans
router.post('/addPlan', async (req, res)=>{
    // getting the data from the 
    // request body
    const planName = req.body.planName
    const numWords = req.body.numWords
    const price = req.body.price
    const points = req.body.points  
    // defining some constants and required vars
    const bullet = ' \u2022 '
    let aggPoints = ''
    for(let i = 0; i < points.length; i++){
        aggPoints += bullet + points[i]
    }
    // try clause to catch any errors while
    // saving the new plan
    try{
        // creating the object to save
        const plan = new Plan({
            planName: planName,
            numWords: numWords,
            price: price,
            points: aggPoints
        })
        // saving the payment plan
        const newPlan = await plan.save()
        // sending the response
        res.json(newPlan)
    }catch(error){
        res.json(error)
    }
})

// route to get payment plans
router.get('/getPlans', async (req, res)=>{
    // simply getting the payment plans
    const plans = await Plan.find()
    res.json(plans)
})

// route to generate an order
router.post('/orderGen', async (req, res)=>{    
    // getting the username from request body
    // and generating query
    const query = {username: req.body.username}
    const user = await User.findOne(query)
    const price = req.body.price
    // generating receipt id
    const rid = IdGen.generate({
        length: 10,
        charset: 'alphanumeric'
    })
    // creating data to send to the request
    var data = JSON.stringify({
        receipt: rid,
        amount: price,
        currency: "INR",
        notes: {
            "name": user.first_n + " " + user.last_n,
            "email": user.email
        }
    });
    // configurations for the request
    const config = {
    method: 'post',
    url: 'https://api.razorpay.com/v1/orders',
    headers: { 
        'Authorization': process.env.RZPAY_AUTH, 
        'Content-Type': 'application/json'
    },
    data : data
    };
    // creating an order (will be reflected in Razorpay) 
    axios(config)
    .then(function (response) {
        // creating new fields for name and email
        let orderInfo = {}
        orderInfo.id = response.data.id
        orderInfo.receipt = response.data.receipt
        orderInfo.amount = response.data.amount
        orderInfo.status = response.data.status
        orderInfo.name = response.data.notes.name
        orderInfo.email = response.data.notes.email
        console.log(JSON.stringify(orderInfo));
        // sending the response of the generated order
        res.status(201).json(orderInfo)
    })
    .catch(function (error) {
        console.log(error);
        // sending the response for error
        res.json(error)
    });
})

module.exports = router