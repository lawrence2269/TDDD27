const mongoose = require('mongoose');

const languagesSchema = mongoose.Schema({
    languages:String
})

module.exports = mongoose.model('languages', languagesSchema);