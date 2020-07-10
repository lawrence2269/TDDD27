const mongoose = require('mongoose');

const moviesSchema = mongoose.Schema({
    _id:Number,
    title:String,
    tmdb_id:Number,
    poster_path:String,
    release_year:Number
});

module.exports = mongoose.model('movies', moviesSchema);