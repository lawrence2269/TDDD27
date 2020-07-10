const mongoose = require('mongoose');

const countriesSchema = mongoose.Schema({
    countries:String
})

module.exports = mongoose.model('countries', countriesSchema);