const express = require('express')
const mongoose = require('mongoose')

const Word = mongoose.Schema({
    word:{ type: String, required: true },
    meaning:{ type: String, required : true },
    images:{ type:Array },
    sat:{ type: Boolean, default: false },
    cat:{ type: Boolean, default :false },
    ielts:{ type: Boolean, default :false },
    toefl:{ type: Boolean, default :false },
    plan:{ type: String, maxLength: 1, default: "F" }
})

module.exports = mongoose.model('words', Word);
