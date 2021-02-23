// ============== Packages ==============================

const express = require('express');
const cors = require('cors'); 
require('dotenv').config(); 

// ============== App ===================================

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// ============== Routes ================================

  
  app.get('/location', handleGetLocation);
  app.get('/weather',handleGetWeather);
  function handleGetLocation(req, res){
    console.log(req.query); 
    const locationData = require('./data/location.json'); 
    const output = new Location(locationData, req.query.city);
    res.send(output);
  }
 
  app.get('/weather', handleGetWeather);
  function handleGetWeather(req, res){

    console.log(req.query);
    const weatherData = require('./data/weather.json'); 
    const output = []; 
    for(var i = 0; i < weatherData.data.length; i++){
        output.push(new Weather(weatherData,i));
    }
    res.send(output);

  }


  function Location(jsonData, locationName){
    this.search_query = locationName;
    this.formatted_query = jsonData[0].display_name;
    this.latitude = jsonData[0].lat;
    this.longitude = jsonData[0].lon;
  }

  function Weather(jsonData, index){
    this.time = jsonData.data[index].valid_date;
    this.forecast = jsonData.data[index].weather.description;
  }

  app.listen(PORT, () => console.log(`app is up on port http://localhost:${PORT}`)); 
  