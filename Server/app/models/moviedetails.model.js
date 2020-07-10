const mongoose = require('mongoose');

const movieDetailsSchema = mongoose.Schema({
    _id:Number,
    tmdb_id:Number,
    title:String,
    poster_path_s:String,
    poster_path:String,
    cast:Array,
    directors:Array,
    adult:String,
    genre:String,
    rating:String,
    synopsis:String,
    likes:Number,
    trailer:String,
    release_year:String,
    imdb_id:String,
    runtime:Number
});

module.exports = mongoose.model('moviedetails', movieDetailsSchema);