// Setup empty JS object to act as endpoint for all routes
let projectData = {};

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
const port = 3001;
const server = app.listen(port, () => {
  console.log("Server is alive!! Port " + port);
});

//
app.post('/post-location', function (req, res) {
  // Preparing the URL for GeoNames API
  const baseURL = "http://api.geonames.org/searchJSON?"
  let location = "name=" + encodeURIComponent(req.body.location) // essential to ensure proper rendering
  let rows = "&maxRows=1"
  let username = "&username=" + process.env.GEO_NAMES_API_KEY
  let URL = baseURL + location + rows + username

  console.log("URL = ", URL)

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
    console.log("===geoNames API call was successful===")
    const data = await response.json()
    return data
  } catch (error) {
    console.log("GeoNames API Error:", error)
  }
}

















// // Initialize all route with a callback function
// app.get('/all', (request, response) => {
//   response.send(projectData);
//   console.log("GET request completed");
// });

// app.post('/', postEntry);

// function postEntry (request, response) {
//   newData = request.body;
//   projectData = {
//     temp : newData.temp,
//     date : newData.date,
//     feelings : newData.feelings
//   }
//   console.log("POST request completed");
// }
