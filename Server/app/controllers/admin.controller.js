const users = require('../models/users.model.js');
const movies = require('../models/movie.model.js');
const request = require('request');
const apiConfig  = require('../helpers/api.config.js');
const url = require('url');
const requestMovies = require('../models/requestmovies.model.js');

exports.getUsers = (req,res) =>{
    users.find({"_id":{"$ne":1},"status":{"$ne":"inactive"}}).select({"_id":0,"username":1,"email_id":1,"role":1}).lean().exec().then(data=>{
        res.status(200).json({"users":data});
    }).catch(err=>{
        res.status(500).json({"users":"Unable to retrieve list of users"});
    });
}

exports.addMovies = async (req,res) =>{
    movies.find({'title':{'$regex':req.body.title,'$options':'i'}}).count().lean().exec().then(resu=>{
        console.log("Count ======>"+resu)
    })
    if(await movies.find({'title':{'$regex':req.body.title,'$options':'i'}}).countDocuments()!==0){
        res.status(400).json({"message":"Movie already exists"})
    }
    else{
        var movieId = 0;

        await movies.findOne().sort({'_id':-1}).select({"_id":1}).lean().exec().then(id=>{
            movieId = id["_id"]+1;
        }).catch(err=>{
            res.status(500).json({"movieDetails":err.message});
        })

        var movieURL = apiConfig.movieSearchURL+"?api_key="+apiConfig.api_key+"&language="+req.body.language+"&query="+req.body.title+"&include_adult="+true+"&year="+req.body.year;
        request(movieURL,{json:true},(err,resp,body)=>{
            if(body['results'].length>0){
                const movieData = new movies({
                    _id : movieId,
                    title : req.body.title,
                    tmdb_id : body['results'][0]['id'],
                    poster_path : apiConfig.posterPathURL+body['results'][0]['poster_path']
                });

                movieData.save().then(result=>{
                    if(result["_id"]!== " "){
                        requestMovies.deleteOne({"title":req.body.title}).then(result =>{
                            if(!result){
                                res.status(400).json({"message":"Some problem in deletion, but data inserted"});
                            }
                            else{
                                res.status(200).json({"message":"Success"});
                            }
                        })
                    }
                }).catch(err=>{
                    res.status(500).json({"message":"Failure"});
                });
            }
            else{
                res.status(404).json({"message":"No Data"});
            }
        });
    }
}

exports.deleteUser = (req,res) =>{
    users.deleteOne({"username":{"$eq":req.body.username}}).then(result=>{
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