const users = require('../models/users.model.js');
const countries = require('../models/countries.model.js');
var jwt = require('jsonwebtoken');
const jwtConfig = require('../helpers/jwt.config.js');
var passwordHash = require('password-hash');
const requestMovies = require('../models/requestmovies.model.js');

exports.login = async (req,res) =>{
    if(await users.find({'email_id':req.body.loginEmail}).countDocuments()!==0){
        users.find({'email_id':{"$eq":req.body.loginEmail}}).select({"_id":1,"email_id":1,"password":1,"role":1,"username":1,"country":1,"status":1}).lean().exec().then(data=>{
            if(passwordHash.verify(req.body.password,data[0]['password'])){
                if(data[0]['status'] == "inactive"){
                    var userData = {
                        status : "active"
                    }
                    users.findByIdAndUpdate(data[0]['_id'],userData).lean().exec(function(err,result){
                        if(err){
                            res.status(500).json({"message":err});
                        }
                        else
                        {
                            var token = jwt.sign({id:data[0]['username']},jwtConfig.secret_key,{
                                expiresIn:86400 //expires in 24 hours
                            });
                            var result = {};
                            result['username'] = data[0]['username'];
                            result['countryCode'] = data[0]['country'];
                            result['token'] = token;
                            result['role'] = data[0]['role'];
                            result['message'] = "Success";
                            res.status(200).json({"userData":result});
                        }
                    });   
                }
                else{
                    var token = jwt.sign({id:data[0]['username']},jwtConfig.secret_key,{
                        expiresIn:86400 //expires in 24 hours
                    });
                    var result = {};
                    result['username'] = data[0]['username'];
                    result['countryCode'] = data[0]['country'];
                    result['token'] = token;
                    result['role'] = data[0]['role'];
                    result['message'] = "Success";
                    res.status(200).json({"userData":result});
                }
            }
            else{
                var result = {};
                result['message'] = "Invalid Credentials";
                res.status(401).json({"userData":result});
            }
        }).catch(err=>{
            res.status(500).json({"userData":"Some error occurred"});
        });
    }
    else{
        var result = {};
        result['message'] = "User doesn't exist, please register";
        res.status(404).json({"userData":result});
    }
}

exports.create = async (req,res) =>{
    var countryCode = " ";
    var uid = 0;
    if(await users.find({'email_id':req.body.email}).countDocuments() ==0 || await users.find({'username':req.body.name}).countDocuments()==0){
        await users.findOne().sort({'_id':-1}).select({"_id":1}).lean().exec().then(id=>{
            uid = id["_id"]+1;
        }).catch(err=>{
            res.status(500).json({"movieDetails":err.message});
        })
        
        const user = new users({
            _id : uid,
            username : req.body.name,
            gender : req.body.gender,
            dateofbirth : req.body.dateofbirth.toString(),
            email_id : req.body.email,
            country : req.body.country,
            password : passwordHash.generate(req.body.password),
            role : "user",
            status : "active"
        });

        user.save().then(data =>{
            res.status(200).json({"message":"Success"})
        }).catch(err=>{
            res.status(500).json({"message":"Some problem while creating account"});
        });
    }
    else{
        res.status(400).json({"message":"Record already exists"});
    }
}

exports.changePassword = async (req,res) =>{
    var jwtToken = req.headers['access-token'];
    if(jwtToken){
        jwt.verify(jwtToken,jwtConfig.secret_key,async function(err,decoded){
            if(err){
                res.status(400).json({"message":"Failure"});
            }
            else{
                var uid = 0;
                await users.find({'email_id':req.body.email}).select({"_id":1,"password":1}).lean().exec().then(data=>{
                    if(passwordHash.verify(req.body.password,data[0]["password"])){
                        res.status(409).json({"message":"New and old password are the same."});
                    }
                    else{
                        uid = data[0]["_id"];
                        var newPassword = passwordHash.generate(req.body.password);
                        var data = {
                            password : newPassword
                        }
                        users.findByIdAndUpdate(uid,data).lean().exec(function(err,result){
                            if(err){
                                res.status(500).json({"message":err});
                            }
                            else
                            {
                                res.status(200).json({"message":"Password changed successfully."});
                            }
                        });
                    }
                }).catch(err=>{
                    res.status(500).json({"message":err});
                });
            }
        });
    }
    else{
        res.status(401).json({"message":"Unauthorized access"});
    }
}

exports.deactivateUser = async (req,res) =>{
    var jwtToken = req.headers['access-token'];
    if(jwtToken){
        jwt.verify(jwtToken,jwtConfig.secret_key,async function(err,decoded){
            if(err){
                res.status(400).json({"message":"Failure"});
            }
            else{
                var status = 'inactive';
                var uid = 0
                var tempStatus = " ";

                await users.find({'email_id':req.body.email}).select({"_id":1,"status":1}).lean().exec().then(data=>{
                    uid = data[0]["_id"]
                    tempStatus = data[0]["status"];
                }).catch(err=>{
                    res.status(500).json({"message":err});
                });

                var data = {
                    status : status
                }

                users.findByIdAndUpdate(uid,data).lean().exec(function(err,result){
                    if(err){
                        res.status(500).json({"message":err});
                    }
                    else
                    {
                        res.status(200).json({"message":"User's account deactivated successfully"});
                    }
                });
            }
        });
    }
    else{
        res.status(401).json({"message":"Unauthorized access"});
    }
}

exports.requestMovie = async (req,res) =>{
    var jwtToken = req.headers['access-token'];
    if(jwtToken){
        jwt.verify(jwtToken,jwtConfig.secret_key,async function(err,decoded){
            if(err){
                res.status(400).json({"message":"Failure"});
            }
            else{
                if(await requestMovies.find({"title":{"$regex":req.body.title,'$options':'i'}}).countDocuments() == 0){
                    const data = new requestMovies({
                        userId : req.body.emailId,
                        title : req.body.title,
                        release_year : req.body.releaseYear,
                        language : req.body.movieLanguage,
                        region : req.body.countryReleased
                    });
            
                    data.save().then(result=>{
                        if(result["_id"] != ''){
                            res.status(200).json({"message":"Success"});
                        }
                        else{
                            res.status(400).json({"message":"Failure"});
                        }
                    }).catch(err =>{
                        res.status(500).json({"message":"Failure"});
                    })
                }
                else{
                    res.status(409).json({"message":"Record already exists"});
                }
            }
        });
    }
    else{
        res.status(401).json({"message":"Unauthorized access"});
    }
}