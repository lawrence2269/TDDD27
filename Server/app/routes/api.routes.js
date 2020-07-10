module.exports = (app) =>{
    const usersController = require("../controllers/users.controller.js");
    const moviesController = require("../controllers/movies.controller.js");
    const adminController = require("../controllers/admin.controller.js");

    //Login
    app.post("/login",usersController.login);

    //Creates a user
    app.post("/createuser",usersController.create);

    //Change password
    app.post("/changepwd",usersController.changePassword);

    //Deactivate user
    app.post("/admin/deactivate",adminController.deactivateUser);

    //Retrieve list of users
    app.get("/admin/users",adminController.getUsers);

    //Add movies requested by users
    app.post("/admin/addmovies",adminController.addMovies);

    //Delete a user
    app.post("/admin/deleteuser",adminController.deleteUser);

    //Retrieve all languages
    app.get("/languages",moviesController.getLanguages);

    //Retrieve all countries
    app.get("/countries",moviesController.getCountries);

    //Retrieve all movies
    app.get("/movies",moviesController.findAll);

    //Retrieve upcoming movies
    app.get("/upcomingmovies",moviesController.upcomingMovies);

    //Retrieve playing movies
    app.get("/newmovies",moviesController.nowPlayingMovies);

    //Retrieve similar movies
    app.get("/similarmovies",moviesController.similarMovies);

    //Retrieve popular movies
    app.get("/popularmovies",moviesController.popularMovies);

    //Request a movie
    app.post("/requestmovie",moviesController.requestMovie);

    //Retrieve a list of genre
    app.get("/genre",moviesController.getGenre);

    //Insert a review about a movie
    app.post("/createreview",moviesController.createReview);

    //Get reviews for a movie
    app.get("/userreviews",moviesController.getReview);

    //Retrieve a list of years
    app.get("/years",moviesController.getYears);

    //Retrieve a list of ratings
    app.get("/ratings",moviesController.getRatings);

    //Retrieve details about a movie.
    app.get("/movieDetails",moviesController.getMovieDetails);
}