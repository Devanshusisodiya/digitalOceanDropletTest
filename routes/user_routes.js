const router = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const transport = require('../nodemailer')

// route for new user registration
router.post('/regUser', async (req, res)=>{
    const username = req.body.username
    const user = await User.findOne({username: username})
    if(!user){
        // !user will return true if user is undefined this
        // means that the specified username does not exist and the request for
        // user registration can be processed
        try {
            const newUserDetails = new User({
                username: req.body.username,
                password: req.body.password,
                email: req.body.email,
                first_n: req.body.first_n,
                last_n: req.body.last_n,
                dob: req.body.dob,
                sat: req.body.sat,
                cat: req.body.cat,
                ielts: req.body.ielts,
                toefl: req.body.toefl
            })
            const newUser = await newUserDetails.save()
            // creating a json web token and a 
            // custom url in order to generate a uniquely identifiable link
            // also specifying other email details to send the verification mail
            const token = jwt.sign({_id: newUser._id}, process.env.EMAIL_SECRET)
            const url = `http://localhost:3000/user/verification/${token}`
            const options = {
                from: process.env.EMAIL_USER,
                to: newUser.email,
                subject: 'Vocab Email Verification',
                html: `Click on the link below to verify your account: <a href="${url}"> ${url} <a/>`
            }
            // sending the mail
            let info = await transport.sendMail(options)
            console.log('message sent %s', info.messageId)

            // sending the response
            res.status(201).json({message: 'user created successfuly and verification mail sent'})
        } catch (error) {
            res.status(404).json({message: error.message})
        }
    }else{
        res.status(404).json({message: 'username already exists'})
    }
})

// route for user login
router.post('/login', async (req, res)=>{
    // getting the username and password
    // from the request body
    const username = req.body.username
    const password = req.body.password
    // getting the user so as to get the saved hash
    // to compare with the password in login request
    const user = await User.findOne({username: username})
    if(user){
        // comparing the hash with the body password
        const valid = await bcrypt.compare(password, user.password)
        // if valid means the hash compare returned true
        if(valid){
            res.status(200).json({message: 'logged in successfuly'})
        }else{
            res.status(404).json({message: 'incorrect password'})
        }
    }else{
        // username doesn't exist
        res.status(404).json({message: 'user does not exist'})
    }
})

// route for email verification
router.get('/verification/:token', async (req, res)=>{
    // getting the token to verify the signature
    const token = req.params.token
    // getting the user from the token
    // token signature decode
    const verificationInfo = jwt.verify(
        token,
        process.env.EMAIL_SECRET
    )
    // getting the user id
    // and updating the user verified status
    const updateRes = await User.findByIdAndUpdate(
        verificationInfo._id,
        {
            $set: { "verified": true }
        },
        {
            useFindAndModify: false,
            new: true
        }
    )
    // sending the response
    res.send("Email has been verified!!!")
})

// route to fetch user info
router.post('/userInfoFetch', async (req, res)=>{
    // getting username from request body
    const username = req.body.username
    // querying the user by username
    // and getting projections
    const user = await User.findOne(
        {username: username},
        {
            email: 1,
            first_n: 1,
            last_n: 1,
            sat: 1,
            cat: 1,
            toefl: 1,
            ielts: 1,
            verified: 1, 
            subs: 1}
    )
    if(user){
        // creating map for user info
        const userInfo = {
            username: username,
            email: user.email,
            firstName: user.first_n,
            lastName: user.last_n,
            cat: user.cat,
            sat: user.sat,
            toefl: user.toefl,
            ielts: user.ielts,
            verified: user.verified,
            subscribed: user.subs
        }
        // sending the response
        setTimeout(()=>{res.status(201).json(userInfo)}, 2000)
    }else{
        res.json({message: 'username invalid'})
    }
})

// route to update user subscription
router.put('/updateSubscription', async (req, res)=>{
    // getting username from the request body
    const username = req.body.username
    try{
        // updating the user's
        // subscription status
        const result = await User.updateOne(
            {username: username},
            {
                $set: {subs: true}
            }
        )
        // sending the response
        res.status(204).json(result)
    }catch(err){
        res.json(err)
    }

})

module.exports = router