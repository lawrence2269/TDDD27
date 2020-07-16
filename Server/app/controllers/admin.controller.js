const users = require('../models/users.model.js');
const movies = require('../models/movie.model.js');
const request = require('request');
const apiConfig  = require('../helpers/api.config.js');
const url = require('url');
const requestMovies = require('../models/requestmovies.model.js');
const movieDetails = require('../models/moviedetails.model.js');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');

exports.getUsers = (req,res) =>{
    users.find({"role":{"$eq":"user"},"status":{"$ne":"inactive"}}).select({"_id":1,"username":1,"email_id":1}).sort({"_id":1}).lean().exec().then(data=>{
        res.status(200).json({"users":data});
    }).catch(err=>{
        res.status(500).json({"users":"Unable to retrieve list of users"});
    });
}

exports.getMovieRequests = (req,res) =>{
    requestMovies.find({}).lean().exec().then(data=>{
        res.status(200).json({"requestedMovies":data});
    }).catch(err=>{
        res.status(500).json({"users":"Unable to retrieve list of movie requests."});
    });
}

exports.addMovies = async (req,res) =>{
    if(await movies.find({'title':{'$regex':req.body.title,'$options':'i'}}).countDocuments()!==0){
        res.status(400).json({"message":"Movie already exists"})
    }
    else{
        var movieURL = apiConfig.movieSearchURL+"?api_key="+apiConfig.api_key+"&query="+req.body.title+"&include_adult="+true+"&year="+req.body.year;
        var result_1 = await fetch(movieURL);
        var tmdbMovieDetails = await result_1.json();
        
        if(tmdbMovieDetails['results'].length != 0){
            var mid = 0;
            var mid_2 = 0;

            await movies.findOne().sort({'_id':-1}).select({"_id":1}).limit(1).lean().exec().then(id=>{
                mid = id["_id"]+1;
            }).catch(err=>{
                res.status(500).json({"message":err.message});
            });

            await movieDetails.findOne().sort({'_id':-1}).select({"_id":1}).limit(1).lean().exec().then(id=>{
                mid_2 = id["_id"]+1;
            }).catch(err=>{
                res.status(500).json({"movieDetails":err.message});
            });

            var title = req.body.title;
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
            var release_year = req.body.year.toString();
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
                        if(release_year == yifyMovieDetails['data']['movies'][count]['year'] && title == yifyMovieDetails['data']['movies'][count]['title'])
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
                        if(release_year == yifyMovieDetails['data']['movies'][count]['year'] && title == yifyMovieDetails['data']['movies'][count]['title'])
                        {
                            runtime = yifyMovieDetails['data']['movies'][count]['runtime']
                        }
                    }
                }
                else{
                    runtime = 0;
                }
            }
            const movieData = new movies({
                _id:mid,
                tmdb_id:tmdb_id,
                title:title,
                poster_path:poster_path_s,
                release_year:release_year
            });

            const movieDetailsData = new movieDetails({
                _id : mid_2,
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
            
            
            movieData.save().then(result1=>
            {
                movieDetailsData.save().then(result2=>{
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                        user: apiConfig.emailId,
                        pass: apiConfig.emailPwd
                        }
                    });
        
                    var mailOptions = {
                        from: apiConfig.emailId,
                        to: req.body.email,
                        subject: 'Movie :'+req.body.title+"-Request-Reg",
                        html: '<h4>Hello!</h4><p>As per your request, the movie '+title+' has been added. Please login and post your likes and reviews.</p><br>'+
                            '<br><b>Regards</b><br>SWMDB Team'
                    };
            
                    requestMovies.deleteOne({"title":{"$eq":req.body.title}}).then(result=>{
                        if(!res){
                            res.status(400).json({"message":"Some problem in deletion"});
                        }
                        else{
                            transporter.sendMail(mailOptions, function(error, info){});
                            res.status(200).json({"message":"Success"});
                        }
                    }).catch(err=>{
                        res.status(500).json({"message":err.message})
                    });
                }).catch(err=>{
                    res.status(500).json({"message":err.message})
                });
            }).catch(err=>{
                res.status(500).json({"message":err.message})
            });
        }
        else{
            res.status(404).json({"message":"Movie is not available"}); 
        }
    }
}

exports.deleteUser = (req,res) =>{
    users.deleteOne({"email_id":{"$eq":req.body.email}}).then(result=>{
        if(!result){
            res.status(400).json({"message":"Some problem in deletion"});
        }
        else{
            res.status(200).json({"message":"Success"});
        }
    }).catch(err=>{
        res.status(500).json({"message":"Failure"});
    })
}