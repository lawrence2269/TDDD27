const mongoose = require('mongoose');

const requestMoviesSchema = mongoose.Schema({
    title:String,
    language:String,
    userId:String,
    release_year:String,
    region:String
});

module.exports = mongoose.model('movierequests', requestMoviesSchema);