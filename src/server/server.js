// Require Express to run server and routes
const express = require('express');

// Adding other required packages
var path = require('path')
const dotenv = require('dotenv').config()
const fetch = require('node-fetch')

// Start up an instance of app
const app = express();

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
const cors = require('cors');
app.use(cors());

// Initialize the main project folder
app.use(express.static('dist'));

// Setup Server
const port = 3005;
const server = app.listen(port, () => {
  console.log("Server is alive!! Port " + port);
});

// Route for searching the location in Geonames
app.post('/post-location', function (req, res) {
  // Preparing the URL for GeoNames API
  const baseURL = "http://api.geonames.org/searchJSON?"
  let location = "name=" + encodeURIComponent(req.body.location) // essential to ensure proper rendering
  let rows = "&maxRows=1"
  let username = "&username=" + process.env.GEO_NAMES_API_KEY
  let URL = baseURL + location + rows + username

  // Call the GeoNames API
  getCoordinates(URL)
  .then((data) => {
      res.send(data)
  })
})

// GeoNames API function call
const getCoordinates = async (URL) => {
  const response = await fetch(URL)
  try {
    console.log("=== geoNames API call was successful ===")
    const data = await response.json()
    return data
  } catch (error) {
    console.log("GeoNames API Error:", error)
  }
}

// Route for searching the current weather in WeatherBit
app.post('/get-current-weather', function (req, res) {
  // Preparing the URL for WeatherBit API
  const baseURL = "https://api.weatherbit.io/v2.0/current?"
  let lat = "lat=" + req.body.lat
  let lon = "&lon=" + req.body.lon
  let units = "&units=I"
  let key = "&key=" + process.env.WEATHERBIT_API_KEY
  let URL = baseURL + lat + lon + units + key

  // Call the WeatherBit Current API
  getWeather(URL)
  .then((data) => {
      res.send(data)
  })
})

// Route for searching the historical weather in WeatherBit
app.post('/get-historical-weather', function (req, res) {
  // I am using the history instead of the forecast because I couldn't
  // figure out with the API docs how to specify a specific date in the 
  // future. I feel this way is more accurate.

  // Preparing the URL for WeatherBit API
  const baseURL = "https://api.weatherbit.io/v2.0/history/daily?"
  let lat = "lat=" + req.body.lat
  let lon = "&lon=" + req.body.lon
  let units = "&units=I"
  let start_date = "&start_date=" + req.body.start_date
  let end_date = "&end_date=" + req.body.end_date
  let key = "&key=" + process.env.WEATHERBIT_API_KEY
  let URL = baseURL + lat + lon + units + start_date + end_date + key
  
  // Call the WeatherBit Current API
  getWeather(URL)
  .then((data) => {
      res.send(data)
  })
})

// WeatherBit Current API function call
const getWeather = async (URL) => {
  const response = await fetch(URL)
  try {
    console.log("=== WeatherBit API call was successful ===")
    const data = await response.json()
    return data
  } catch (error) {
    console.log("WeatherBit API Error:", error)
  }
}

// Route for searching a picture in Pixabay
app.post('/get-picture', function (req, res) {
  // Preparing the URL for Pixabay API
  const baseURL = "https://pixabay.com/api/?"
  let key = "key=" + process.env.PIXABAY_API_KEY
  let safeSearch = "&safesearch=true"
  let q = "&q=" + encodeURIComponent(req.body.location) // essential to ensure proper rendering
  
  let URL = baseURL + key + safeSearch + q

  // Leaving this here to make it easier to validate the country 
  // logic works
  console.log("PIXABAY URL:", URL)

  // Call the Pixabay API
  getPicture(URL)
  .then((data) => {
      res.send(data)
  })
})

// Pixabay API function call
const getPicture = async (URL) => {
  const response = await fetch(URL)
  try {
    console.log("=== Pixabay API call was successful ===")
    const data = await response.json()
    return data
  } catch (error) {
    console.log("Pixabay API Error:", error)
  }
}

module.exports = app