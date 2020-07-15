const movieDetails = require('../models/moviedetails.model.js');
const moviesModel = require('../models/movie.model.js')
const request = require('request');
const apiConfig  = require('../helpers/api.config.js');
const url = require('url');
const requestMovies = require('../models/requestmovies.model.js');
const movieReviews = require('../models/moviereview.model.js');
const Countries = require('../models/countries.model.js');
const languages = require('../models/languages.model.js');
const fetch = require('node-fetch');
const jwtConfig = require('../helpers/jwt.config.js');
var jwt = require('jsonwebtoken');
const e = require('express');

exports.findAll = (req,res) =>{
    movieDetails.find().select({"title":1,"poster_path_s":1,"release_year":1,"genre":1,"adult":1,"rating":1,"_id":0}).sort("title").then(data=>{
        res.status(200).json({"movies":data});
    }).catch(err =>{
        res.status(500).json({"message":"Some problem in fetching movies"});
    });
}

exports.upcomingMovies = (req,res) =>{
    const queryObject = url.parse(req.url,true).query;
    request(apiConfig.upcomingMovieURL+"?api_key="+apiConfig.api_key+"&region="+queryObject['region'],{json:true},(err,resp,body)=>{
        if(body['results'].length>0)
        {
            var upcomingMoviesList = [];
            for(var count = 0;count<body['results'].length;count++){
                if(JSON.stringify(body['results'][count]['poster_path']) != "null"){
                    var upcomingMovies = {};
                    upcomingMovies['title'] = body['results'][count]['title'];
                    upcomingMovies['poster_path'] = apiConfig.posterPathURL+body['results'][count]['poster_path'];
                    splittedDate = body['results'][count]['release_date'].split("-");
                    upcomingMovies['release_year'] = parseInt(splittedDate[0]);
                    upcomingMoviesList.push(upcomingMovies);
                }
            }
            res.status(200).json({"upcomingMovies":upcomingMoviesList});
        }
        else{
            res.status(404).json({"message":"No upcoming movies in your region"});
        }
    });
}

exports.nowPlayingMovies = (req,res) =>{
    const queryObject = url.parse(req.url,true).query;
    request(apiConfig.nowPlayingMovieURL+"?api_key="+apiConfig.api_key+"&region="+queryObject['region'],{json:true},(err,resp,body)=>{
        if(body['results'].length>0){
            var nowPlayingMoviesList = [];
            for(var count = 0;count<body['results'].length;count++){
                if(JSON.stringify(body['results'][count]['poster_path']) != "null"){
                    var nowPlayingMovies = {};
                    nowPlayingMovies['title'] = body['results'][count]['title'];
                    nowPlayingMovies['poster_path'] = apiConfig.posterPathURL+body['results'][count]['poster_path'];
                    splittedDate = body['results'][count]['release_date'].split("-");
                    nowPlayingMovies['release_year'] = parseInt(splittedDate[0]);
                    nowPlayingMoviesList.push(nowPlayingMovies);
                }
            }
            res.status(200).json({"newMovies":nowPlayingMoviesList});
        }
        else
        {
            res.status(404).json({"message":"No new movies being played in your region"});
        }
    });
}

exports.similarMovies = (req,res) =>{
    const queryObject = url.parse(req.url,true).query;
    request(apiConfig.tmdbSimilarMoviesURL+queryObject['tmdb_id']+"/similar?api_key="+apiConfig.api_key,{json:true},(err,resp,body)=>{
        if(body['results'].length>0){
            var similarMoviesList = [];
            for(var count = 0;count<body['results'].length;count++){
                if(JSON.stringify(body['results'][count]['poster_path']) != "null"){
                    var similarMovies = {};
                    similarMovies['title'] = body['results'][count]['title'];
                    similarMovies['poster_path'] = apiConfig.posterPathURL+body['results'][count]['poster_path'];
                    splittedDate = body['results'][count]['release_date'].split("-");
                    similarMovies['release_year'] = parseInt(splittedDate[0]);
                    similarMoviesList.push(similarMovies);
                }
            }
            res.status(200).json({"similarMovies":similarMoviesList});
        }
        else
        {
            res.status(404).json({"similarMovies":"No similar movies available"});
        }
    });
}

exports.popularMovies = (req,res) =>{
    const queryObject = url.parse(req.url,true).query;
    request(apiConfig.popularMovieURL+"?api_key="+apiConfig.api_key+"&region="+queryObject['region'],{json:true},(err,resp,body)=>{
        if(body['results'].length>0){
            var popularoviesList = [];
            for(var count = 0;count<body['results'].length;count++){
                if(JSON.stringify(body['results'][count]['poster_path']) != "null"){
                    var popularMovies = {};
                    popularMovies['title'] = body['results'][count]['title'];
                    popularMovies['poster_path'] = apiConfig.posterPathURL+body['results'][count]['poster_path'];
                    splittedDate = body['results'][count]['release_date'].split("-");
                    popularMovies['release_year'] = parseInt(splittedDate[0]);
                    popularoviesList.push(popularMovies);
                }
            }
            res.status(200).json({"popularMovies":popularoviesList});
        }
        else
        {
            res.status(404).json({"message":"No popular movies is available in your region"});
        }
    });
}

exports.getGenre = (req,res) =>{
    request(apiConfig.genreDetailURL+"?api_key="+apiConfig.api_key,{json:true},(err,resp,body)=>{
        var genreList = [];
        for(var count = 0;count<body['genres'].length;count++){
            genreList.push(body['genres'][count]['name']);
        }
        res.status(200).json({"genres":genreList});
    });
}

exports.createReview = async (req,res) =>{
    var jwtToken = req.headers['access-token'];
    var likes;
    if(jwtToken){
        jwt.verify(jwtToken,jwtConfig.secret_key,async function(err,decoded){
            if(err){
                res.status(400).json({"message":"Failure"});
            }
            else{
                var movieId = 0;

                await movieDetails.find({"title":{"$regex":req.body.title,"$options":"i"}}).select({"_id":1}).lean().exec().then(data =>{
                    movieId = data[0]["_id"];
                });

                if(req.body.likes == "yes"){
                    likes = true;
                }
                else{
                    likes = false;
                }

                const reviewData = new movieReviews({
                    movie_id:movieId,
                    title:req.body.title,
                    author:req.body.username,
                    review:parseFloat(req.body.review),
                    userRating:req.body.rating,
                    likes:likes
                });

                reviewData.save().then(data=>{
                    if(data["_id"]!==" "){
                        res.status(200).json({"message":"Success"});
                    }
                    else{
                        res.status(400).json({"message":"Failure"});
                    }
                }).catch(err=>{
                    res.status(500).json({"message":err.message});
                });
            }
        });
    }
    else{
        res.status(401).json({"message":"Unauthorized access"});
    }
}

exports.getReview = async (req,res) =>{
    const queryObject = url.parse(req.url,true).query;
    if(await movieReviews.find({"title":{"$regex":queryObject['title'],"$options":"i"}}).countDocuments()!=0){
        movieReviews.find({"title":{"$regex":queryObject['title'],"$options":"i"}}).select({"__v":0}).lean().exec().then(data =>{
            res.json({"reviews":data});
        }).catch(err=>{
            res.status(500).json({"reviews":err.message});
        });
    }
    else{
        res.status(404).json({"reviews":"No reviews for this movie"})
    }
}

exports.getReviewById = (req,res) =>{
    var jwtToken = req.headers['access-token'];
    if(jwtToken){
        jwt.verify(jwtToken,jwtConfig.secret_key,async function(err,decoded){
            if(err){
                res.status(400).json({"reviews":"Failure"});
            }
            else{
                movieReviews.find({"_id":req.body.id}).select({"_id":1,"author":1,"review":1,"userRating":1,"likes":1,"__v":0}).lean().exec().then(data=>{
                    res.status(200).json({"reviews":data});
                }).catch(error=>{
                    res.status(500).json({"reviews":err.message});
                });
            }
        });
    }
    else{
        res.status(401).json({"reviews":"Unauthorized access"}); 
    }
}

exports.deleteReview = (req,res)=>{
    var jwtToken = req.headers['access-token'];
    if(jwtToken){
        jwt.verify(jwtToken,jwtConfig.secret_key,async function(err,decoded){
            if(err){
                res.status(400).json({"reviews":"Failure"});
            }
            else{
                movieReviews.deleteOne({"_id":req.body.reviewId}).then(result=>{
                    res.status(200).json({"reviews":"Success"});
                }).catch(err=>{
                    res.status(500).json({"reviews":"Some error occurred."});
                });
            }
        });
    }
    else{
        res.status(401).json({"reviews":"Unauthorized access"});
    }
}

exports.updateReview = (req,res) =>{
    var data = {
        review:req.body.reviewStmt,
        userRating:req.body.userRating,
        likes:req.body.likes
    }

    movieReviews.findByIdAndUpdate(req.body.id,data).exec(function(err,result){
        if(err){
            res.status(500).json({"reviews":"Some error occurred."});
        }
        else{
            res.status(200).json({"reviews":"Success"});
        }
    });
}

exports.getRatings = (req,res) =>{
    const len = Math.floor((10 - 1) / 0.1) + 1;
    var ratings = Array(len).fill().map((_, idx) => 1 + (idx * 0.1));
    var counter = 0;
    while(counter < ratings.length){
        var temp = ratings[counter].toFixed(1).toString();
        var finalTemp = temp.split(".")
        if(finalTemp[1] == 0){
            ratings[counter] = finalTemp[0]
        }
        else{
            ratings[counter] = ratings[counter].toFixed(1).toString();
        }
        counter++;
    }
    res.status(200).json({"ratings":ratings});
}

exports.getYears = (req,res) =>{
    var years = [];
    for(var i = 1960;i<= new Date().getFullYear();i++){
        years.push(i.toString())
    }
    res.status(200).json({"years":years});
}

exports.getCountries = (req,res) =>{
    Countries.find({}).select({"_id":0}).lean().exec(function(err, data){
        if(err){
            res.status(500).send({
                message:err.message || "Some error occurred while retrieving countries."
            });
        }
        else
        {
            res.status(200).json({"countries":data});
        }
    });
}

exports.getLanguages = (req,res) =>{
    languages.find({}).select({"_id":0}).lean().exec(function(err, data){
        if(err){
            res.status(500).send({
                message:err.message || "Some error occurred while retrieving languages."
            });
        }
        else
        {
            let languages = [];
            for(var rec = 0;rec<data.length;rec++){
                languages.push(data[rec])
            }
            res.json({"languages":languages});
        }
    });
}

exports.getMovieDetails = async (req,res) =>{
    const queryObject = url.parse(req.url,true).query;
    if(await movieDetails.find({"title":{"$regex":queryObject['title'],"$options":"i"}}).count()!=0){
        movieDetails.find({"title":{"$eq":queryObject['title']},"release_year":{"$eq":queryObject['year'].toString()}}).select({"_id":0}).lean().exec().then(rec=>{
            res.status(200).json({"movieDetails":rec});
        });
    }
    else
    {
        var movieURL = apiConfig.movieSearchURL+"?api_key="+apiConfig.api_key+"&query="+queryObject['title']+"&include_adult="+true+"&year="+queryObject['year'];
        var result_1 = await fetch(movieURL);
        var tmdbMovieDetails = await result_1.json();
        
        if(tmdbMovieDetails['results'].length != 0){
            var mid = 0;
            var mid_2 = 0;
            await movieDetails.findOne().sort({'_id':-1}).select({"_id":1}).lean().exec().then(id=>{
                mid = id["_id"]+1;
            }).catch(err=>{
                res.status(500).json({"movieDetails":err.message});
            })

            await moviesModel.findOne().sort({'_id':-1}).select({"_id":1}).lean().exec().then(id=>{
                mid_2 = id["_id"]+1;
            }).catch(err=>{
                res.status(500).json({"movieDetails":err.message});
            })

            var title = queryObject['title'];
            var tmdb_id = tmdbMovieDetails['results'][0]["id"];
            if(tmdbMovieDetails['results'][0]["poster_path"]!=null){
                var poster_path = apiConfig.posterPathURL_L+tmdbMovieDetails['results'][0]["poster_path"];
                var poster_path_s = apiConfig.posterPathURL+tmdbMovieDetails['results'][0]["poster_path"];
            }
            else{
                var poster_path = apiConfig.cast_image_url;
                var poster_path_s = apiConfig.cast_image_url;
            }
            
            var rating = tmdbMovieDetails['results'][0]["vote_average"];
            var synopsis = tmdbMovieDetails['results'][0]["overview"];
            var likes = Math.round(tmdbMovieDetails['results'][0]["popularity"]);
            var release_year = queryObject['year'].toString();
            var videoURL = apiConfig.tmdbVideoURL+tmdb_id+"/videos?api_key="+apiConfig.api_key;
            
            var result_2 = await fetch(videoURL)
            var tmdbVideoDetails = await result_2.json();
            var trailerLink = " ";
            var result_3 = await fetch(apiConfig.yifyListMoviesURL+title);
            var yifyMovieDetails = await result_3.json();
            if(tmdbVideoDetails['results'].length!=0){
                trailerLink = apiConfig.youtubeTrailerURL+tmdbVideoDetails['results'][0]['key'];
            }
            else
            {
                if("movies" in yifyMovieDetails['data']){
                    for(var count = 0;count < yifyMovieDetails['data']['movies'].length;count++){
                        if(queryObject['year'] == yifyMovieDetails['data']['movies'][count]['year'] && queryObject['title'] == yifyMovieDetails['data']['movies'][count]['title'])
                        {
                            trailerLink = apiConfig.youtubeTrailerURL+yifyMovieDetails['data']['movies'][count]['yt_trailer_code'];
                        }
                    }
                }
                else
                {
                    trailerLink = " "
                }
            }
            var castList = [];
            var dirList = [];
            var result_4 = await fetch(apiConfig.tmdbMovieDetailsURL+tmdb_id+"?api_key="+apiConfig.api_key+"&append_to_response=credits");
            var movieAPIDetails = await result_4.json();
            var castFlag = true;
            var castId = 0;
            while(castFlag){
                var castDict = {};
                castDict['name'] = movieAPIDetails['credits']['cast'][castId]['name'];
                castDict['character_name'] = movieAPIDetails['credits']['cast'][castId]['character'];
                if(movieAPIDetails['credits']['cast'][castId]['profile_path']!=null){
                    castDict['cast_image_url'] = apiConfig.profilePathURL+movieAPIDetails['credits']['cast'][castId]['profile_path'];
                }
                else{
                    castDict['cast_image_url'] = apiConfig.castImageURL;
                }
                var result_5 = await fetch(apiConfig.peopleProfileURL+movieAPIDetails['credits']['cast'][castId]['id']+"?api_key="+apiConfig.api_key);
                var peopleDetail  = await result_5.json();
                if(peopleDetail['imdb_id']!=null){
                    castDict['imdb_profile_url'] = apiConfig.imdbProfileURL+peopleDetail['imdb_id'];
                }
                else
                {
                    castDict['imdb_profile_url'] = " ";
                }
                castList.push(castDict);
                castId = castId+1;
                if(castId == 4){
                    castFlag = false;
                    break;
                }
            }

            if(movieAPIDetails['credits']['crew'].length!=0){
                for(var count = 0;count<movieAPIDetails['credits']['crew'].length;count++){
                    if(movieAPIDetails['credits']['crew'][count]['job'] == "Director"){
                        var dirDict = {};
                        dirDict['name'] = movieAPIDetails['credits']['crew'][count]['name'];
                        if(movieAPIDetails['credits']['crew'][count]['profile_path']!=null){
                            dirDict['cast_image_url'] = apiConfig.tmdbProfileURL+movieAPIDetails['credits']['crew'][count]['profile_path'];
                        }
                        else{
                            dirDict['cast_image_url'] = apiConfig.castImageURL;
                        }
                        var result_6 = await fetch(apiConfig.peopleProfileURL+movieAPIDetails['credits']['crew'][count]['id']+"?api_key="+apiConfig.api_key);
                        var peopleDetail  = await result_6.json();
                        if(peopleDetail['imdb_id']!=null){
                            dirDict['imdb_profile_url'] = apiConfig.imdbProfileURL+peopleDetail['imdb_id'];
                        }
                        else
                        {
                            dirDict['imdb_profile_url'] = " ";
                        }
                        dirList.push(dirDict);
                    }
                }
            }
            var imdb_id = ' ';
            if("movies" in yifyMovieDetails['data']){
                imdb_id = apiConfig.imdb_URL+yifyMovieDetails['data']['movies'][0]['imdb_code']+"/";
            }
            else
            {
                if("imdb_id" in movieAPIDetails){
                    imdb_id = apiConfig.imdb_URL+movieAPIDetails['imdb_id']+"/";
                }
                else
                {
                    imdb_id = " ";
                }
            }

            var genre = [];
            var genre_temp = tmdbMovieDetails['results'][0]['genre_ids'];
            var result_7 = await fetch(apiConfig.genreDetailURL+"?api_key="+apiConfig.api_key)
            var genreDetails = await result_7.json();

            for(var count1 = 0;count1<genre_temp.length;count1++){
                for(var count2 = 0;count2<genreDetails['genres'].length;count2++){
                    if(genreDetails['genres'][count2]['id'] == genre_temp[count1]){
                        genre.push(genreDetails['genres'][count2]['name']);
                    }
                }
            }
            var adultContent = " ";
            if(tmdbMovieDetails['results'][0]['adult'] == false){
                adultContent = "No";
            }
            else
            {
                adultContent = "Yes";
            }
            var runtime = 0;
            if(movieAPIDetails['runtime'] == 0){
                if("movies" in yifyMovieDetails['data']){
                    for(var count = 0;count < yifyMovieDetails['data']['movies'].length;count++){
                        if(queryObject['year'] == yifyMovieDetails['data']['movies'][count]['year'] && queryObject['title'] == yifyMovieDetails['data']['movies'][count]['title'])
                        {
                            runtime = yifyMovieDetails['data']['movies'][count]['runtime']
                        }
                    }
                }
                else{
                    runtime = 0;
                }
            }

            const movieData = new moviesModel({
                _id:mid_2,
                tmdb_id:tmdb_id,
                title:title,
                poster_path:poster_path_s,
                release_year:release_year
            });
            
            const movieDetailsData = new movieDetails({
                _id : mid,
                tmdb_id:tmdb_id,
                title : title,
                poster_path_s:poster_path_s,
                poster_path:poster_path,
                cast:castList,
                directors:dirList,
                adult:adultContent,
                genre:genre.join(" / "),
                rating:rating,
                synopsis:synopsis,
                likes:likes,
                trailer:trailerLink,
                release_year:release_year,
                imdb_id:imdb_id,
                runtime:runtime
            });

            movieData.save().then(result1=>{
                movieDetailsData.save().then(result2 =>{
                    res.status(200).json({"movieDetails":result2})
                }).catch(err=>{
                    res.status(500).json({"movieDetails":err.message})
                });
            }).catch(err=>{
                res.status(500).json({"movieDetails":err.message})
            });
        }
        else{
            res.status(404).json({"movieDetails":"Movie is not available"}); 
        }
    }
}

