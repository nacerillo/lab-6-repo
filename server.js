// ============== Packages ==============================

const express = require('express');
const cors = require('cors'); // just kinda works and we need it
// If this line of code comes, delete it const { response } = require('express');
require('dotenv').config(); // read the `.env` file's saved env variables AFTER reading the terminal's real env's variables


// ============== App ===================================

const app = express(); // express() will return a fully ready to run server object
app.use(cors()); // enables local processes to talk to the server // Cross Origin Resource Sharing

const PORT = process.env.PORT || 3000; // process.env is boilerplace the variable name is potato


// ============== Routes ================================


  
  app.get('/location', handleGetLocation);
  function handleGetLocation(req, res){
    // console.log(req, res);
    console.log(req.query); // {city: seattle} /// req.query.city : seattle
    const dataFromTheFile = require('./data/location.json'); // in an express server, we can synchronously get data from a local json file without a .then
    const output = new Location(dataFromTheFile, req.query.city);
    res.send(output);

  }
 
  /*app.get('/location', handleGetWeather);
  function handleGetWeather(req, res){
    // console.log(req, res);
    console.log(req.query); // {city: seattle} /// req.query.city : seattle
    const dataFromTheFile = require('./data/weather.json'); // in an express server, we can synchronously get data from a local json file without a .then
    const output = new Weather(dataFromTheFile, req.query.city);
    res.send(output);

  }*/


  function Location(dataFromTheFile, cityName){
    this.search_query = cityName;
    this.formatted_query = dataFromTheFile[0].display_name;
    this.latitude = dataFromTheFile[0].lat;
    this.longitude = dataFromTheFile[0].lon;
  }


  app.listen(PORT, () => console.log(`app is up on port http://localhost:${PORT}`)); 
  