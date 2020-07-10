const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
    _id:Number,
    username:String,
    gender:String,
    dateofbirth:String,
    email_id:String,
    country:String,
    password:String,
    role:String,
    status:String,
    created_at:{ type : Date, default: Date.now }
});

module.exports = mongoose.model('users', usersSchema);