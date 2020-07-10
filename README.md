# TDDD27 - SWMDB
SWMDB (<i>Sweden Movie Database</i>) is a web application which mainly showcases recent and old movies, their reviews, ratings and overall view about a movie in a nutshell.

# Project Members
* Lawrence Thanakumar Rajappa - lawra776@student.liu.se

# MidCourse Screencast
[https://youtu.be/YPGfy1I9KK0](https://youtu.be/YPGfy1I9KK0)

# Functional Specification
The user can login and post their reviews about a movie they had watched and they also can read reviews about a
movie they are going to watch in the future. Some of the reviews are posted by users in the system and some of the 
reviews about a movie is got from other sites such as IMDB, TMDB, and et cetera.

The user can login through username and password or OAuth login from Facebook/Google. Reviews,
movie names, etc. from other sites are obtained through API handling. These APIs' are provided by the respective websites related to movies. The user can also filter the reviews based on different parameters like age, gender, etc. Most of the movie review webistes show only English movies first and show other language movies later.
Hence, I decided to create a website to show both English and Swedish language based movies which could help
users to know what are the upcoming movies, popular movies and unpopular movies by using this website. As a 
further improvement or extension, I would like to perform sentimental analysis based on the reviews made by the 
people which could help other people to know about a movie and its content in a short span of time rather than
reading all the reviews and understanding about it.

# Technical Specification
## Main Tools
* <b>Client-Side Framework : </b>Angular 9
* <b>Back-end Framework : </b>Node.js and Express.js
* <b>Database : </b>MongoDB Atlas
* <b>Deployment : </b>Heroku

## Extra Tool(s)
* <b> Testing Back-end :</b> Postman
* <b> Editor :</b> VSCode
* <b> Database IDE : </b> Robo 3T
