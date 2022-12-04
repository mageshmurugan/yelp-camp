// const { Schema, model } = require("mongoose");
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const OtpSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true,

    },
    createAt: { type: Date, default: Date.now, index: { expires: 300 } }
}, { timestamps: true })
OtpSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Otp', OtpSchema);


// module.exports.Otp = model('Otp', Schema({
//     number: {
//         type: String,
//         required: true
//     },
//     otp: {
//         type: String,
//         required: true
//     },
//     createAt: { type: Date, default: Date.now, index: { expires: 300 } }
// }, { timestamps: true }))