// ============== Packages ==============================

const express = require('express');
const cors = require('cors'); 
require('dotenv').config(); 


// ============== App ===================================

const app = express();

const PORT = process.env.PORT || 3000;


// ============== Routes ================================


  
  app.get('/location', handleGetLocation);
  app.get('/weather',handleGetWeather);
  function handleGetLocation(req, res){
    console.log(req.query); 
    const dataFromTheFile = require('./data/location.json'); 
    const output = new Location(dataFromTheFile, req.query.city);
    res.send(output);
  }
 
  app.get('/weather', handleGetWeather);
  function handleGetWeather(req, res){

    console.log(req.query);
    const dataFromTheFile = require('./data/weather.json'); 
    const output = []; 
    for(var i = 0; i < dataFromTheFile.data.length; i++){
        output.push(new Weather(dataFromTheFile,i));
    }
    res.send(output);

  }


  function Location(dataFromTheFile, locationName){
    this.search_query = locationName;
    this.formatted_query = dataFromTheFile[0].display_name;
    this.latitude = dataFromTheFile[0].lat;
    this.longitude = dataFromTheFile[0].lon;
  }

  function Weather(dataFromTheFile, index){
    this.time = dataFromTheFile.data[index].valid_date;
    this.forecast = dataFromTheFile.data[index].weather.description;
  }

  app.listen(PORT, () => console.log(`app is up on port http://localhost:${PORT}`)); 
  