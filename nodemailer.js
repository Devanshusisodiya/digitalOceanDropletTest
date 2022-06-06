const path = require('path')
require('dotenv').config({path: path.join(__dirname, '.env')})
const nodemailer = require('nodemailer')

var transport = nodemailer.createTransport({
    host: 'mail.lltes.com',
    secure: true,
    secureConnection: true,
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

module.exports = transport