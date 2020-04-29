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

def englishMovieDatabase():
    client = pymongo.MongoClient("mongodb+srv://swmdb:swmdb12345@swmdb-ezh2o.mongodb.net/SWMDB?retryWrites=true&w=majority")
    db=client['SWMDB']
    col_1 = db['movies']
    not_Added = []
    for i in range(0,len(movieTitles)):
        movieDetailsUrl_1 = "https://api.themoviedb.org/3/search/movie?api_key={}&query={}&include_adult={}&year={}".format(api_key,movieTitles[i],True,movieYearsList[i])
        movieDetails_1 = json.loads(json.dumps(api.get(movieDetailsUrl_1).json()))
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

englishMovieDatabase()

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