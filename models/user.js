const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const User = mongoose.Schema({
    username:{ type : String, required : true },
    password:{ type : String, required : true },
    email:{ type : String, required : true },
    verified:{ type: Boolean, default:false },
    p_verified:{ type: Boolean, default:false },
    first_n:{ type: String, required : true },
    last_n:{ type: String, required : true },
    sat:{ type: Boolean, default: false, required: false },
    cat:{ type: Boolean, default :false, required: false },
    ielts:{ type: Boolean, default :false, required: false },
    toefl:{ type: Boolean, default :false, required: false },
    subs:{ type:Boolean, default: false },
    phone:{ type:Number, required: false },
    status: { type: String, default: "F", maxLength: 1}
})

User.pre('save',async function(next){
    try{
        const hashedPassword = await bcrypt.hash(this.password,10)
        this.password = hashedPassword
    }
    catch(e){
        next(e)
    }
    
})
module.exports = mongoose.model('users', User);