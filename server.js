// ============== Packages ==============================
'use strict';
const express = require('express');
const cors = require('cors');
const pg = require('pg');
require('dotenv').config();
const superAgent = require('superagent');
const { response } = require('express');
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

function handleGetParks(req, res) {
  console.log(req.query.search_query, "THIS IS A THING");
  // https://developer.nps.gov/api/v1/parks?q=seattle&api_key=Zc7kHbLzEqJhfs57CwLXWt4qoW2sjdF8pw1GgfJY
  const url = `https://developer.nps.gov/api/v1/parks?q=${req.query.search_query}&api_key=${process.env.PARKS_API_KEY}`;
  superAgent.get(url).then(stuffComesBack => {
    const output = stuffComesBack.body.data.map(getParks);

    res.json(output);
  }).catch(error => {
    console.log(error);
    response.status(500).send("Looks like there's a problem with getting the Parks.");
  });
}
//app.get('/parks', handleGetPark);
function handleGetLocation(req, res) {
  // console.log(req.query, "req"); 

  checkForExisting(req, res);

  //const locationData = require('./data/location.json'); 
  //const output = new Location(locationData, req.query.city);
  // res.send(output);
}

function handleGetWeather(req, res) {

  //console.log(req.query);
  const weatherData = require('./data/weather.json');
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${req.query.latitude}&lon=${req.query.longitude}&key=${process.env.WEATHER_API_KEY}`;
  //let output = []; 
  superAgent.get(url).then(stuffComesBack => {
    //console.log(stuffComesBack.body, "body");
    // const locationData = require('./data/location.json'); 
    const output = weatherData.data.map(makeForecasts);
    res.json(output);
  }).catch(error => {
    console.log(error);
    response.status(500).send("Looks like there's a problem with getting the weather.");
  });
}
//search == req.query.search_query
function checkForExisting(req, res) {
  // to check if it exists 
  //console.log({ req });
  const checkData = 'SELECT * FROM city_explorer where search_query = $1';
  const checkArray = [req.query.city];
  //to add it to database
  const query = {
    name: 'fetch',
    text: checkData,
    values: checkArray
  };
  client.query(query).then(returnedData => {
    console.log({ returnedData });

    if (returnedData.rowCount === 0) {
      const url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${req.query.city}&format=json`;
      superAgent.get(url).then(stuffComesBack => {
        const output = new Location(stuffComesBack.body, req.query.city);
        const addData = 'INSERT INTO city_explorer (search_query, formatted_query, latitude, longitude) VALUES($1, $2, $3, $4)';
        const addArray = [output.search_query, output.formatted_query, output.latitude, output.longitude];
        client.query(addData, addArray).catch(error => {
          console.log(error);
          response.status(500).send("Looks like there's a problem with getting locations.");
        });
        res.json(output);
      });
    }
    else {
      console.log({ returnedData });
      // console.log("True");
      res.json(returnedData.rows[0]);
    }
  });
  //console.log({ returnedData });
}
/*app.get('/data',(req,res) => {
  
  const checkData = 'SELECT * FROM searches_db where city_name = $1`
  const checkArray = [req.query.search_query];
   client.query(checkData,checkArray).then(cameBack => {
     if(cameBack.query.row) {
       add to query.
     }
   }).
  const checkArray =
   items.push(req.query);
   const sqlString = (INSERT INTO searches_db (name, fav, class) VALUES($1 $2 $3);
   const sqlArray = [req.query.name, req.query.fav,req.query.class];
  
  });


  app.get('/makeData',(req,res) => {
  location.push(req.query);
  client.query('SELECT * FROM searches_db').then(stuffThatComesBack => {
    console.log(stuffThatComesBack);
    res.send('yo');
  });
    stuff from url from client: req.query
    stuff from xxx : res.query
  step 1. create a db "CREATE DATABASE searches_db"
  step 2. create a schema file for schema.sql
  step 3. run schema.sql file with 'psql -f schema.sql 
  step 4. install pg 'npm install -S pg'
  step 5. setup pg in your app
});*/

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
  return new Weather(array[index]);
}

function getParks(value, index, array) {
  //console.log(array[index], "MORE1");
  return new Parks(array[index]);
}

client.connect().then(() => {
  app.listen(PORT, () => console.log(`app is up on port http://localhost:${PORT}`));
});
//app.listen(PORT, () => console.log(`app is up on port http://localhost:${PORT}`));
  //p