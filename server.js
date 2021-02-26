// ============== Packages ==============================
'use strict';
const express = require('express');
const cors = require('cors');
const pg = require('pg');
require('dotenv').config();
const superAgent = require('superagent');
const { response, json } = require('express');
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => console.log(error));
// ============== App ===================================

const app = express();
app.use(cors());
const PORT = process.env.PORT;

// ============== Routes ================================
//IMPORTANT, can decale a port from our console if we want 

app.get('/location', handleGetLocation);
app.get('/weather', handleGetWeather);
app.get('/parks', handleGetParks);
app.get('/movies', handleGetMovies);
app.get('/yelp', handleGetYelp);

function handleGetYelp(req, res) {

  const url = `https://api.yelp.com/v3/businesses/search?term=restaurant&limit=5&latitude=${req.query.latitude}&longitude=${req.query.longitude}`;
  superAgent.get(url).set('Authorization', `Bearer ${process.env.YELP_API_KEY}`).then(stuffComesBack => {
    console.log(stuffComesBack.body.businesses);
    const output = stuffComesBack.body.businesses.map(getYelp);
    res.json(output);
  }).catch(error => {
    console.log(error);
    res.status(500).send("an error has occured");
  });
}
function handleGetMovies(req, res) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIES_API_KEY}&query=${req.query.search_query}`;
  superAgent.get(url).then(stuffComesBack => {
    // console.log(stuffComesBack.body.results);
    const output = stuffComesBack.body.results.map(getMovies);
    res.json(output);
  }).catch(error => {
    // console.log(error);
    res.status(500).send("an error has occured");
  });
}
function handleGetParks(req, res) {

  const url = `https://developer.nps.gov/api/v1/parks?q=${req.query.search_query}&api_key=${process.env.PARKS_API_KEY}`;
  superAgent.get(url).then(stuffComesBack => {
    const output = stuffComesBack.body.data.map(getParks);

    res.json(output);
  }).catch(error => {
    res.send(error);
    //console.log(error);
    res.status(500).send("Looks like there's a problem with getting the Parks.");
  });
}


function handleGetLocation(req, res) {
  checkForExisting(req, res);
}

function handleGetWeather(req, res) {
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?days=5&lat=${req.query.latitude}&lon=${req.query.longitude}&key=${process.env.WEATHER_API_KEY}`;
  //let output = []; 
  superAgent.get(url).then(stuffComesBack => {

    const output = stuffComesBack.body.data.map(makeForecasts);
    res.json(output);
  }).catch(error => {
    response.send(error);
    //console.log(error);
    response.status(500).send("Looks like there's a problem with getting the Parks.");
  });
}


//search == req.query.search_query
function checkForExisting(req, res) {
  const checkData = 'SELECT * FROM city_explorer where search_query = $1';
  const checkArray = [req.query.city];
  //to add it to database

  //returnedData => checkifInfoisInDataBase(returnedData,res,req)
  client.query(checkData, checkArray).then(returnedData => {
    // console.log({ returnedData });
    if (returnedData.rowCount === 0) {
      const url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${req.query.city}&format=json`;
      superAgent.get(url).then(stuffComesBack => {
        const output = new Location(stuffComesBack.body, req.query.city);
        const addData = 'INSERT INTO city_explorer (search_query, formatted_query, latitude, longitude) VALUES($1, $2, $3, $4)';
        const addArray = [output.search_query, output.formatted_query, output.latitude, output.longitude];

        client.query(addData, addArray).catch(error => {
          console.log(error);
          res.status(500).send("Looks like there's a problem with getting the data.");
        });
        res.json(output);
      });
    }
    else {
      res.json(returnedData.rows[0]);
    }
  });
  //console.log({ returnedData });
}

/*function checkLocations(req, res) {
  const checkData = 'SELECT * FROM city_explorer where search_query = $1';
  const checkArray = [req.query.city];
  console.log(req.query.city);
  //to add it to database
  const query = {
    name: 'fetch',
    text: checkData,
    values: checkArray
  };
  //returnedData => checkifInfoisInDataBase(returnedData,res,req)
  client.query(query).then(returnedData => CallAPI(returnedData, res, req));
  //console.log({ returnedData });
}

function checkifInfoisInDataBase(returnedData, res, req) {
  console.log
  if (returnedData.rowCount === 0) {
    const url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${req.query.city}&format=json`;
    superAgent.get(url).then(stuffComesBack => {
      const output = new Location(stuffComesBack.body, req.query.city);
      const addData = 'INSERT INTO city_explorer (search_query, formatted_query, latitude, longitude) VALUES($1, $2, $3, $4)';
      const addArray = [output.search_query, output.formatted_query, output.latitude, output.longitude];

      client.query(addData, addArray).catch(error => {
        console.log(error);
        res.status(500).send("Looks like there's a problem with getting the data.");
      });
      res.json(output);
    });
  }
  else {
    res.json(returnedData.rows[0]);
  }
}
}*/


function Parks(JsonData) {
  this.name = JsonData.fullName;
  this.address = `${JsonData.addresses[0].line1}, ${JsonData.addresses[0].city}, ${JsonData.addresses[0].stateCode} , ${JsonData.addresses[0].postalCode}`;
  this.fee = JsonData.entranceFees[0].cost;
  this.description = JsonData.description;
  this.url = JsonData.url;
}
function Location(jsonData, cityName) {
  this.search_query = cityName;
  this.formatted_query = jsonData[0].display_name;
  this.latitude = jsonData[0].lat;
  this.longitude = jsonData[0].lon;
}

function Weather(jsonData) {

  this.time = jsonData.valid_date;
  this.forecast = jsonData.weather.description;
}

function makeForecasts(value, index, array) {
  //console.log(array[index], "WEATHER INDEX DATA");
  return new Weather(array[index]);
}

function getYelp(value, index, array) {
  return new Yelp(array[index]);
}
function getParks(value, index, array) {
  //console.log(array[index], "MORE1");
  return new Parks(array[index]);
}
function getMovies(value, index, array) {
  return new Movies(array[index]);
}

function Movies(jsonData) {
  this.title = jsonData.title;
  this.overview = jsonData.overview;
  this.avarage_votes = jsonData.vote_average;
  this.total_votes = jsonData.vote_count;
  this.image_url = `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${jsonData.poster_path}` || 'sorry no image';
  this.popularity = jsonData.popularity;
  this.released_on = jsonData.release_date;
}
function Yelp(jsonData) {
  this.name = jsonData.name;
  this.image_url = jsonData.image_url;
  this.price = jsonData.price;
  this.rating = jsonData.rating;
  this.url = jsonData.url;

}

client.connect().then(() => {
  app.listen(PORT, () => console.log(`app is up on port http://localhost:${PORT}`));
});
//app.listen(PORT, () => console.log(`app is up on port http://localhost:${PORT}`));
