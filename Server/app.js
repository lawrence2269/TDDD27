const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

let port = process.env.PORT || 3000;

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuring the database
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect(dbConfig.url, {useNewUrlParser: true, useUnifiedTopology: true});
const conn = mongoose.connection;
mongoose.connection.once('open', () => { console.log('MongoDB Connected'); });
mongoose.connection.on('error', (err) => { console.log('MongoDB connection error: ', err); }); 

// Require routes
require('./app/routes/api.routes.js')(app);

app.listen(port, () => console.log(`Listening on port ${port}!`))