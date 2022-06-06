// model for payment plans
// all the fields required for 
const mongoose = require('mongoose')

const Plans = mongoose.Schema({
    planName: { type: String, required: true},
    numWords: { type: String, required: true},
    price: { type: String, required: true},
    points: { type: String, required: true}
})

Plans.pre('save', async function(next){
    try{
        const rzpayPrice = await this.price + "00"
        this.price = rzpayPrice
    }catch(e){
        next(e)
    }
})

module.exports = mongoose.model('plans', Plans)