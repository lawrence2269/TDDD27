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
        resp = jsonify({"languages":languages})
        resp.status_code = 200
        return resp

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
                resp = jsonify({"message":"Success"})
                resp.status_code = 200
                return resp
            else:
                resp = jsonify({"message":"Failure"})
                resp.status_code = 400
                return resp

class GetMovies(Resource):
    def get(self):
        movie_collection = mongo.db.movies
        movie_records = movie_collection.find({})
        movies = [movie for movie in movie_records]
        resp = jsonify({"movies":movies})
        resp.status_code = 200
        return resp

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
                resp = jsonify({"message":"Success"})
                resp.status_code = 200
                return resp
            else:
                resp = jsonify({"message":"Failure"})
                resp.status_code = 400
                return resp

class ChangePassword(Resource):
    def post(self):
        data = request.get_json()
        users_collection = mongo.db.users
        result = users_collection.update_one(
            {"email_id":data["email"]},
            {"$set":{"password":data['password']}}
        )
        if(result.acknowledged == True):
            resp = jsonify({"message":"Success"})
            resp.status_code = 200
            return resp
        else:
            resp = jsonify({"message":"Failure"})
            resp.status_code = 400
            return resp

class DeactivateUser(Resource):
    def post(self):
        data = request.get_json()
        users_collection = mongo.db.users
        result = users_collection.update_one(
            {"email_id":data["email"]},
            {"$set":{"status":"inactive"}}
        )
        if(result.acknowledged == True):
            resp = jsonify({"message":"Success"})
            resp.status_code = 200
            return resp
        else:
            resp = jsonify({"message":"Failure"})
            resp.status_code = 400
            return resp

class GetUpcomingMovies(Resource):
    def get(self):
        data = request.args.get("region")
        upcomingMovieURL = tm.upcomingMovieURL+"&region={}".format(data)
        upcomingMoviesData = json.loads(json.dumps(requests.get(upcomingMovieURL).json()))
        if(len(upcomingMoviesData['results'])!=0):
            upcomingMoviesList = []
            for i in range(0,len(upcomingMoviesData['results'])):
                if(upcomingMoviesData['results'][i]['poster_path'] != None):
                    upcomingMovies = {}
                    upcomingMovies['title'] = upcomingMoviesData['results'][i]['title']
                    upcomingMovies['poster_path'] = tm.posterPathURL.format(upcomingMoviesData['results'][i]['poster_path'])
                    upcomingMovies['release_year'] = datetime.strptime(upcomingMoviesData['results'][i]['release_date'],"%Y-%m-%d").year
                    upcomingMoviesList.append(upcomingMovies)
            resp = jsonify({"upcomingMovies":upcomingMoviesList})
            resp.status_code = 200
            return resp
        else:
            resp = jsonify({"message":"No upcoming movies in your region"})
            resp.status_code = 404
            return resp

class GetNowPlayingMovies(Resource):
    def get(self):
        data = request.args.get("region")
        nowPlayingMovieURL = tm.nowPlayingMovieURL+"&region={}".format(data)
        nowPlayingMovieURLData = json.loads(json.dumps(requests.get(nowPlayingMovieURL).json()))
        if(len(nowPlayingMovieURLData['results'])!=0):
            newMoviesList = []
            for i in range(0,len(nowPlayingMovieURLData['results'])):
                newMovies = {}
                newMovies['title'] = nowPlayingMovieURLData['results'][i]['title']
                newMovies['poster_path'] = tm.posterPathURL.format(nowPlayingMovieURLData['results'][i]['poster_path'])
                newMovies['release_year'] = datetime.strptime(nowPlayingMovieURLData['results'][i]['release_date'],"%Y-%m-%d").year
                newMoviesList.append(newMovies)
            resp = jsonify({"newMovies":newMoviesList})
            resp.status_code = 200
            return resp
        else:
            resp = jsonify({"message":"No new movies being played in your region"})
            resp.status_code = 404
            return resp

class GetPopularMovies(Resource):
    def get(self):
        data = request.args.get("region")
        popularMovieURL = tm.popularMovieURL.format(tm.api_key,data)
        popularMovieURLData = json.loads(json.dumps(requests.get(popularMovieURL).json()))
        if(len(popularMovieURLData['results'])!=0):
            popularMovieList = []
            for i in range(0,len(popularMovieURLData['results'])):
                popularMovies = {}
                if(datetime.now().year == datetime.strptime(popularMovieURLData['results'][i]['release_date'],"%Y-%m-%d").year):
                    popularMovies['title'] = popularMovieURLData['results'][i]['title']
                    popularMovies['poster_path'] = tm.posterPathURL.format(popularMovieURLData['results'][i]['poster_path'])
                    popularMovies['release_year'] = datetime.strptime(popularMovieURLData['results'][i]['release_date'],"%Y-%m-%d").year
                    popularMovieList.append(popularMovies)
            resp = jsonify({"popularMovies":popularMovieList})
            resp.status_code = 200
            return resp
        else:
            resp = jsonify({"message":"No popular movies is available in your region"})
            resp.status_code = 404
            return resp

class GetMovieDetails(Resource):
    def get(self):
        title = request.args.get("title")
        year = int(request.args.get("year"))
        movieSearchURL = tm.movieSearchURL+"&query={}&include_adult={}&year={}".format(title,True,year)
        movieDetails = json.loads(json.dumps(requests.get(movieSearchURL).json()))
        if(len(movieDetails['results'])!=0):
            movieData = {}
            movieData['tmdb_id'] = movieDetails['results'][0]['id']
            movieData['title'] = movieDetails['results'][0]['title']
            movieData['poster_path'] = tm.posterPathURL_L.format(movieDetails['results'][0]['poster_path'])
            yifyMovieDetails = json.loads(json.dumps(requests.get(tm.yifyMovieDetailURL.format(title)).json()))
            for i in range(0,len(yifyMovieDetails['data']['movies'])):
                if(yifyMovieDetails['data']['movies'][i]['year'] == year):
                    movieData['yify_id'] = yifyMovieDetails['data']['movies'][i]['id']
                    yifyMovieDetail = json.loads(json.dumps(requests.get(tm.yifyMovieSearchURL.format(movieData['yify_id'],"true","true")).json()))
                    if(len(yifyMovieDetail['data']['movie'])!=0):
                        movieData['likes'] = yifyMovieDetail['data']['movie']['like_count']
                        movieData['screenshot1'] = yifyMovieDetail['data']['movie']['medium_screenshot_image1']
                        movieData['screenshot2'] = yifyMovieDetail['data']['movie']['medium_screenshot_image2']
                        castList = []
                        dirList = []
                        tmdbMovieDetails = json.loads(json.dumps(requests.get(tm.tmdbMovieDetailsURL.format(movieData['tmdb_id'],tm.api_key)).json()))
                        for j in range(0,len(yifyMovieDetail['data']['movie']['cast'])):
                            castDict = {}
                            castDict['name'] = yifyMovieDetail['data']['movie']['cast'][i]['name']
                            castDict['character_name'] = yifyMovieDetail['data']['movie']['cast'][i]['character_name']
                            castDict['cast_image_url'] = yifyMovieDetail['data']['movie']['cast'][i]['url_small_image']
                            castDict['imdb_profile_url'] = tm.imdbProfileURL.format(yifyMovieDetail['data']['movie']['cast'][i]['imdb_code'])
                            castList.append(castDict)
                        for k in range(0,len(tmdbMovieDetails['credits']['crew'])):
                            if(tmdbMovieDetails['credits']['crew'][k]['job'] == "Director"):
                                dirDict = {}
                                dirDict['name'] = tmdbMovieDetails['credits']['crew'][k]['name']
                                if(tmdbMovieDetails['credits']['crew'][k]['profile_path'] != None):
                                    dirDict['cast_image_url'] = tm.tmdbProfileURL.format(tmdbMovieDetails['credits']['crew'][k]['profile_path'])
                                peopleDetails = json.loads(json.dumps(requests.get(tm.tmdbPersonDetailsURL.format(tmdbMovieDetails['credits']['crew'][k]['id'],tm.api_key)).json()))
                                dirDict['imdb_profile_url'] = tm.imdbProfileURL.format(peopleDetails['imdb_id'][2:])
                                dirList.append(dirDict)
                        movieData['director'] = dirList
                        movieData['cast'] = castList
                    else:
                        movieData['likes'] = 0
                        movieData['screenshot1'] = " "
                        movieData['screenshot2'] = " "
                    movieData['imdb_id'] = tm.imdb_URL.format(yifyMovieDetails['data']['movies'][i]['imdb_code'])
                    movieData['synopsis'] = yifyMovieDetails['data']['movies'][i]['synopsis']
                    movieData['runtime'] = yifyMovieDetails['data']['movies'][i]['runtime']
                    movieData['rating'] = yifyMovieDetails['data']['movies'][i]['rating']
                    movieData['trailer'] = tm.youtubeTrailerURL.format(yifyMovieDetails['data']['movies'][i]['yt_trailer_code'])
            genre = []
            genre_temp = movieDetails['results'][0]['genre_ids']
            genreDetails = json.loads(json.dumps(requests.get(tm.genreDetailURL).json()))
            for genreId in genre_temp:
                for info in genreDetails['genres']:
                    if(info['id'] == genreId):
                        genre.append(info['name'])
            movieData['genre'] = str(' / '.join(genre))
            if(movieDetails['results'][0]["adult"] == False):
                movieData["adult_Content"] = "No"
            else:
                movieData["adult_Content"] = "Yes"
            resp = jsonify({"movieDetails":movieData})
            resp.status_code = 200
            return resp
        else:
            resp = jsonify({"message":"Movie is not available"})
            resp.status_code = 404
            return resp

class GetSimilarMovies(Resource):
    def get(self):
        yify_id = request.args.get("yify_id")
        similarMovieURL = tm.yifySimilarMovieURL.format(yify_id)
        similarMovieDetails = json.loads(json.dumps(requests.get(similarMovieURL).json()))
        if(len(similarMovieDetails['data']['movies'])!=0):
            similarMovieList = []
            for i in range(0,len(similarMovieDetails['data']['movies'])):
                movieSearchURL = tm.movieSearchURL+"&query={}&include_adult={}&year={}".format(similarMovieDetails['data']['movies'][i]['title'],True,similarMovieDetails['data']['movies'][i]['year'])
                movieDetails = json.loads(json.dumps(requests.get(movieSearchURL).json()))
                if(len(movieDetails['results'])!=0):
                    similarMovieData = {}
                    similarMovieData['title'] = similarMovieDetails['data']['movies'][i]['title']
                    similarMovieData['poster_path'] = similarMovieDetails['data']['movies'][i]['medium_cover_image']
                    similarMovieData['year'] = similarMovieDetails['data']['movies'][i]['year']
                    similarMovieList.append(similarMovieData)
            resp = jsonify({"similarMovies":similarMovieList})
            resp.status_code = 200
            return resp
        else:
            resp = jsonify({"similarMovies":"No similar movies available"})
            resp.status_code = 404
            return resp

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
            resp = jsonify({"reviews":reviewList})
            resp.status_code = 200
            return resp
        else:
            resp = jsonify({"message":"No reviews for this movie"})
            resp.status_code = 400
            return resp

##### Admin related services #####

class GetUser(Resource):
    def get(self):
        users_collection = mongo.db.users
        userData = []
        user_Cursor = users_collection.find({"_id":{"$ne":1},"status":{"$ne":"inactive"}},{"_id":1,"name":1,"gender":1,"email_id":1,"role":1})
        for users in user_Cursor:
            userData.append(users)
        resp = jsonify({"users":userData})
        resp.status_code = 200
        return resp

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
                        resp = jsonify({"message":"Success"})
                        resp.status_code = 200
                        return resp
                    else:
                        resp = jsonify({"message":"Movie already deleted"})
                        resp.status_code = 400
                        return resp
                else:
                    resp = jsonify({"message":"Failure"})
                    resp.status_code = 400
                    return resp
            else:
                resp = jsonify({"message":"No Data"})
                resp.status_code = 404
                return resp

class DeleteUser(Resource):
    def post(self):
        data = request.get_json()
        users_collection = mongo.db.users
        deleteQuery = {"username":{"$regex":data["username"],"$options":"i"}}
        deletedResult = users_collection.delete_one(deleteQuery)
        if(deletedResult.acknowledged == True):
            resp = jsonify({"message":"Success"})
            resp.status_code = 200
            return resp
        else:
            resp = jsonify({"message":"Failure"})
            resp.status_code = 400
            return resp

api.add_resource(Countries,'/countries')
api.add_resource(Languages,'/languages')
api.add_resource(CreateUser,'/createuser')
api.add_resource(RequestMovies,'/requestmovie')
api.add_resource(ChangePassword,'/changepwd')
api.add_resource(GetMovies,'/movies')
api.add_resource(GetUpcomingMovies,'/upcomingmovies')
api.add_resource(GetNowPlayingMovies,'/newmovies')
api.add_resource(GetPopularMovies,'/popularmovies')
api.add_resource(GetSimilarMovies,'/similarmovies')
api.add_resource(GetMovieDetails,'/movieDetails')
api.add_resource(GetUserReview,'/userreviews')
api.add_resource(GetUser,'/admin/users')
api.add_resource(AddMovies,'/admin/addmovies')
api.add_resource(DeleteUser,'/admin/deleteuser')

app.run(port=5000, debug=True)
