const users = require('../models/users.model.js');
const countries = require('../models/countries.model.js');
var jwt = require('jsonwebtoken');
const jwtConfig = require('../helpers/jwt.config.js');
var passwordHash = require('password-hash');

exports.login = async (req,res) =>{
    if(await users.find({'email_id':req.body.loginEmail}).countDocuments()!==0){
        users.find({'email_id':{"$eq":req.body.loginEmail}}).select({"_id":0,"email_id":1,"password":1,"role":1,"username":1,"country":1}).lean().exec().then(data=>{
            if(passwordHash.verify(req.body.password,data[0]['password'])){
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

        await countries.find({"countryName":{"$regex":req.body.country,"$options":"i"}}).select({"countryCode":1,"_id":0}).lean().exec().
        then(data=>{
            countryCode = data[0]['countryCode'];
        }).catch(err=>{
            console.log(err);
        })

        const user = new users({
            _id : uid,
            username : req.body.name,
            gender : req.body.gender,
            dateofbirth : req.body.dateofbirth.toString(),
            email_id : req.body.email,
            country : countryCode,
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
    var uid = 0;
    await users.find({'email_id':req.body.email}).select({"_id":1}).lean().exec().then(data=>{
        uid = data[0]["_id"]
    }).catch(err=>{
        console.log(err)
    })
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
            res.status(200).json({"message":"Password changed successfully"});
        }
    });
}

exports.deactivateUser = async (req,res) =>{
    var status = "inactive";
    var uid = 0;

    await users.find({'email_id':req.body.email}).select({"_id":1}).lean().exec().then(data=>{
        uid = data[0]["_id"]
    }).catch(err=>{
        console.log(err)
    })

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