// adding dependencies
const path = require('path')
require('dotenv').config({path: path.join(__dirname, '.env')})
const PORT = process.env.PORT
const ATLAS = process.env.ATLAS_URI
const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const app = express()
const user_routes = require('./routes/user_routes')
const word_routes = require('./routes/word_routes')
const payment_routes = require('./routes/payment_routes')

// connecting to the database
mongoose.connect(
    ATLAS,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)
const db = mongoose.connection
db.on('err', (err)=>{console.log(err.message)})
db.once('open', ()=>{console.log("Connected to the Database")})

// some middleware
app.use(cors())
app.use(express.json())
app.use('/user', user_routes)
app.use('/word', word_routes)
app.use('/payment', payment_routes)

// generic testing route
app.get('/:text', (req, res)=>{
    res.json(req.params.text)
    console.log("test route accessed.")
})

// starting the event loop
app.listen(PORT, (err)=>{
    if(!err){
        console.log("api running!!!")   
    }else{
        console.log(err)
    }
})