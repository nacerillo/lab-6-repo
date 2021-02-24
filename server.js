// ============== Packages ==============================

const express = require('express');
const cors = require('cors'); 
require('dotenv').config(); 
const superAgent = require('superagent');
const { response } = require('express');
// ============== App ===================================

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// ============== Routes ================================

  
app.get('/location', handleGetLocation);
app.get('/weather',handleGetWeather);
app.get('/parks',handleGetParks);

function handleGetParks(req,res){
  console.log(req.query.search_query, "THIS IS A THING");
  // https://developer.nps.gov/api/v1/parks?q=seattle&api_key=Zc7kHbLzEqJhfs57CwLXWt4qoW2sjdF8pw1GgfJY
  const url = `https://developer.nps.gov/api/v1/parks?q=${req.query.search_query}&api_key=${process.env.PARKS_API_KEY}`;
  superAgent.get(url).then(stuffComesBack =>{
    //console.log(stuffComesBack.body.data, "parks");
    // const locationData = require('./data/location.json'); 
   // const output = new Parks(stuffComesBack.body.data);
   const output = stuffComesBack.body.data.map(getParks);

    res.json(output);
  }).catch(error => {
    response.send(error);
  });
}
//app.get('/parks', handleGetPark);
function handleGetLocation(req, res){
 // console.log(req.query, "req"); 
  const url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${req.query.city}&format=json`;
  superAgent.get(url).then(stuffComesBack =>{
   //console.log(stuffComesBack.body, "body");
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
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${req.query.latitude}&lon=${req.query.longitude}&key=${process.env.WEATHER_API_KEY}`;
  let output = []; 
  superAgent.get(url).then(stuffComesBack =>{
    //console.log(stuffComesBack.body, "body");
    // const locationData = require('./data/location.json'); 
    const output = weatherData.data.map(makeForecasts);
    res.json(output);
  });

    
 

  /*for(var i = 0; i < weatherData.data.length; i++){
        output.push(new Weather(weatherData.data[i]));
    }*/
  // console.log(output, "Hello!");
  //res.send(output);

}



function Parks(JsonData){
 // console.log(JsonData);
 console.log(JsonData.fullName, "FULLNAME");
 console.log(JsonData.addresses, "ADDRESS");
console.log(JsonData.entranceFees.fee, "FEE");
 //console.log(sonData.fullName);
  this.name = JsonData.fullName;
  this.address = JsonData.addresses;
  this.fee = JsonData.entranceFees[0].fee;
  this.description = JsonData.description;
  this.url = JsonData.url;
}
  function Location(jsonData, cityName){
    this.search_query = cityName;
    this.formatted_query = jsonData[0].display_name;
    this.latitude = jsonData[0].lat;
    this.longitude = jsonData[0].lon;
  }

  function Weather(jsonData){
   // console.log(jsonData.valid_date);
   // console.log(jsonData.weather.description);
    this.time = jsonData.valid_date;
    this.forecast = jsonData.weather.description;
  }

  function makeForecasts(value, index, array){
   // console.log(array[index].valid_date);
    return new Weather(array[index]);
  }

  function getParks(value,index,array){
    console.log(array[index], "MORE1");
    return new Parks(array[index]);
  }

  app.listen(PORT, () => console.log(`app is up on port http://localhost:${PORT}`)); 
  