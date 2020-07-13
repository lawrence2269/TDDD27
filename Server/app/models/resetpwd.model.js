const mongoose = require('mongoose');

const resetPwdSchema = mongoose.Schema({
    email_id:String,
    otp:Number,
    created_at:{ type : Date, default: Date.now }
});

module.exports = mongoose.model('resetpwd', resetPwdSchema);