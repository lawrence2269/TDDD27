from flask import Flask,jsonify,request,Response
from flask_restful import Resource,Api
from flask_pymongo import PyMongo
from flask_cors import CORS
import json
import requests
from datetime import datetime
import tmdbAPI as tm
import random as ran

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
        movie_collection = mongo.db.movieDetails
        movie_records = movie_collection.find({},{"title":1,"poster_path_s":1,"release_year":1,"genre":1,"adult":1,"rating":1,"_id":0})
        movies = [movie for movie in movie_records]
        resp = jsonify({"movies":sorted(movies,key = lambda i: i['rating'],reverse=True)})
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
                if(nowPlayingMovieURLData['results'][i]['poster_path']!=None):
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

class GetGenre(Resource):
    def get(self):
        genreDetailsData = json.loads(json.dumps(requests.get(tm.genreDetailURL).json()))
        genreList = []
        #genreList.append("Choose...")
        for i in range(0,len(genreDetailsData['genres'])):
            genreList.append(genreDetailsData['genres'][i]['name'])
        resp = jsonify({"genres":genreList})
        resp.status_code = 200
        return resp

class GetYears(Resource):
    def get(self):
        years = []
        for i in range(1960,datetime.now().year+1):
            years.append(i)
        resp = jsonify({"years":years})
        resp.status_code = 200
        return resp

class GetRatings(Resource):
    def get(self):
        ratings = []
        ratings.append("All")
        for i in range(1,10):
            ratings.append(str(i)+"+")
        resp = jsonify({"ratings":ratings})
        resp.status_code = 200
        return resp

class GetAllMovies(Resource):
    def get(self):
        movies = []
        movies_collection = mongo.db.movieDetails
        movies_records = movies_collection.find({},{"title":1,"poster_path":1,"release_year":1,"tmdb_id":0,"_id":0})
        for movie in movies_records:
            movies.append(movie)
        resp = jsonify({"movies":movies})
        resp.status_code = 200
        return resp

class GetMovieDetails(Resource):
    def get(self):
        title = request.args.get("title")
        year = int(request.args.get("year"))
        movie_collection = mongo.db.movieDetails
        if(movie_collection.find({"title":{"$eq":title},"release_year":year}).count()!=0):
            movie_records = movie_collection.find({"title":{"$eq":title},"release_year":{"$eq":year}})
            movieData = [movie for movie in movie_records]
            resp = jsonify({"movieDetails":movieData[0]})
            resp.status_code = 200
            return resp
        else:
            movieSearchURL = tm.movieSearchURL+"&query={}&include_adult={}&year={}".format(title,True,year)
            movieDetails = json.loads(json.dumps(requests.get(movieSearchURL).json()))
            yifyListMovies = json.loads(json.dumps(requests.get(tm.yifyListMoviesURL.format(title)).json()))
            if(len(movieDetails['results'])!=0):
                movieData = {}
                movieData['tmdb_id'] = movieDetails['results'][0]['id']
                movieData['title'] = movieDetails['results'][0]['title']
                movieData['poster_path'] = tm.posterPathURL_L.format(movieDetails['results'][0]['poster_path'])
                movieData['rating'] = movieDetails['results'][0]['vote_average']
                movieData['synopsis'] = movieDetails['results'][0]['overview']
                movieData['likes'] = round(movieDetails['results'][0]['popularity'])
                movieData['release_year'] = year
                tmdbVideoURL = json.loads(json.dumps(requests.get(tm.tmdbVideoURL.format(movieData['tmdb_id'],tm.api_key)).json()))

                if(len(tmdbVideoURL['results'])!=0):
                    movieData['trailer'] = tm.youtubeTrailerURL.format(tmdbVideoURL['results'][0]['key'])
                else:
                    if("movies" in yifyListMovies['data']):
                        for movies in range(0,len(yifyListMovies['data']['movies'])):
                            if(year == yifyListMovies['data']['movies'][movies]['year'] and title == yifyListMovies['data']['movies'][movies]['title']):
                                movieData['trailer'] = tm.youtubeTrailerURL.format(yifyListMovies['data']['movies'][movies]['yt_trailer_code'])
                    else:
                        movieData['trailer'] = None

                ####### Cast and Crew Details ##########
                dirList = []
                castList = []
                tmdbMovieDetails = json.loads(json.dumps(requests.get(tm.tmdbMovieDetailsURL.format(movieData['tmdb_id'],tm.api_key)).json()))
                castFlag = True
                castId = 0
                while(castFlag):
                    if(tmdbMovieDetails['credits']['cast'][castId]['profile_path']!=None):
                        if(len(tmdbMovieDetails['credits']['cast'])<=4):
                            castDict = {}
                            castDict['name'] = tmdbMovieDetails['credits']['cast'][castId]['name']
                            castDict['character_name'] = tmdbMovieDetails['credits']['cast'][castId]['character']
                            castDict['cast_image_url'] = tm.profilePathURL.format(tmdbMovieDetails['credits']['cast'][castId]['profile_path'])
                            peopleDetails = json.loads(json.dumps(requests.get(tm.tmdbPersonDetailsURL.format(tmdbMovieDetails['credits']['cast'][castId]['id'],tm.api_key)).json()))
                            castDict['imdb_profile_url'] = tm.imdbProfileURL.format(peopleDetails['imdb_id'][2:])
                            castList.append(castDict)
                            castId+=1
                            if(castId == len(tmdbMovieDetails['credits']['cast'])):
                                break
                        else:
                            castDict = {}
                            castDict['name'] = tmdbMovieDetails['credits']['cast'][castId]['name']
                            castDict['character_name'] = tmdbMovieDetails['credits']['cast'][castId]['character']
                            castDict['cast_image_url'] = tm.profilePathURL.format(tmdbMovieDetails['credits']['cast'][castId]['profile_path'])
                            peopleDetails = json.loads(json.dumps(requests.get(tm.tmdbPersonDetailsURL.format(tmdbMovieDetails['credits']['cast'][castId]['id'],tm.api_key)).json()))
                            castDict['imdb_profile_url'] = tm.imdbProfileURL.format(peopleDetails['imdb_id'][2:])
                            castList.append(castDict)
                            castId+=1
                            if(castId == 4):
                                break
                movieData['cast'] = castList

                for k in range(0,len(tmdbMovieDetails['credits']['crew'])):
                    if(tmdbMovieDetails['credits']['crew'][k]['job'] == "Director"):
                        dirDict = {}
                        dirDict['name'] = tmdbMovieDetails['credits']['crew'][k]['name']
                        if(tmdbMovieDetails['credits']['crew'][k]['profile_path'] != None):
                            dirDict['cast_image_url'] = tm.tmdbProfileURL.format(tmdbMovieDetails['credits']['crew'][k]['profile_path'])
                        peopleDetails = json.loads(json.dumps(requests.get(tm.tmdbPersonDetailsURL.format(tmdbMovieDetails['credits']['crew'][k]['id'],tm.api_key)).json()))
                        dirDict['imdb_profile_url'] = tm.imdbProfileURL.format(peopleDetails['imdb_id'][2:])
                        dirList.append(dirDict)
                movieData['directors'] = dirList

                if(yifyListMovies['data']['movie_count']!=0):
                    movieData['imdb_id'] = tm.imdb_URL.format(yifyListMovies['data']['movies'][0]['imdb_code'])
                else:
                    if("imdb_id" in tmdbMovieDetails):
                        movieData['imdb_id'] = tm.imdb_URL.format(tmdbMovieDetails['imdb_id'])
                    else:
                        movieData['imdb_id'] = 0

                ####### Genre Details ###########
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

                ###### Run Time #####
                movieData['runtime'] = tmdbMovieDetails['runtime']
                if(movieData['runtime'] == 0):
                    if("movies" in yifyListMovies['data']):
                        for runTime in range(0,len(yifyListMovies['data']['movies'])):
                            if(year == yifyListMovies['data']['movies'][runTime]['year'] and title == yifyListMovies['data']['movies'][runTime]['title']):
                                movieData['runTime'] = yifyListMovies['data']['movies'][runTime]['runtime']

                resp = jsonify({"movieDetails":movieData})
                resp.status_code = 200
                return resp
            else:
                resp = jsonify({"message":"Movie is not available"})
                resp.status_code = 404
                return resp

class GetSimilarMovies(Resource):
    def get(self):
        tmdb_id = request.args.get("tmdb_id")
        similarMovieURL = tm.tmdbSimilarMoviesURL.format(tmdb_id,tm.api_key)
        similarMovieDetails = json.loads(json.dumps(requests.get(similarMovieURL).json()))
        if("results" in similarMovieDetails):
            if(len(similarMovieDetails['results'])!=0):
                similarMovieList = []
                for i in range(0,len(similarMovieDetails['results'])):
                    if(similarMovieDetails['results'][i]['poster_path']!=None):
                        similarMovieData = {}
                        similarMovieData['title'] = similarMovieDetails['results'][i]['title']
                        similarMovieData['poster_path'] = tm.posterPathURL.format(similarMovieDetails['results'][i]['poster_path'])
                        similarMovieData['year'] = datetime.strptime(similarMovieDetails['results'][i]['release_date'],"%Y-%m-%d").year
                        similarMovieList.append(similarMovieData)
                resp = jsonify({"similarMovies":similarMovieList})
                resp.status_code = 200
                return resp
            else:
                resp = jsonify({"similarMovies":["No similar movies available"]})
                resp.status_code = 404
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
api.add_resource(GetGenre,'/genre')
api.add_resource(GetYears,'/years')
api.add_resource(GetRatings,'/ratings')
api.add_resource(GetMovieDetails,'/movieDetails')
api.add_resource(GetUserReview,'/userreviews')
api.add_resource(GetUser,'/admin/users')
api.add_resource(AddMovies,'/admin/addmovies')
api.add_resource(DeleteUser,'/admin/deleteuser')

app.run(port=5000, debug=True,threaded=True)
