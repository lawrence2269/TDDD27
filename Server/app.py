from flask import Flask,jsonify,request
from flask_restful import Resource,Api
from flask_pymongo import PyMongo
from flask_cors import CORS
import json
import requests
from datetime import datetime
import tmdbAPI as tm

app = Flask(__name__)
CORS(app)
app.config['MONGO_URI'] = 'mongodb+srv://swmdb:swmdb12345@swmdb-ezh2o.mongodb.net/SWMDB?retryWrites=true&w=majority'
app.config['MONGO_DBNAME'] = 'SWMDB'
api = Api(app)

mongo = PyMongo(app)

class Countries(Resource):
    def get(self):
        countries_collection = mongo.db.countries
        countries_records = countries_collection.find({})
        countries = [country['countryName'] for country in countries_records]
        return jsonify({"countries":countries})

class createUser(Resource):
    def post(self):
        data = request.get_json()
        users_collection = mongo.db.users
        if(users_collection.find({'email_id':data['email']}).count()!=0):
            return jsonify({"message":False})
        else:
            userData = {}
            _id = [user['_id'] for user in users_collection.find().sort("_id",-1).limit(1)][0]
            userData['_id'] = _id+1
            userData['name'] = data['name']
            userData['gender'] = data['gender']
            userData['dateofbirth'] = str(data['dateofbirth'])[:10]
            userData['email_id'] = data['email']
            userData['country'] = data['country']
            userData['password'] = data['password']
            userData['role'] = 'user'
            userData['created_at'] = datetime.now(tz=None)
            result = users_collection.insert_one(userData)
            if(result.acknowledged == True):
                return jsonify({"message":"Success"}), 201
            else:
                return jsonify({"message":"Failure"}), 401
#
class getUser(Resource):
    def get(self):
        users_collection = mongo.db.users
        userData = []
        user_Cursor = users_collection.find({"_id":{"$ne":1}},{"_id":1,"name":1,"gender":1,"email_id":1,"role":1})
        for users in user_Cursor:
            userData.append(users)
        return jsonify({"users":userData})
#
class getMovies(Resource):
    def get(self):
        movie_collection = mongo.db.movies
        movie_records = movie_collection.find({})
        movies = [movie for movie in movie_records]
        return jsonify({"movies":movies})

class addMovies(Resource):
    def post(self):
        data = request.get_json()
        movies_collection = mongo.db.movies
        if(movies_collection.find({'title':{'$regex':data['title'],'$options':'i'}}).count()!=0):
            return jsonify({"message":"Movie :"+data['title']+" already exists"})
        else:
            movieSearchURL = tm.movieSearchURL+"&query={}&include_adult={}&year={}".format(data['title'],True,data['year'])
            movieDetails = json.loads(json.dumps(requests.get(movieSearchURL).json()))
            if(len(movieDetails['results'])!=0):
                movieData = {}
                movieData["_id"] = [movie['_id'] for movie in movies_collection.find().sort("_id",-1).limit(1)][0]+1
                movieData["tmdb_id"] = movieDetails['results'][0]["id"]
                movieData["title"] = data['title']
                movieData["poster_path"] = tm.posterPathURL.format(movieDetails['results'][0]['poster_path'])
                result = movies_collection.insert_one(movieData)
                return jsonify({"message":"success"})
            else:
                return jsonify({"message":"failure"})

api.add_resource(Countries,'/countries')
api.add_resource(createUser,'/createuser')
api.add_resource(getUser,'/admin/users')
api.add_resource(getMovies,'/movies')
api.add_resource(addMovies,'/admin/addmovies')

app.run(port=5000, debug=True)
