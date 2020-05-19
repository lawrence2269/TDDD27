import pymongo
import json
import datetime
import requests as api
import dns

regionData = {"US":"US","SE":"SE"}

def insertUpcomingMoviesUS():
    api_key = "818cffde0b1e6749199b67fee1cbd032"
    client = pymongo.MongoClient("mongodb+srv://swmdb:swmdb12345@swmdb-ezh2o.mongodb.net/SWMDB?retryWrites=true&w=majority")
    db=client['SWMDB']
    col_1 = db['movies']
    col_2 = db['movieDetails']
    region = regionData["US"]
    upcomingMovieURL = "https://api.themoviedb.org/3/movie/upcoming?api_key={}&region={}".format(api_key,region)
    upcomingMoviesData = json.loads(json.dumps(requests.get(upcomingMovieURL).json()))
    if(len(upcomingMoviesData['results'])!=0):
        for i in range(0,len(upcomingMoviesData['results'])):
            if(upcomingMoviesData['results'][i]['poster_path'] != None):
                if(col_1.find({"title":{"$regex":upcomingMoviesData['results'][i]['title'],'$options':'i'}}).count()!=0):
                    upcomingMovies = {}
                    upcomingMovie = {}
                    
                    upcomingMovie["_id"] = col_1.find({}).count+1
                    upcomingMovie['title'] = upcomingMoviesData['results'][i]['title']
                    upcomingMovie['poster_path'] = "http://image.tmdb.org/t/p/w185{}".format(upcomingMoviesData['results'][i]['poster_path'])
                    upcomingMovie['release_year'] = datetime.strptime(upcomingMoviesData['results'][i]['release_date'],"%Y-%m-%d").year
                    col_1.insert_one(upcomingMovie)
                    
                    upcomingMovies["_id"] = col_2.find({}).count+1
                    upcomingMovies['title'] = upcomingMoviesData['results'][i]['title']
                    upcomingMovies['poster_path'] = "http://image.tmdb.org/t/p/w185{}".format(upcomingMoviesData['results'][i]['poster_path'])
                    upcomingMovies['release_year'] = datetime.strptime(upcomingMoviesData['results'][i]['release_date'],"%Y-%m-%d").year
                    movieSearchURL = "https://api.themoviedb.org/3/search/movie?api_key={}&query={}&include_adult={}&year={}".format(upcomingMovies['title'],True,upcomingMovies['release_year'])
                    movieSearch = json.loads(json.dumps(api.get(movieSearchURL).json()))
                    if(len(movieSearch['results'])!=0):
                        upcomingMovies["tmdb_id"] = movieSearch['results'][0]["id"]
                        movieCompleteDetailsURL = "https://api.themoviedb.org/3/movie/{}?api_key={}&append_to_response=credits".format(upcomingMovies["tmdb_id"],api_key)
                        movieCompleteDetailsResponse = json.loads(json.dumps(api.get(movieCompleteDetailsURL).json()))
                        if(movieCompleteDetailsResponse['adult'] == False):
                            upcomingMovies['adult'] = 'No'
                        else:
                            upcomingMovies['adult'] = 'Yes'
                        
                        genreDetailUrl = "https://api.themoviedb.org/3/genre/movie/list?api_key={}&language=en-US".format(api_key)
                        genre = []
                        genre_temp = movieSearch['results'][0]['genre_ids']
                        genreDetails = json.loads(json.dumps(api.get(genreDetailUrl).json()))
                        for genreId in genre_temp:
                            for info in genreDetails['genres']:
                                if(info['id'] == genreId):
                                    genre.append(info['name'])
                        upcomingMovies['genre'] = str(" / ".join(genre))
                        upcomingMovies['rating'] = movieSearch['results'][0]['vote_average']
                        upcomingMovies['synopsis'] = movieSearch['results'][0]['overview']
                        upcomingMovies['likes'] = round(movieSearch['results'][0]['popularity'])
                        tmdbVideoURL = "https://api.themoviedb.org/3/movie/{}/videos?api_key={}".format(upcomingMovies["tmdb_id"],api_key)
                        videoData = json.loads(json.dumps(api.get(tmdbVideoURL).json()))
                        if(len(videoData['results'])!=0):
                            for j in range(0,len(videoData['results'])):
                                if(videoData['results'][j]['type'] == 'Trailer'):
                                    upcomingMovies['trailer'] = "https://www.youtube.com/embed/{}".format(videoData['results'][j]['key'])
                        else:
                            upcomingMovies['trailer'] = None
                        dirList = []
                        castList = []
                        castId = 0
                        for z in range(0,len(movieCompleteDetailsResponse['credits']['cast'])):
                            if(castId == 4):
                                break
                            else:
                                castDict = {}
                                castDict['name'] = movieCompleteDetailsResponse['credits']['cast'][castId]['name']
                                castDict['character_name'] = movieCompleteDetailsResponse['credits']['cast'][castId]['character']
                                if(movieCompleteDetailsResponse['credits']['cast'][castId]['profile_path']!=None):
                                    castDict['cast_image_url'] = "https://image.tmdb.org/t/p/w45{}".format(movieCompleteDetailsResponse['credits']['cast'][castId]['profile_path'])
                                else:
                                    castDict['cast_image_url'] = " "
                                peopleDetails = json.loads(json.dumps(api.get("https://api.themoviedb.org/3/person/{}?api_key={}".format(movieCompleteDetailsResponse['credits']['cast'][castId]['id'],api_key)).json()))
                                if(peopleDetails['imdb_id']!=None):
                                    castDict['imdb_profile_url'] = "https://www.imdb.com/name/nm{}".format(peopleDetails['imdb_id'][2:])
                                else:
                                    castDict['imdb_profile_url'] = " "
                                castList.append(castDict)
                                castId = castId+1 
                                
                        upcomingMovies['cast'] = castList
            
                        for k in range(0,len(movieCompleteDetailsResponse['credits']['crew'])):
                            if(movieCompleteDetailsResponse['credits']['crew'][k]['job'] == "Director"):
                                dirDict = {}
                                dirDict['name'] = movieCompleteDetailsResponse['credits']['crew'][k]['name']
                                if(movieCompleteDetailsResponse['credits']['crew'][k]['profile_path'] != None):
                                    dirDict['cast_image_url'] = "https://image.tmdb.org/t/p/w45{}".format(movieCompleteDetailsResponse['credits']['crew'][k]['profile_path'])
                                else:
                                    dirDict['cast_image_url'] = " "
                                peopleDetails = json.loads(json.dumps(api.get("https://api.themoviedb.org/3/person/{}?api_key={}".format(movieCompleteDetailsResponse['credits']['crew'][k]['id'],api_key)).json()))
                                if(peopleDetails['imdb_id']!=None):
                                    dirDict['imdb_profile_url'] = "https://www.imdb.com/name/nm{}".format(peopleDetails['imdb_id'][2:])
                                else:
                                    dirDict['imdb_profile_url'] = " "
                                dirList.append(dirDict)
                        
                        upcomingMovies['directors'] = dirList
                        
                        upcomingMovies['imdb_id'] = "https://www.imdb.com/title/{}/".format(movieCompleteDetailsResponse['imdb_id'])
                        upcomingMovies['runtime'] = movieCompleteDetailsResponse['runtime']
                        col_2.insert_one(upcomingMovies)
                    
def insertPopularMoviesUS():
    api_key = "818cffde0b1e6749199b67fee1cbd032"
    client = pymongo.MongoClient("mongodb+srv://swmdb:swmdb12345@swmdb-ezh2o.mongodb.net/SWMDB?retryWrites=true&w=majority")
    db=client['SWMDB']
    col_1 = db['movies']
    col_2 = db['movieDetails']
    region = regionData["US"]
    popularMovieURL = "https://api.themoviedb.org/3/movie/popular?api_key={}&region={}".format(api_key,region)
    popularMoviesData = json.loads(json.dumps(requests.get(popularMovieURL).json()))
    if(len(popularMoviesData['results'])!=0):
        for i in range(0,len(popularMoviesData['results'])):
            if(popularMoviesData['results'][i]['poster_path'] != None):
                if(col_1.find({"title":{"$regex":popularMoviesData['results'][i]['title'],'$options':'i'}}).count()!=0):
                    popularMovies = {}
                    popularMovie = {}
                    
                    popularMovie["_id"] = col_1.find({}).count+1
                    popularMovie['title'] = popularMoviesData['results'][i]['title']
                    popularMovie['poster_path'] = "http://image.tmdb.org/t/p/w185{}".format(popularMoviesData['results'][i]['poster_path'])
                    popularMovie['release_year'] = datetime.strptime(popularMoviesData['results'][i]['release_date'],"%Y-%m-%d").year
                    col_1.insert_one(popularMovie)
                    
                    popularMovies["_id"] = col_2.find({}).count+1
                    popularMovies['title'] = popularMoviesData['results'][i]['title']
                    popularMovies['poster_path'] = "http://image.tmdb.org/t/p/w185{}".format(popularMoviesData['results'][i]['poster_path'])
                    popularMovies['release_year'] = datetime.strptime(popularMoviesData['results'][i]['release_date'],"%Y-%m-%d").year
                    movieSearchURL = "https://api.themoviedb.org/3/search/movie?api_key={}&query={}&include_adult={}&year={}".format(popularMovies['title'],True,popularMovies['release_year'])
                    movieSearch = json.loads(json.dumps(api.get(movieSearchURL).json()))
                    if(len(movieSearch['results'])!=0):
                        popularMovies["tmdb_id"] = movieSearch['results'][0]["id"]
                        movieCompleteDetailsURL = "https://api.themoviedb.org/3/movie/{}?api_key={}&append_to_response=credits".format(popularMovies["tmdb_id"],api_key)
                        movieCompleteDetailsResponse = json.loads(json.dumps(api.get(movieCompleteDetailsURL).json()))
                        if(movieCompleteDetailsResponse['adult'] == False):
                            popularMovies['adult'] = 'No'
                        else:
                            popularMovies['adult'] = 'Yes'
                        
                        genreDetailUrl = "https://api.themoviedb.org/3/genre/movie/list?api_key={}&language=en-US".format(api_key)
                        genre = []
                        genre_temp = movieSearch['results'][0]['genre_ids']
                        genreDetails = json.loads(json.dumps(api.get(genreDetailUrl).json()))
                        for genreId in genre_temp:
                            for info in genreDetails['genres']:
                                if(info['id'] == genreId):
                                    genre.append(info['name'])
                        popularMovies['genre'] = str(" / ".join(genre))
                        popularMovies['rating'] = movieSearch['results'][0]['vote_average']
                        popularMovies['synopsis'] = movieSearch['results'][0]['overview']
                        popularMovies['likes'] = round(movieSearch['results'][0]['popularity'])
                        tmdbVideoURL = "https://api.themoviedb.org/3/movie/{}/videos?api_key={}".format(popularMovies["tmdb_id"],api_key)
                        videoData = json.loads(json.dumps(api.get(tmdbVideoURL).json()))
                        if(len(videoData['results'])!=0):
                            for j in range(0,len(videoData['results'])):
                                if(videoData['results'][j]['type'] == 'Trailer'):
                                    popularMovies['trailer'] = "https://www.youtube.com/embed/{}".format(videoData['results'][j]['key'])
                        else:
                            popularMovies['trailer'] = None
                        dirList = []
                        castList = []
                        castId = 0
                        for z in range(0,len(movieCompleteDetailsResponse['credits']['cast'])):
                            if(castId == 4):
                                break
                            else:
                                castDict = {}
                                castDict['name'] = movieCompleteDetailsResponse['credits']['cast'][castId]['name']
                                castDict['character_name'] = movieCompleteDetailsResponse['credits']['cast'][castId]['character']
                                if(movieCompleteDetailsResponse['credits']['cast'][castId]['profile_path']!=None):
                                    castDict['cast_image_url'] = "https://image.tmdb.org/t/p/w45{}".format(movieCompleteDetailsResponse['credits']['cast'][castId]['profile_path'])
                                else:
                                    castDict['cast_image_url'] = " "
                                peopleDetails = json.loads(json.dumps(api.get("https://api.themoviedb.org/3/person/{}?api_key={}".format(movieCompleteDetailsResponse['credits']['cast'][castId]['id'],api_key)).json()))
                                if(peopleDetails['imdb_id']!=None):
                                    castDict['imdb_profile_url'] = "https://www.imdb.com/name/nm{}".format(peopleDetails['imdb_id'][2:])
                                else:
                                    castDict['imdb_profile_url'] = " "
                                castList.append(castDict)
                                castId = castId+1 
                                
                        popularMovies['cast'] = castList
            
                        for k in range(0,len(movieCompleteDetailsResponse['credits']['crew'])):
                            if(movieCompleteDetailsResponse['credits']['crew'][k]['job'] == "Director"):
                                dirDict = {}
                                dirDict['name'] = movieCompleteDetailsResponse['credits']['crew'][k]['name']
                                if(movieCompleteDetailsResponse['credits']['crew'][k]['profile_path'] != None):
                                    dirDict['cast_image_url'] = "https://image.tmdb.org/t/p/w45{}".format(movieCompleteDetailsResponse['credits']['crew'][k]['profile_path'])
                                else:
                                    dirDict['cast_image_url'] = " "
                                peopleDetails = json.loads(json.dumps(api.get("https://api.themoviedb.org/3/person/{}?api_key={}".format(movieCompleteDetailsResponse['credits']['crew'][k]['id'],api_key)).json()))
                                if(peopleDetails['imdb_id']!=None):
                                    dirDict['imdb_profile_url'] = "https://www.imdb.com/name/nm{}".format(peopleDetails['imdb_id'][2:])
                                else:
                                    dirDict['imdb_profile_url'] = " "
                                dirList.append(dirDict)
                        
                        popularMovies['directors'] = dirList
                        
                        popularMovies['imdb_id'] = "https://www.imdb.com/title/{}/".format(movieCompleteDetailsResponse['imdb_id'])
                        popularMovies['runtime'] = movieCompleteDetailsResponse['runtime']
                        col_2.insert_one(popularMovies)
    
def insertNowPlayingMoviesUS():
    api_key = "818cffde0b1e6749199b67fee1cbd032"
    client = pymongo.MongoClient("mongodb+srv://swmdb:swmdb12345@swmdb-ezh2o.mongodb.net/SWMDB?retryWrites=true&w=majority")
    db=client['SWMDB']
    col_1 = db['movies']
    col_2 = db['movieDetails']
    region = regionData["US"]
    nowPlayingMovieURL = "https://api.themoviedb.org/3/movie/now_playing?api_key={}&region={}".format(api_key,region)
    nowPlayingMovieData = json.loads(json.dumps(requests.get(nowPlayingMovieURL).json()))
    if(len(nowPlayingMovieData['results'])!=0):
        for i in range(0,len(nowPlayingMovieData['results'])):
            if(nowPlayingMovieData['results'][i]['poster_path'] != None):
                if(col_1.find({"title":{"$regex":nowPlayingMovieData['results'][i]['title'],'$options':'i'}}).count()!=0):
                    playingMovies = {}
                    playingMovie = {}
                    
                    playingMovie["_id"] = col_1.find({}).count+1
                    playingMovie['title'] = nowPlayingMovieData['results'][i]['title']
                    playingMovie['poster_path'] = "http://image.tmdb.org/t/p/w185{}".format(nowPlayingMovieData['results'][i]['poster_path'])
                    playingMovie['release_year'] = datetime.strptime(nowPlayingMovieData['results'][i]['release_date'],"%Y-%m-%d").year
                    col_1.insert_one(playingMovie)
                    
                    playingMovies["_id"] = col_2.find({}).count+1
                    playingMovies['title'] = nowPlayingMovieData['results'][i]['title']
                    playingMovies['poster_path'] = "http://image.tmdb.org/t/p/w185{}".format(nowPlayingMovieData['results'][i]['poster_path'])
                    playingMovies['release_year'] = datetime.strptime(nowPlayingMovieData['results'][i]['release_date'],"%Y-%m-%d").year
                    movieSearchURL = "https://api.themoviedb.org/3/search/movie?api_key={}&query={}&include_adult={}&year={}".format(nowPlayingMovieData['title'],True,nowPlayingMovieData['release_year'])
                    movieSearch = json.loads(json.dumps(api.get(movieSearchURL).json()))
                    if(len(movieSearch['results'])!=0):
                        playingMovies["tmdb_id"] = movieSearch['results'][0]["id"]
                        movieCompleteDetailsURL = "https://api.themoviedb.org/3/movie/{}?api_key={}&append_to_response=credits".format(playingMovies["tmdb_id"],api_key)
                        movieCompleteDetailsResponse = json.loads(json.dumps(api.get(movieCompleteDetailsURL).json()))
                        if(movieCompleteDetailsResponse['adult'] == False):
                            playingMovies['adult'] = 'No'
                        else:
                            playingMovies['adult'] = 'Yes'
                        
                        genreDetailUrl = "https://api.themoviedb.org/3/genre/movie/list?api_key={}&language=en-US".format(api_key)
                        genre = []
                        genre_temp = movieSearch['results'][0]['genre_ids']
                        genreDetails = json.loads(json.dumps(api.get(genreDetailUrl).json()))
                        for genreId in genre_temp:
                            for info in genreDetails['genres']:
                                if(info['id'] == genreId):
                                    genre.append(info['name'])
                        playingMovies['genre'] = str(" / ".join(genre))
                        playingMovies['rating'] = movieSearch['results'][0]['vote_average']
                        playingMovies['synopsis'] = movieSearch['results'][0]['overview']
                        popularMovies['likes'] = round(movieSearch['results'][0]['popularity'])
                        tmdbVideoURL = "https://api.themoviedb.org/3/movie/{}/videos?api_key={}".format(playingMovies["tmdb_id"],api_key)
                        videoData = json.loads(json.dumps(api.get(tmdbVideoURL).json()))
                        if(len(videoData['results'])!=0):
                            for j in range(0,len(videoData['results'])):
                                if(videoData['results'][j]['type'] == 'Trailer'):
                                    playingMovies['trailer'] = "https://www.youtube.com/embed/{}".format(videoData['results'][j]['key'])
                        else:
                            playingMovies['trailer'] = None
                        dirList = []
                        castList = []
                        castId = 0
                        for z in range(0,len(movieCompleteDetailsResponse['credits']['cast'])):
                            if(castId == 4):
                                break
                            else:
                                castDict = {}
                                castDict['name'] = movieCompleteDetailsResponse['credits']['cast'][castId]['name']
                                castDict['character_name'] = movieCompleteDetailsResponse['credits']['cast'][castId]['character']
                                if(movieCompleteDetailsResponse['credits']['cast'][castId]['profile_path']!=None):
                                    castDict['cast_image_url'] = "https://image.tmdb.org/t/p/w45{}".format(movieCompleteDetailsResponse['credits']['cast'][castId]['profile_path'])
                                else:
                                    castDict['cast_image_url'] = " "
                                peopleDetails = json.loads(json.dumps(api.get("https://api.themoviedb.org/3/person/{}?api_key={}".format(movieCompleteDetailsResponse['credits']['cast'][castId]['id'],api_key)).json()))
                                if(peopleDetails['imdb_id']!=None):
                                    castDict['imdb_profile_url'] = "https://www.imdb.com/name/nm{}".format(peopleDetails['imdb_id'][2:])
                                else:
                                    castDict['imdb_profile_url'] = " "
                                castList.append(castDict)
                                castId = castId+1 
                                
                        playingMovies['cast'] = castList
            
                        for k in range(0,len(movieCompleteDetailsResponse['credits']['crew'])):
                            if(movieCompleteDetailsResponse['credits']['crew'][k]['job'] == "Director"):
                                dirDict = {}
                                dirDict['name'] = movieCompleteDetailsResponse['credits']['crew'][k]['name']
                                if(movieCompleteDetailsResponse['credits']['crew'][k]['profile_path'] != None):
                                    dirDict['cast_image_url'] = "https://image.tmdb.org/t/p/w45{}".format(movieCompleteDetailsResponse['credits']['crew'][k]['profile_path'])
                                else:
                                    dirDict['cast_image_url'] = " "
                                peopleDetails = json.loads(json.dumps(api.get("https://api.themoviedb.org/3/person/{}?api_key={}".format(movieCompleteDetailsResponse['credits']['crew'][k]['id'],api_key)).json()))
                                if(peopleDetails['imdb_id']!=None):
                                    dirDict['imdb_profile_url'] = "https://www.imdb.com/name/nm{}".format(peopleDetails['imdb_id'][2:])
                                else:
                                    dirDict['imdb_profile_url'] = " "
                                dirList.append(dirDict)
                        
                        playingMovies['directors'] = dirList
                        
                        playingMovies['imdb_id'] = "https://www.imdb.com/title/{}/".format(movieCompleteDetailsResponse['imdb_id'])
                        playingMovies['runtime'] = movieCompleteDetailsResponse['runtime']
                        col_2.insert_one(playingMovies)
    
    
def insertUpcomingMoviesSV():
    api_key = "818cffde0b1e6749199b67fee1cbd032"
    client = pymongo.MongoClient("mongodb+srv://swmdb:swmdb12345@swmdb-ezh2o.mongodb.net/SWMDB?retryWrites=true&w=majority")
    db=client['SWMDB']
    col_1 = db['movies']
    col_2 = db['movieDetails']
    region = regionData["SE"]
    upcomingMovieURL = "https://api.themoviedb.org/3/movie/upcoming?api_key={}&region={}".format(api_key,region)
    upcomingMoviesData = json.loads(json.dumps(requests.get(upcomingMovieURL).json()))
    if(len(upcomingMoviesData['results'])!=0):
        for i in range(0,len(upcomingMoviesData['results'])):
            if(upcomingMoviesData['results'][i]['poster_path'] != None):
                if(col_1.find({"title":{"$regex":upcomingMoviesData['results'][i]['title'],'$options':'i'}}).count()!=0):
                    upcomingMovies = {}
                    upcomingMovie = {}
                    
                    upcomingMovie['title'] = upcomingMoviesData['results'][i]['title']
                    upcomingMovie['poster_path'] = "http://image.tmdb.org/t/p/w185{}".format(upcomingMoviesData['results'][i]['poster_path'])
                    upcomingMovie['release_year'] = datetime.strptime(upcomingMoviesData['results'][i]['release_date'],"%Y-%m-%d").year
                    col_1.insert_one(upcomingMovie)
                    upcomingMovies['title'] = upcomingMoviesData['results'][i]['title']
                    upcomingMovies['poster_path'] = "http://image.tmdb.org/t/p/w185{}".format(upcomingMoviesData['results'][i]['poster_path'])
                    upcomingMovies['release_year'] = datetime.strptime(upcomingMoviesData['results'][i]['release_date'],"%Y-%m-%d").year
                    movieSearchURL = "https://api.themoviedb.org/3/search/movie?api_key={}&query={}&include_adult={}&year={}".format(upcomingMovies['title'],True,upcomingMovies['release_year'])
                    movieSearch = json.loads(json.dumps(api.get(movieSearchURL).json()))
                    if(len(movieSearch['results'])!=0):
                        upcomingMovies["tmdb_id"] = movieSearch['results'][0]["id"]
                        movieCompleteDetailsURL = "https://api.themoviedb.org/3/movie/{}?api_key={}&append_to_response=credits".format(upcomingMovies["tmdb_id"],api_key)
                        movieCompleteDetailsResponse = json.loads(json.dumps(api.get(movieCompleteDetailsURL).json()))
                        if(movieCompleteDetailsResponse['adult'] == False):
                            upcomingMovies['adult'] = 'No'
                        else:
                            upcomingMovies['adult'] = 'Yes'
                        
                        genreDetailUrl = "https://api.themoviedb.org/3/genre/movie/list?api_key={}&language=en-US".format(api_key)
                        genre = []
                        genre_temp = movieSearch['results'][0]['genre_ids']
                        genreDetails = json.loads(json.dumps(api.get(genreDetailUrl).json()))
                        for genreId in genre_temp:
                            for info in genreDetails['genres']:
                                if(info['id'] == genreId):
                                    genre.append(info['name'])
                        upcomingMovies['genre'] = str(" / ".join(genre))
                        upcomingMovies['rating'] = movieSearch['results'][0]['vote_average']
                        upcomingMovies['synopsis'] = movieSearch['results'][0]['overview']
                        upcomingMovies['likes'] = round(movieSearch['results'][0]['popularity'])
                        tmdbVideoURL = "https://api.themoviedb.org/3/movie/{}/videos?api_key={}".format(upcomingMovies["tmdb_id"],api_key)
                        videoData = json.loads(json.dumps(api.get(tmdbVideoURL).json()))
                        if(len(videoData['results'])!=0):
                            for j in range(0,len(videoData['results'])):
                                if(videoData['results'][j]['type'] == 'Trailer'):
                                    upcomingMovies['trailer'] = "https://www.youtube.com/embed/{}".format(videoData['results'][j]['key'])
                        else:
                            upcomingMovies['trailer'] = None
                         dirList = []
                        castList = []
                        castId = 0
                        for z in range(0,len(movieCompleteDetailsResponse['credits']['cast'])):
                            if(castId == 4):
                                break
                            else:
                                castDict = {}
                                castDict['name'] = movieCompleteDetailsResponse['credits']['cast'][castId]['name']
                                castDict['character_name'] = movieCompleteDetailsResponse['credits']['cast'][castId]['character']
                                if(movieCompleteDetailsResponse['credits']['cast'][castId]['profile_path']!=None):
                                    castDict['cast_image_url'] = "https://image.tmdb.org/t/p/w45{}".format(movieCompleteDetailsResponse['credits']['cast'][castId]['profile_path'])
                                else:
                                    castDict['cast_image_url'] = " "
                                peopleDetails = json.loads(json.dumps(api.get("https://api.themoviedb.org/3/person/{}?api_key={}".format(movieCompleteDetailsResponse['credits']['cast'][castId]['id'],api_key)).json()))
                                if(peopleDetails['imdb_id']!=None):
                                    castDict['imdb_profile_url'] = "https://www.imdb.com/name/nm{}".format(peopleDetails['imdb_id'][2:])
                                else:
                                    castDict['imdb_profile_url'] = " "
                                castList.append(castDict)
                                castId = castId+1 
                                
                        upcomingMovies['cast'] = castList
            
                        for k in range(0,len(movieCompleteDetailsResponse['credits']['crew'])):
                            if(movieCompleteDetailsResponse['credits']['crew'][k]['job'] == "Director"):
                                dirDict = {}
                                dirDict['name'] = movieCompleteDetailsResponse['credits']['crew'][k]['name']
                                if(movieCompleteDetailsResponse['credits']['crew'][k]['profile_path'] != None):
                                    dirDict['cast_image_url'] = "https://image.tmdb.org/t/p/w45{}".format(movieCompleteDetailsResponse['credits']['crew'][k]['profile_path'])
                                else:
                                    dirDict['cast_image_url'] = " "
                                peopleDetails = json.loads(json.dumps(api.get("https://api.themoviedb.org/3/person/{}?api_key={}".format(movieCompleteDetailsResponse['credits']['crew'][k]['id'],api_key)).json()))
                                if(peopleDetails['imdb_id']!=None):
                                    dirDict['imdb_profile_url'] = "https://www.imdb.com/name/nm{}".format(peopleDetails['imdb_id'][2:])
                                else:
                                    dirDict['imdb_profile_url'] = " "
                                dirList.append(dirDict)
                        
                        upcomingMovies['directors'] = dirList
                        
                        upcomingMovies['imdb_id'] = "https://www.imdb.com/title/{}/".format(movieCompleteDetailsResponse['imdb_id'])
                        upcomingMovies['runtime'] = movieCompleteDetailsResponse['runtime']
                        col_2.insert_one(upcomingMovies)
     
def insertPopularMoviesSV():
    api_key = "818cffde0b1e6749199b67fee1cbd032"
    client = pymongo.MongoClient("mongodb+srv://swmdb:swmdb12345@swmdb-ezh2o.mongodb.net/SWMDB?retryWrites=true&w=majority")
    db=client['SWMDB']
    col_1 = db['movies']
    col_2 = db['movieDetails']
    region = regionData["SE"]
    popularMovieURL = "https://api.themoviedb.org/3/movie/popular?api_key={}&region={}".format(api_key,region)
    popularMoviesData = json.loads(json.dumps(requests.get(popularMovieURL).json()))
    if(len(popularMoviesData['results'])!=0):
        for i in range(0,len(popularMoviesData['results'])):
            if(popularMoviesData['results'][i]['poster_path'] != None):
                if(col_1.find({"title":{"$regex":popularMoviesData['results'][i]['title'],'$options':'i'}}).count()!=0):
                    popularMovies = {}
                    popularMovie = {}
                    
                    popularMovie["_id"] = col_1.find({}).count+1
                    popularMovie['title'] = popularMoviesData['results'][i]['title']
                    popularMovie['poster_path'] = "http://image.tmdb.org/t/p/w185{}".format(popularMoviesData['results'][i]['poster_path'])
                    popularMovie['release_year'] = datetime.strptime(popularMoviesData['results'][i]['release_date'],"%Y-%m-%d").year
                    col_1.insert_one(popularMovie)
                    
                    popularMovies["_id"] = col_2.find({}).count+1
                    popularMovies['title'] = popularMoviesData['results'][i]['title']
                    popularMovies['poster_path'] = "http://image.tmdb.org/t/p/w185{}".format(popularMoviesData['results'][i]['poster_path'])
                    popularMovies['release_year'] = datetime.strptime(popularMoviesData['results'][i]['release_date'],"%Y-%m-%d").year
                    movieSearchURL = "https://api.themoviedb.org/3/search/movie?api_key={}&query={}&include_adult={}&year={}".format(popularMovies['title'],True,popularMovies['release_year'])
                    movieSearch = json.loads(json.dumps(api.get(movieSearchURL).json()))
                    if(len(movieSearch['results'])!=0):
                        popularMovies["tmdb_id"] = movieSearch['results'][0]["id"]
                        movieCompleteDetailsURL = "https://api.themoviedb.org/3/movie/{}?api_key={}&append_to_response=credits".format(popularMovies["tmdb_id"],api_key)
                        movieCompleteDetailsResponse = json.loads(json.dumps(api.get(movieCompleteDetailsURL).json()))
                        if(movieCompleteDetailsResponse['adult'] == False):
                            popularMovies['adult'] = 'No'
                        else:
                            popularMovies['adult'] = 'Yes'
                        
                        genreDetailUrl = "https://api.themoviedb.org/3/genre/movie/list?api_key={}&language=en-US".format(api_key)
                        genre = []
                        genre_temp = movieSearch['results'][0]['genre_ids']
                        genreDetails = json.loads(json.dumps(api.get(genreDetailUrl).json()))
                        for genreId in genre_temp:
                            for info in genreDetails['genres']:
                                if(info['id'] == genreId):
                                    genre.append(info['name'])
                        popularMovies['genre'] = str(" / ".join(genre))
                        popularMovies['rating'] = movieSearch['results'][0]['vote_average']
                        popularMovies['synopsis'] = movieSearch['results'][0]['overview']
                        popularMovies['likes'] = round(movieSearch['results'][0]['popularity'])
                        tmdbVideoURL = "https://api.themoviedb.org/3/movie/{}/videos?api_key={}".format(popularMovies["tmdb_id"],api_key)
                        videoData = json.loads(json.dumps(api.get(tmdbVideoURL).json()))
                        if(len(videoData['results'])!=0):
                            for j in range(0,len(videoData['results'])):
                                if(videoData['results'][j]['type'] == 'Trailer'):
                                    popularMovies['trailer'] = "https://www.youtube.com/embed/{}".format(videoData['results'][j]['key'])
                        else:
                            popularMovies['trailer'] = None
                         dirList = []
                        castList = []
                        castId = 0
                        for z in range(0,len(movieCompleteDetailsResponse['credits']['cast'])):
                            if(castId == 4):
                                break
                            else:
                                castDict = {}
                                castDict['name'] = movieCompleteDetailsResponse['credits']['cast'][castId]['name']
                                castDict['character_name'] = movieCompleteDetailsResponse['credits']['cast'][castId]['character']
                                if(movieCompleteDetailsResponse['credits']['cast'][castId]['profile_path']!=None):
                                    castDict['cast_image_url'] = "https://image.tmdb.org/t/p/w45{}".format(movieCompleteDetailsResponse['credits']['cast'][castId]['profile_path'])
                                else:
                                    castDict['cast_image_url'] = " "
                                peopleDetails = json.loads(json.dumps(api.get("https://api.themoviedb.org/3/person/{}?api_key={}".format(movieCompleteDetailsResponse['credits']['cast'][castId]['id'],api_key)).json()))
                                if(peopleDetails['imdb_id']!=None):
                                    castDict['imdb_profile_url'] = "https://www.imdb.com/name/nm{}".format(peopleDetails['imdb_id'][2:])
                                else:
                                    castDict['imdb_profile_url'] = " "
                                castList.append(castDict)
                                castId = castId+1 
                                
                        popularMovies['cast'] = castList
            
                        for k in range(0,len(movieCompleteDetailsResponse['credits']['crew'])):
                            if(movieCompleteDetailsResponse['credits']['crew'][k]['job'] == "Director"):
                                dirDict = {}
                                dirDict['name'] = movieCompleteDetailsResponse['credits']['crew'][k]['name']
                                if(movieCompleteDetailsResponse['credits']['crew'][k]['profile_path'] != None):
                                    dirDict['cast_image_url'] = "https://image.tmdb.org/t/p/w45{}".format(movieCompleteDetailsResponse['credits']['crew'][k]['profile_path'])
                                else:
                                    dirDict['cast_image_url'] = " "
                                peopleDetails = json.loads(json.dumps(api.get("https://api.themoviedb.org/3/person/{}?api_key={}".format(movieCompleteDetailsResponse['credits']['crew'][k]['id'],api_key)).json()))
                                if(peopleDetails['imdb_id']!=None):
                                    dirDict['imdb_profile_url'] = "https://www.imdb.com/name/nm{}".format(peopleDetails['imdb_id'][2:])
                                else:
                                    dirDict['imdb_profile_url'] = " "
                                dirList.append(dirDict)
                        
                        popularMovies['directors'] = dirList
                        
                        popularMovies['imdb_id'] = "https://www.imdb.com/title/{}/".format(movieCompleteDetailsResponse['imdb_id'])
                        popularMovies['runtime'] = movieCompleteDetailsResponse['runtime']
                        col_2.insert_one(popularMovies)
    
def insertNowPlayingMoviesSV():
    api_key = "818cffde0b1e6749199b67fee1cbd032"
    client = pymongo.MongoClient("mongodb+srv://swmdb:swmdb12345@swmdb-ezh2o.mongodb.net/SWMDB?retryWrites=true&w=majority")
    db=client['SWMDB']
    col_1 = db['movies']
    col_2 = db['movieDetails']
    region = regionData["SE"]
    nowPlayingMovieURL = "https://api.themoviedb.org/3/movie/now_playing?api_key={}&region={}".format(api_key,region)
    nowPlayingMovieData = json.loads(json.dumps(requests.get(nowPlayingMovieURL).json()))
    if(len(nowPlayingMovieData['results'])!=0):
        for i in range(0,len(nowPlayingMovieData['results'])):
            if(nowPlayingMovieData['results'][i]['poster_path'] != None):
                if(col_1.find({"title":{"$regex":nowPlayingMovieData['results'][i]['title'],'$options':'i'}}).count()!=0):
                    playingMovies = {}
                    playingMovie = {}
                    
                    playingMovie["_id"] = col_1.find({}).count+1
                    playingMovie['title'] = nowPlayingMovieData['results'][i]['title']
                    playingMovie['poster_path'] = "http://image.tmdb.org/t/p/w185{}".format(nowPlayingMovieData['results'][i]['poster_path'])
                    playingMovie['release_year'] = datetime.strptime(nowPlayingMovieData['results'][i]['release_date'],"%Y-%m-%d").year
                    col_1.insert_one(playingMovie)
                    
                    playingMovies["_id"] = col_2.find({}).count+1
                    playingMovies['title'] = nowPlayingMovieData['results'][i]['title']
                    playingMovies['poster_path'] = "http://image.tmdb.org/t/p/w185{}".format(nowPlayingMovieData['results'][i]['poster_path'])
                    playingMovies['release_year'] = datetime.strptime(nowPlayingMovieData['results'][i]['release_date'],"%Y-%m-%d").year
                    movieSearchURL = "https://api.themoviedb.org/3/search/movie?api_key={}&query={}&include_adult={}&year={}".format(nowPlayingMovieData['title'],True,nowPlayingMovieData['release_year'])
                    movieSearch = json.loads(json.dumps(api.get(movieSearchURL).json()))
                    if(len(movieSearch['results'])!=0):
                        playingMovies["tmdb_id"] = movieSearch['results'][0]["id"]
                        movieCompleteDetailsURL = "https://api.themoviedb.org/3/movie/{}?api_key={}&append_to_response=credits".format(playingMovies["tmdb_id"],api_key)
                        movieCompleteDetailsResponse = json.loads(json.dumps(api.get(movieCompleteDetailsURL).json()))
                        if(movieCompleteDetailsResponse['adult'] == False):
                            playingMovies['adult'] = 'No'
                        else:
                            playingMovies['adult'] = 'Yes'
                        
                        genreDetailUrl = "https://api.themoviedb.org/3/genre/movie/list?api_key={}&language=en-US".format(api_key)
                        genre = []
                        genre_temp = movieSearch['results'][0]['genre_ids']
                        genreDetails = json.loads(json.dumps(api.get(genreDetailUrl).json()))
                        for genreId in genre_temp:
                            for info in genreDetails['genres']:
                                if(info['id'] == genreId):
                                    genre.append(info['name'])
                        playingMovies['genre'] = str(" / ".join(genre))
                        playingMovies['rating'] = movieSearch['results'][0]['vote_average']
                        playingMovies['synopsis'] = movieSearch['results'][0]['overview']
                        popularMovies['likes'] = round(movieSearch['results'][0]['popularity'])
                        tmdbVideoURL = "https://api.themoviedb.org/3/movie/{}/videos?api_key={}".format(playingMovies["tmdb_id"],api_key)
                        videoData = json.loads(json.dumps(api.get(tmdbVideoURL).json()))
                        if(len(videoData['results'])!=0):
                            for j in range(0,len(videoData['results'])):
                                if(videoData['results'][j]['type'] == 'Trailer'):
                                    playingMovies['trailer'] = "https://www.youtube.com/embed/{}".format(videoData['results'][j]['key'])
                        else:
                            playingMovies['trailer'] = None
                        dirList = []
                        castList = []
                        castId = 0
                        for z in range(0,len(movieCompleteDetailsResponse['credits']['cast'])):
                            if(castId == 4):
                                break
                            else:
                                castDict = {}
                                castDict['name'] = movieCompleteDetailsResponse['credits']['cast'][castId]['name']
                                castDict['character_name'] = movieCompleteDetailsResponse['credits']['cast'][castId]['character']
                                if(movieCompleteDetailsResponse['credits']['cast'][castId]['profile_path']!=None):
                                    castDict['cast_image_url'] = "https://image.tmdb.org/t/p/w45{}".format(movieCompleteDetailsResponse['credits']['cast'][castId]['profile_path'])
                                else:
                                    castDict['cast_image_url'] = " "
                                peopleDetails = json.loads(json.dumps(api.get("https://api.themoviedb.org/3/person/{}?api_key={}".format(movieCompleteDetailsResponse['credits']['cast'][castId]['id'],api_key)).json()))
                                if(peopleDetails['imdb_id']!=None):
                                    castDict['imdb_profile_url'] = "https://www.imdb.com/name/nm{}".format(peopleDetails['imdb_id'][2:])
                                else:
                                    castDict['imdb_profile_url'] = " "
                                castList.append(castDict)
                                castId = castId+1 
                                
                        playingMovies['cast'] = castList
            
                        for k in range(0,len(movieCompleteDetailsResponse['credits']['crew'])):
                            if(movieCompleteDetailsResponse['credits']['crew'][k]['job'] == "Director"):
                                dirDict = {}
                                dirDict['name'] = movieCompleteDetailsResponse['credits']['crew'][k]['name']
                                if(movieCompleteDetailsResponse['credits']['crew'][k]['profile_path'] != None):
                                    dirDict['cast_image_url'] = "https://image.tmdb.org/t/p/w45{}".format(movieCompleteDetailsResponse['credits']['crew'][k]['profile_path'])
                                else:
                                    dirDict['cast_image_url'] = " "
                                peopleDetails = json.loads(json.dumps(api.get("https://api.themoviedb.org/3/person/{}?api_key={}".format(movieCompleteDetailsResponse['credits']['crew'][k]['id'],api_key)).json()))
                                if(peopleDetails['imdb_id']!=None):
                                    dirDict['imdb_profile_url'] = "https://www.imdb.com/name/nm{}".format(peopleDetails['imdb_id'][2:])
                                else:
                                    dirDict['imdb_profile_url'] = " "
                                dirList.append(dirDict)
                        
                        playingMovies['directors'] = dirList
                        
                        playingMovies['imdb_id'] = "https://www.imdb.com/title/{}/".format(movieCompleteDetailsResponse['imdb_id'])
                        playingMovies['runtime'] = movieCompleteDetailsResponse['runtime']
                        col_2.insert_one(playingMovies)
    
def addMovies():
    insertUpcomingMoviesUS()
    insertPopularMoviesUS()
    insertNowPlayingMoviesUS()
    insertUpcomingMoviesSV()
    insertPopularMoviesSV()
    insertNowPlayingMoviesSV()