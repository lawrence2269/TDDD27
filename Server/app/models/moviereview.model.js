const mongoose = require('mongoose');

const movieReviewsSchema = mongoose.Schema({
    movie_id:Number,
    title:String,
    author:String,
    review:String,
    userRating:Number,
    likes:Boolean,
    createdAt:{ type : Date, default: Date.now }
});

module.exports = mongoose.model('reviews', movieReviewsSchema);