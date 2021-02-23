// ============== Packages ==============================

const express = require('express');
const cors = require('cors'); 
require('dotenv').config(); 
const superAgent = require('superagent');
// ============== App ===================================

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// ============== Routes ================================

  
app.get('/location', handleGetLocation);
app.get('/weather',handleGetWeather);
  //app.get('/parks', handleGetPark);
function handleGetLocation(req, res){
  console.log(req.query, "req"); 
  const url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${req.query.city}&format=json`;
  superAgent.get(url).then(stuffComesBack =>{
    console.log(stuffComesBack.body, "body");
    // const locationData = require('./data/location.json'); 
    const output = new Location(stuffComesBack.body, req.query.city);
    res.json(output);
  });
    //const locationData = require('./data/location.json'); 
    //const output = new Location(locationData, req.query.city);
   // res.send(output);
}
 
function handleGetWeather(req, res){

  //console.log(req.query);
  const weatherData = require('./data/weather.json'); 
  let output = []; 
    
  output = weatherData.data.map(makeForecasts);

  /*for(var i = 0; i < weatherData.data.length; i++){
        output.push(new Weather(weatherData.data[i]));
    }*/
  // console.log(output, "Hello!");
  res.send(output);

}


  function Location(jsonData, cityName){
    this.search_query = cityName;
    this.formatted_query = jsonData[0].display_name;
    this.latitude = jsonData[0].lat;
    this.longitude = jsonData[0].lon;
  }

  function Weather(jsonData){
    console.log(jsonData.valid_date);
    console.log(jsonData.weather.description);
    this.time = jsonData.valid_date;
    this.forecast = jsonData.weather.description;
  }

  function makeForecasts(value, index, array){
   // console.log(array[index].valid_date);
    return new Weather(array[index]);
  }

  app.listen(PORT, () => console.log(`app is up on port http://localhost:${PORT}`)); 
  