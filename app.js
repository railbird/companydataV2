'use strict';

// load required modules
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/api');

const app = express();

// Verbindung zur Datenbank herstellen
mongoose.Promose = global.Promise;
mongoose.connect('mongodb://heroku_jtj9mgwt:rcvs815upbfcvujccf04pahgah@ds161022.mlab.com:61022/heroku_jtj9mgwt');
const db = mongoose.connection;

db.on('error', err => {
  console.log("connection error: " + err);
});
db.once("open", () => {
  console.log("connected to mongoDB...");
});

// Middleware | TO DO: clear important params from req object
// serves static page / frontend
app.use(express.static(__dirname + '/public'));

// setting up the router
app.use('/api', routes);

// catch all 404 errors and forward to error handler
app.use((req, res, next) => {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

module.exports = app;
