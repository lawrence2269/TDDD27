from flask import Flask,jsonify,request,Response
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
        resp = jsonify({"countries":countries})
        resp.status_code = 200
        #return jsonify({"countries":countries})
        return resp

class Languages(Resource):
    def get(self):
        languages_collection = mongo.db.languages
        languages_records = languages_collection.find({})
        languages = [{"languageCode":language['languageCode'],"languageName":language['languageName']} for language in languages_records]
        return jsonify({"languages":languages})

##### User related services ######

class CreateUser(Resource):
    def post(self):
        data = request.get_json()
        users_collection = mongo.db.users
        if(users_collection.find({'email_id':data['email']}).count()!=0):
            return jsonify({"message":"user already exists"})
        else:
            userData = {}
            _id = [user['_id'] for user in users_collection.find().sort("_id",-1).limit(1)][0]
            userData['_id'] = _id+1
            userData['username'] = data['name']
            userData['gender'] = data['gender']
            userData['dateofbirth'] = str(data['dateofbirth'])
            userData['email_id'] = data['email']
            userData['country'] = data['country']
            userData['password'] = data['password']
            userData['role'] = 'user'
            userData['status'] = 'active'
            userData['created_at'] = datetime.now(tz=None)
            result = users_collection.insert_one(userData)
            if(result.acknowledged == True):
                return jsonify({"message":"Success"})
            else:
                return jsonify({"message":"Failure"})

class GetMovies(Resource):
    def get(self):
        movie_collection = mongo.db.movies
        movie_records = movie_collection.find({})
        movies = [movie for movie in movie_records]
        return jsonify({"movies":movies})

class RequestMovies(Resource):
    def post(self):
        movie_request_collection = mongo.db.movieRequest
        data = request.get_json()
        if(movie_request_collection.find({"title":{"$regex":data['title'],'$options':'i'}}).count()!=0):
            return jsonify({"message":"Record already exists"})
        else:
            requestMovie = {}
            requestMovie["userId"] = data["email_id"]
            requestMovie["title"] = data["title"]
            requestMovie["releaseYear"] = data["releaseYear"]
            requestMovie["language"] = data["language"]
            result = movie_request_collection.insert_one(requestMovie)
            if(result.acknowledged == True):
                return jsonify({"message":"success"})
            else:
                return jsonify({"message":"failure"})

class ChangePassword(Resource):
    def post(self):
        data = request.get_json()
        users_collection = mongo.db.users
        result = users_collection.update_one(
            {"email_id":data["email"]},
            {"$set":{"password":data['password']}}
        )
        if(result.acknowledged == True):
            return jsonify({"message":"success"})
        else:
            return jsonify({"message":"failure"})

class DeactivateUser(Resource):
    def post(self):
        data = request.get_json()
        users_collection = mongo.db.users
        result = users_collection.update_one(
            {"email_id":data["email"]},
            {"$set":{"status":"inactive"}}
        )
        if(result.acknowledged == True):
            return jsonify({"message":"success"})
        else:
            return jsonify({"message":"failure"})

class GetUpcomingMovies(Resource):
    def get(self):
        data = request.get_json()
        upcomingMovieURL = tm.upcomingMovieURL+"&region={}".format(data['region'])
        upcomingMoviesData = json.loads(json.dumps(requests.get(upcomingMovieURL).json()))
        if(len(upcomingMoviesData['results'])!=0):
            upcomingMoviesList = []
            for i in range(0,len(upcomingMoviesData['results'])):
                upcomingMovies = {}
                upcomingMovies['title'] = upcomingMoviesData['results'][i]['title']
                upcomingMovies['release_date'] = upcomingMoviesData['results'][i]['release_date']
                upcomingMovies['poster_path'] = tm.posterPathURL.format(upcomingMoviesData['results'][i]['poster_path'])
                upcomingMoviesList.append(upcomingMovies)
            return jsonify({"upcomingMovies":upcomingMoviesList})
        else:
            return jsonify({"message":"No upcoming movies in your region"})

class GetNowPlayingMovies(Resource):
    def get(self):
        data = request.get_json()
        nowPlayingMovieURL = tm.nowPlayingMovieURL+"&region={}".format(data['region'])
        nowPlayingMovieURLData = json.loads(json.dumps(requests.get(nowPlayingMovieURL).json()))
        if(len(nowPlayingMovieURLData['results'])!=0):
            newMoviesList = []
            for i in range(0,len(nowPlayingMovieURLData['results'])):
                newMovies = {}
                newMovies['title'] = nowPlayingMovieURLData['results'][i]['title']
                newMovies['release_date'] = nowPlayingMovieURLData['results'][i]['release_date']
                newMovies['poster_path'] = tm.posterPathURL.format(nowPlayingMovieURLData['results'][i]['poster_path'])
                newMoviesList.append(newMovies)
            return jsonify({"newMovies":newMoviesList})
        else:
            return jsonify({"message":"No new movies being played in your region"})

class GetUserReview(Resource):
    def get(self):
        data = request.get_json()
        movie_collection = mongo.db.movies
        review_collection = mongo.db.reviews
        movieId = [movie['_id'] for movie in movie_collection.find({"title":{"$regex":data['title'],"$options":"i"}},{"_id":1})][0]
        review_cursor = review_collection.find({"movie_id":movieId})
        if(review_cursor.count()!=0):
            reviewList = []
            for review in review_cursor:
                reviews = {}
                reviews['user'] = review['user']
                reviews['reviewStmt'] = review['content']
                reviews['rating'] = review['rating']
                reviewList.append(reviews)
            return jsonify({"reviews":reviewList})
        else:
            return jsonify({"message":"No reviews for this movie"})


##### Admin related services #####

class GetUser(Resource):
    def get(self):
        users_collection = mongo.db.users
        userData = []
        user_Cursor = users_collection.find({"_id":{"$ne":1},"status":{"$ne":"inactive"}},{"_id":1,"name":1,"gender":1,"email_id":1,"role":1})
        for users in user_Cursor:
            userData.append(users)
        return jsonify({"users":userData})

class AddMovies(Resource):
    def post(self):
        data = request.get_json()
        movies_collection = mongo.db.movies
        if(movies_collection.find({'title':{'$regex':data['title'],'$options':'i'}}).count()!=0):
            return jsonify({"message":"Movie :"+data['title']+" already exists"})
        else:
            movieSearchURL = tm.movieSearchURL+"&language={}&query={}&include_adult={}&year={}".format(data['language'],data['title'],True,data['year'])
            movieDetails = json.loads(json.dumps(requests.get(movieSearchURL).json()))
            if(len(movieDetails['results'])!=0):
                movieData = {}
                movieData["_id"] = [movie['_id'] for movie in movies_collection.find().sort("_id",-1).limit(1)][0]+1
                movieData["tmdb_id"] = movieDetails['results'][0]["id"]
                movieData["title"] = data['title']
                movieData["poster_path"] = tm.posterPathURL.format(movieDetails['results'][0]['poster_path'])
                result = movies_collection.insert_one(movieData)
                if(result.acknowledged == True):
                    movie_request_collection = mongo.db.movieRequest
                    query = {"title":data['title']}
                    deletedResult = movie_request_collection.delete_one(query)
                    if(deletedResult.acknowledged == True):
                        return jsonify({"message":"success"})
                    else:
                        return jsonify({"message":"failure"})
            else:
                return jsonify({"message":"failure"})

class DeleteUser(Resource):
    def post(self):
        data = request.get_json()
        users_collection = mongo.db.users
        deleteQuery = {"username":{"$regex":data["username"],"$options":"i"}}
        deletedResult = users_collection.delete_one(deleteQuery)
        if(deletedResult.acknowledged == True):
            return jsonify({"message":"success"})
        else:
            return jsonify({"message":"failure"})

api.add_resource(Countries,'/countries')
api.add_resource(Languages,'/languages')
api.add_resource(CreateUser,'/createuser')
api.add_resource(RequestMovies,'/requestmovie')
api.add_resource(ChangePassword,'/changepwd')
api.add_resource(GetMovies,'/movies')
api.add_resource(GetUpcomingMovies,'/upcomingmovies')
api.add_resource(GetNowPlayingMovies,'/newmovies')
api.add_resource(GetUserReview,'/userreviews')
api.add_resource(GetUser,'/admin/users')
api.add_resource(AddMovies,'/admin/addmovies')
api.add_resource(DeleteUser,'/admin/deleteuser')

app.run(port=5000, debug=True)
