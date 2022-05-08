const path = require('path')
require('dotenv').config({path: path.join(__dirname, '.env')})
const PORT = process.env.PORT
const express = require('express')
const cors = require('cors')
const app = express()

// some middleware
app.use(cors)
app.use(express.json())

// testing route
app.get('/', (req, res)=>{
    res.send("API WORKING! SUUUUU!!!")
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