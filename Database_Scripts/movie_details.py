# -*- coding: utf-8 -*-
"""
Created on Wed Apr 22 21:53:44 2020

@author: lawrence
"""
import pandas as pd
import requests as api
import pymongo
import json
import dns
from datetime import datetime

moviesData = pd.read_csv("tmdb_5000_movies.csv")
movieYearsList = list(moviesData['release_date'])
movieTitles = list(moviesData['original_title'])

api_key = "818cffde0b1e6749199b67fee1cbd032"

swmovie = pd.read_csv("Swedish_movies_list.csv",encoding="utf-8")
swmovieList = list(swmovie['movieName'])
swmovieYear = list(swmovie['ReleaseYear'])

from datetime import datetime
movieYearsList = [datetime.strptime(m,'%Y-%m-%d').year for m in movieYearsList]


# def movieDatabase():
#     client = pymongo.MongoClient("mongodb+srv://swmdb:swmdb12345@swmdb-ezh2o.mongodb.net/SWMDB?retryWrites=true&w=majority")
#     db=client['SWMDB']
#     col_1 = db['movies']
#     not_Added = []
#     genreDetailUrl = "https://api.themoviedb.org/3/genre/movie/list?api_key={}&language=en-US".format(api_key)
#     for i in range(0,len(movieTitles)):
#         movieDetailsUrl_1 = "https://api.themoviedb.org/3/search/movie?api_key={}&query={}&include_adult={}&year={}".format(api_key,movieTitles[i],True,movieYearsList[i])
#         movieDetails_1 = json.loads(json.dumps(api.get(movieDetailsUrl_1).json()))
#         if(len(movieDetails_1['results'])!=0):
#             movies = {}
#             movies["_id"] = i+1
#             movies["tmdb_id"] = movieDetails_1['results'][0]["id"]
#             movies["title"] = movieDetails_1['results'][0]['title']
#             movies["poster_path"] = "http://image.tmdb.org/t/p/w185{}".format(movieDetails_1['results'][0]['poster_path'])
#             movies["overview"] = movieDetails_1['results'][0]['overview']
#             genre = []
#             genre_temp = movieDetails_1['results'][0]['genre_ids']
#             genreDetails = json.loads(json.dumps(api.get(genreDetailUrl).json()))
#             for genreId in genre_temp:
#                 for info in genreDetails['genres']:
#                     if(info['id'] == genreId):
#                         genre.append(info['name'])
#             movies['genre'] = genre
#             if(movieDetails_1['results'][0]["adult"] == False):
#                 movies["adult_Content"] = "No"
#             else:
#                 movies["adult_Content"] = "Yes"
#             movies['released_year'] = datetime.strptime(movieDetails_1['results'][0]['release_date'],"%Y-%m-%d").year
#             movies['language'] = movieDetails_1['results'][0]['original_language'].upper()
#             col_1.insert_one(movies)
#         else:
#             not_Added.append(movieTitles[i])
#     return not_Added

# movieDatabase()

def englishMoviesDatabase():
    client = pymongo.MongoClient("mongodb+srv://swmdb:swmdb12345@swmdb-ezh2o.mongodb.net/SWMDB?retryWrites=true&w=majority")
    db=client['SWMDB']
    col_1 = db['movies']
    not_Added = []
    for i in range(0,1000):
        movieDetailsUrl = "https://api.themoviedb.org/3/search/movie?api_key={}&query={}&include_adult={}&year={}".format(api_key,movieTitles[i],True,movieYearsList[i])
        movieDetails_1 = json.loads(json.dumps(api.get(movieDetailsUrl).json()))
        if(len(movieDetails_1['results'])!=0):
            movies = {}
            movies["_id"] = i+1
            movies["tmdb_id"] = movieDetails_1['results'][0]["id"]
            movies["title"] = movieDetails_1['results'][0]['title']
            movies["poster_path"] = "http://image.tmdb.org/t/p/w185{}".format(movieDetails_1['results'][0]['poster_path'])
            
            col_1.insert_one(movies)
        else:
          not_Added.append(movieTitles[i])
    return not_Added

englishMoviesDatabase()

def addReleaseYear():
    client = pymongo.MongoClient("mongodb+srv://swmdb:swmdb12345@swmdb-ezh2o.mongodb.net/SWMDB?retryWrites=true&w=majority")
    db=client['SWMDB']
    col_2 = db['movieDetails']
    col_1 = db['movies']
    # for i in range(0,len(movieTitles)):
    #     if(col_2.find({"title":{"$eq":movieTitles[i]}}).count()!=0):
    #         print("====>Inside if")
    #         myQuery = {"title":{"$eq":movieTitles[i]}}
    #         newValues = {"$set":{"release_year":movieYearsList[i]}}
    #         col_2.update_one(myQuery,newValues)
    records = col_1.find({})
    for movie in records:
        #print("movie id is: "+str(movie["_id"]))
        if("release_year" not in movie):
            movieCompleteDetailsURL = "https://api.themoviedb.org/3/movie/{}?api_key={}".format(movie["tmdb_id"],api_key)
            movieCompleteDetailsResponse = json.loads(json.dumps(api.get(movieCompleteDetailsURL).json()))
            print("movie id is: "+str(movie["_id"])+"\t"+str(datetime.strptime(movieCompleteDetailsResponse['release_date'],"%Y-%m-%d").year))
            data = {"$set":{"release_year":datetime.strptime(movieCompleteDetailsResponse['release_date'],"%Y-%m-%d").year}}   
            query = {"_id":movie["_id"]}
            col_1.update_one(query, data)
            
addReleaseYear()
  
def englishMovieDetailsDatabase():
    client = pymongo.MongoClient("mongodb+srv://swmdb:swmdb12345@swmdb-ezh2o.mongodb.net/SWMDB?retryWrites=true&w=majority")
    db=client['SWMDB']
    col_2 = db['movieDetails']
    not_Added = []
    for i in range(0,1001):
        movieDetailsUrl = "https://api.themoviedb.org/3/search/movie?api_key={}&query={}&include_adult={}&year={}".format(api_key,movieTitles[i],True,movieYearsList[i])
        movieDetails_1 = json.loads(json.dumps(api.get(movieDetailsUrl).json()))
        if(len(movieDetails_1['results'])!=0):
            movies = {}
            movies["_id"] = i+1
            movies["tmdb_id"] = movieDetails_1['results'][0]["id"]
            movies["title"] = movieDetails_1['results'][0]['title']
            movies["poster_path"] = "http://image.tmdb.org/t/p/w185{}".format(movieDetails_1['results'][0]['poster_path'])            
            movieCompleteDetailsURL = "https://api.themoviedb.org/3/movie/{}?api_key={}&append_to_response=credits".format(movies["tmdb_id"],api_key)
            movieCompleteDetailsResponse = json.loads(json.dumps(api.get(movieCompleteDetailsURL).json()))
            
            if(movieCompleteDetailsResponse['adult'] == False):
                movies['adult'] = 'No'
            else:
                movies['adult'] = 'Yes'
            
            genreDetailUrl = "https://api.themoviedb.org/3/genre/movie/list?api_key={}&language=en-US".format(api_key)
            genre = []
            genre_temp = movieDetails_1['results'][0]['genre_ids']
            genreDetails = json.loads(json.dumps(api.get(genreDetailUrl).json()))
            for genreId in genre_temp:
                for info in genreDetails['genres']:
                    if(info['id'] == genreId):
                        genre.append(info['name'])
            movies['genre'] = str(" / ".join(genre))
            
            movies['rating'] = movieDetails_1['results'][0]['vote_average']
            movies['synopsis'] = movieDetails_1['results'][0]['overview']
            movies['likes'] = round(movieDetails_1['results'][0]['popularity'])
            
            tmdbVideoURL = "https://api.themoviedb.org/3/movie/{}/videos?api_key={}".format(movies["tmdb_id"],api_key)
            videoData = json.loads(json.dumps(api.get(tmdbVideoURL).json()))
            if(len(videoData['results'])!=0):
                for j in range(0,len(videoData['results'])):
                    if(videoData['results'][j]['type'] == 'Trailer'):
                        movies['trailer'] = "https://www.youtube.com/embed/{}".format(videoData['results'][j]['key'])
            else:
                movies['trailer'] = None
                
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
                    castDict['cast_image_url'] = "https://image.tmdb.org/t/p/w45{}".format(movieCompleteDetailsResponse['credits']['cast'][castId]['profile_path'])
                    peopleDetails = json.loads(json.dumps(api.get("https://api.themoviedb.org/3/person/{}?api_key={}".format(movieCompleteDetailsResponse['credits']['cast'][castId]['id'],api_key)).json()))
                    castDict['imdb_profile_url'] = "https://www.imdb.com/name/nm{}".format(peopleDetails['imdb_id'][2:])
                    castList.append(castDict)
                    castId = castId+1  
            
            # castFlag = True
            
            # while(castFlag):
            #     if(len(movieCompleteDetailsResponse['credits']['cast'])<=4):
            #         #if(movieCompleteDetailsResponse['credits']['cast'][castId]['profile_path']!=None):
            #         castDict = {}
            #         castDict['name'] = movieCompleteDetailsResponse['credits']['cast'][castId]['name']
            #         castDict['character_name'] = movieCompleteDetailsResponse['credits']['cast'][castId]['character']
            #         castDict['cast_image_url'] = "https://image.tmdb.org/t/p/w45{}".format(movieCompleteDetailsResponse['credits']['cast'][castId]['profile_path'])
            #         peopleDetails = json.loads(json.dumps(api.get("https://api.themoviedb.org/3/person/{}?api_key={}".format(movieCompleteDetailsResponse['credits']['cast'][castId]['id'],api_key)).json()))
            #         castDict['imdb_profile_url'] = "https://www.imdb.com/name/nm{}".format(peopleDetails['imdb_id'][2:])
            #         castList.append(castDict)
            #         castId+=1
            #         if(castId == len(movieCompleteDetailsResponse['credits']['cast'])):
            #             castFlag == False
            #     else:
            #         #if(movieCompleteDetailsResponse['credits']['cast'][castId]['profile_path']!=None):
            #         castDict = {}
            #         castDict['name'] = movieCompleteDetailsResponse['credits']['cast'][castId]['name']
            #         castDict['character_name'] = movieCompleteDetailsResponse['credits']['cast'][castId]['character']
            #         castDict['cast_image_url'] = "https://image.tmdb.org/t/p/w45{}".format(movieCompleteDetailsResponse['credits']['cast'][castId]['profile_path'])
            #         peopleDetails = json.loads(json.dumps(api.get("https://api.themoviedb.org/3/person/{}?api_key={}".format(movieCompleteDetailsResponse['credits']['cast'][castId]['id'],api_key)).json()))
            #         castDict['imdb_profile_url'] = "https://www.imdb.com/name/nm{}".format(peopleDetails['imdb_id'][2:])
            #         castList.append(castDict)
            #         castId+=1
            #         if(castId == 4):
            #             castFlag == False
            movies['cast'] = castList
            
            for k in range(0,len(movieCompleteDetailsResponse['credits']['crew'])):
                if(movieCompleteDetailsResponse['credits']['crew'][k]['job'] == "Director"):
                    dirDict = {}
                    dirDict['name'] = movieCompleteDetailsResponse['credits']['crew'][k]['name']
                    if(movieCompleteDetailsResponse['credits']['crew'][k]['profile_path'] != None):
                        dirDict['cast_image_url'] = "https://image.tmdb.org/t/p/w45{}".format(movieCompleteDetailsResponse['credits']['crew'][k]['profile_path'])
                    peopleDetails = json.loads(json.dumps(api.get("https://api.themoviedb.org/3/person/{}?api_key={}".format(movieCompleteDetailsResponse['credits']['crew'][k]['id'],api_key)).json()))
                    dirDict['imdb_profile_url'] = "https://www.imdb.com/name/nm{}".format(peopleDetails['imdb_id'][2:])
                    dirList.append(dirDict)
            
            movies['directors'] = dirList
            
            movies['imdb_id'] = "https://www.imdb.com/title/{}/".format(movieCompleteDetailsResponse['imdb_id'])
            movies['runtime'] = movieCompleteDetailsResponse['runtime']
            
            col_2.insert_one(movies)
            
        else:
            not_Added.append(movieTitles[i])
    return not_Added

englishMovieDetailsDatabase()

def swedishMovieDatabase():
    client = pymongo.MongoClient("mongodb+srv://swmdb:swmdb12345@swmdb-ezh2o.mongodb.net/SWMDB?retryWrites=true&w=majority")
    db=client['SWMDB']
    col_1 = db['movies']
    not_Added_Swedish = []
    added = []
    totalCount = [c['_id'] for c in col_1.find().sort("_id",-1).limit(1)][0]
    for i in range(0,len(swmovieList)):
        movieDetailsUrl_1 = "https://api.themoviedb.org/3/search/movie?api_key={}&language={}&query={}&include_adult={}&year={}".format(api_key,"sv",swmovieList[i],True,swmovieYear[i])
        movieDetails_1 = json.loads(json.dumps(api.get(movieDetailsUrl_1).json()))
        if(len(movieDetails_1['results'])!=0):
            totalCount = totalCount+1
            movies = {}
            movies["_id"] = totalCount
            movies["tmdb_id"] = movieDetails_1['results'][0]["id"]
            movies["title"] = movieDetails_1['results'][0]['original_title']
            movies["poster_path"] = "http://image.tmdb.org/t/p/w185{}".format(movieDetails_1['results'][0]['poster_path'])
            col_1.insert_one(movies)
            added.append(movies)
        else:
            not_Added_Swedish.append(swmovieList[i])
    return not_Added_Swedish,added

swedishMovieDatabase()

def addCountries():
    client = pymongo.MongoClient("mongodb+srv://swmdb:swmdb12345@swmdb-ezh2o.mongodb.net/SWMDB?retryWrites=true&w=majority")
    db=client['SWMDB']
    col = db['countries']
    input_file = open ('countries.txt',"r")
    contents = input_file.read()
    contents = contents.split("\n")
    for i in range(0,len(contents)):
        countries = {}
        countries["_id"] = i + 1
        countries["countryName"] = contents[i]
        col.insert_one(countries)

addCountries()

def addLanguages():
    client = pymongo.MongoClient("mongodb+srv://swmdb:swmdb12345@swmdb-ezh2o.mongodb.net/SWMDB?retryWrites=true&w=majority")
    db=client['SWMDB']
    col = db['languages']
    languageData = pd.read_csv("Languages.csv",encoding="utf-8")
    languageShortCode = list(languageData['639-1 '])
    languageName = list(languageData['Language name '])
    for i in range(0,len(languageShortCode)):
        language = {}
        language["_id"] = i + 1
        language["languageCode"] = languageShortCode[i]
        language["languageName"] = languageName[i]
        col.insert_one(language)
    print("Total Documents are:",col.find({}).count())

addLanguages()


#Changing poster sizes for existing movies
def changePosterSize():
    client = pymongo.MongoClient("mongodb+srv://swmdb:swmdb12345@swmdb-ezh2o.mongodb.net/SWMDB?retryWrites=true&w=majority")
    db=client['SWMDB']
    col_2 = db['movieDetails']
    posterPathURL_L = "http://image.tmdb.org/t/p/w342{}"
    api_key = "818cffde0b1e6749199b67fee1cbd032"
    records = col_2.find({},{"title":1,"_id":1,"release_year":1})
    for i in records:
        movieDetailsUrl = "https://api.themoviedb.org/3/search/movie?api_key={}&query={}&include_adult={}&year={}".format(api_key,i['title'],True,i['release_year'])
        movieDetails_1 = json.loads(json.dumps(api.get(movieDetailsUrl).json()))  
        if(len(movieDetails_1['results'])!=0):
            query = {"_id":{"$eq":i["_id"]}}
            replacement = {"$set":{"poster_path":posterPathURL_L.format(movieDetails_1['results'][0]['poster_path'])}}
            result = col_2.update_one(query, replacement)
            print(str(i["_id"])+" \t "+str(i['release_year']))
changePosterSize()

#Changing poster sizes for existing movies
def changePosterSizeV2():
    client = pymongo.MongoClient("mongodb+srv://swmdb:swmdb12345@swmdb-ezh2o.mongodb.net/SWMDB?retryWrites=true&w=majority")
    db=client['SWMDB']
    col_2 = db['movieDetails']
    posterPathURL = "http://image.tmdb.org/t/p/w185{}"
    api_key = "818cffde0b1e6749199b67fee1cbd032"
    records = col_2.find({},{"_id":1,"tmdb_id":1})
    for i in records:
        movieCompleteDetailsURL = "https://api.themoviedb.org/3/movie/{}?api_key={}".format(i["tmdb_id"],api_key)
        movieCompleteDetailsResponse = json.loads(json.dumps(api.get(movieCompleteDetailsURL).json()))
        print("movie id is: "+str(i["_id"]))
        query = {"_id":{"$eq":i["_id"]}}
        replacement = {"$set":{"poster_path_s":posterPathURL.format(movieCompleteDetailsResponse['poster_path'])}}
        col_2.update_one(query, replacement)

changePosterSizeV2()
    