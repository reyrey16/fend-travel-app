let projectData = {}

/* POST data to the server side */
const postToServer = async (url = '', data = {}) => {
    //Sending the data to the server side
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    try {
      const newData = await response.json();
      return newData;
    } catch (error) {
      console.log("POST ERROR:", error);
    }
}

function processCoordinates(data) {
    // If API call is successfull
    if (data.totalResultsCount > 0) {
      // Assigning values into the global projectData object
      projectData.destination = data.geonames[0].name
      projectData.lon = data.geonames[0].lng
      projectData.lat = data.geonames[0].lat
      projectData.country = data.geonames[0].countryName
      document.getElementById('locationHolder').innerHTML = projectData.destination
      return true
     } else {
      document.getElementById('locationHolder').innerHTML = "Sorry, I couldn't find that location. It must be so exclusive that I haven't heard about it. Please try another location"
      return false
    }
 }

 function listAllProperties(o) {
  let objectToInspect = o;
  let result = [];

  while(objectToInspect !== null) {
    result = result.concat(Object.getOwnPropertyNames(objectToInspect));
    objectToInspect = Object.getPrototypeOf(objectToInspect)
  }

  return result;
}

function processCurrentWeather(data) {
    // If API call is successful
    if (data.count > 0) {
      projectData.temp = data.data[0].temp
      projectData.weatherDesc = data.data[0].weather.description
      projectData.weatherIcon = "/images/" + data.data[0].weather.icon + ".png"
      document.getElementById('currentWeatherIcon').src = projectData.weatherIcon
      document.getElementById('weatherHolder').innerHTML = `Current weather: ${projectData.temp}&deg; F <br> ${projectData.weatherDesc}` 
      return true
    }
    else {
      document.getElementById('weatherHolder').innerHTML = "Sorry, I couldn't find the weather for that location"
      return false
    }
}

function goBackAYear(start_date, end_date) {
    // Manipulating the dates to go back a year
    let startDate    = new Date(start_date)
    let newStartDate = startDate.setDate(startDate.getDate() - 365)
    newStartDate     = new Date(newStartDate).toISOString() // Convert to ISOString
    newStartDate     = newStartDate.split("T", 1)[0] // Grab the date only

    let endDate    = new Date(end_date)
    let newEndDate = endDate.setDate(endDate.getDate() - 365)
    newEndDate     = new Date(newEndDate).toISOString() // Convert to ISOString
    newEndDate     = newEndDate.split("T", 1)[0] // Grab the date only

    return {start_date: newStartDate, end_date: newEndDate}
}

function processHistoricalWeather(data) {
    // If API call is successfull
    // If data.data exists, proper response is received from API
    if (data.data) {
      // Calculating average temps
      let maxTemp = 0
      let minTemp = 0
      data.data.forEach((day, index, array) => {
        maxTemp += day.max_temp
        minTemp += day.min_temp
      })
      let avgMaxTemp = maxTemp / data.data.length
      let avgMinTemp = minTemp / data.data.length

      projectData.temp = data.data[0].temp
      projectData.avgMaxTemp = avgMaxTemp
      projectData.avgMinTemp = avgMinTemp
      projectData.weatherAPI = "historical"
      
      document.getElementById('weatherHolder').innerHTML = `Typical weather for then is:<br> ${parseInt(projectData.avgMaxTemp)}&deg; F, ${parseInt(projectData.avgMinTemp)}&deg; F`
      return true
    }  else {
      document.getElementById('weatherHolder').innerHTML = "Sorry, I couldn't find the weather for that location"
      return false
    }
}

function processPicture(data) {
    // If API call is successful
    if (data.total > 0) {
      projectData.picture = data.hits[0].webformatURL
      document.getElementById('pictureHolder').src = projectData.picture
      return true
    } else {
      document.getElementById('pictureHolder').src = ""
      //document.getElementById('pictureHolder').alt = "Sorry, I couldn't find a picture of the destination"
      return false // Couldn't find a location specific or country picture
    }
}

function displayResults(data) {

  displayDaysCounter(data.daysCounter)
  displayTripCounter(data.tripCounter)

}

function displayDaysCounter(daysCounter) {
  let counterHolder = document.getElementById('counterHolder')

  if (daysCounter < 1) {
    counterHolder.innerHTML = parseInt(daysCounter / 3600000) + " hours left"  // amount of milliseconds in an hour
  } else if (parseInt(daysCounter) == 1) {
    counterHolder.innerHTML = parseInt(daysCounter) + " day left"
  } else {
    counterHolder.innerHTML = parseInt(daysCounter) + " days left"
  }
}

function displayTripCounter(tripCounter) {
  if (parseInt(tripCounter) == 1) {
    document.getElementById('tripCounterHolder').innerHTML = "day trip"
  } else {
    document.getElementById('tripCounterHolder').innerHTML = parseInt(tripCounter) + " day trip"
  }
}

function createDaysCounter(startDate) {
  let startDateWithTime = new Date(startDate+"T00:00:00") // To ensure start date is at midnight
  let today = new Date()
  let daysCounter = (Date.parse(startDateWithTime) - today) / 86400000 // amount of milliseconds in a day
  
  return daysCounter
}

function createTripCounter(startDate, endDate) {
  let startDateWithTime = new Date(startDate+"T00:00:00") // To ensure start date is at midnight
  let endDateWithTime = new Date(endDate+"T00:00:00") // To ensure start date is at midnight
  let tripCounter = (Date.parse(endDateWithTime) - Date.parse(startDateWithTime)) / 86400000 // amount of milliseconds in a day

  return tripCounter
}

function validateDates(startDate, endDate) {
  let startDateWithTime = new Date(startDate+"T00:00:00") // To ensure start date is at midnight
  let endDateWithTime = new Date(endDate+"T00:00:00") // To ensure start date is at midnight
  let today = new Date()
  let counterHolder = document.getElementById('counterHolder')

  // validate the start date is >= to today
  if (Date.parse(startDateWithTime) < today) {
    counterHolder.innerHTML = "Your start date has to be after today, please choose another start date"
    return false
  } else if (Date.parse(endDateWithTime) < Date.parse(startDateWithTime)) {
    counterHolder.innerHTML = "Your end date can't be before your start date. I haven't figured out how to time travel"
    return false
  }
  // Dates are good
  return true
}

function validateInput() {
  // Validate that none of the 3 inputs are blank
  let location = document.getElementById('location').value
  let startDate = document.getElementById('startDate').value
  let endDate = document.getElementById('endDate').value
  let locationHolder = document.getElementById('locationHolder')

  // validate that the inputs != blank
  if (location == "") {
    locationHolder.innerHTML = "Please enter a location"
      return false
  } else if (startDate == "") {
    locationHolder.innerHTML = "Please enter a start date"
    return false     
  } else if (endDate == "") {
    locationHolder.innerHTML = "Please enter an end date, sorry we can't vacation forever :)"
    return false     
  }
  // If they all have something in them
  return true 
}

function cleanAllFields() {
  //Clean all inputs every time it runs, I am not designing it for multiple trips
  projectData = {}
  document.getElementById("pictureHolder").src = ""
  document.getElementById("pictureHolder").alt = ""
  document.getElementById("locationHolder").innerHTML = ""
  document.getElementById("counterHolder").innerHTML = ""
  document.getElementById("tripCounterHolder").innerHTML = ""
  document.getElementById("weatherHolder").innerHTML = ""
  document.getElementById("currentWeatherIcon").src = ""
  document.getElementById('currentWeatherIcon').alt = ""
}

/* Function called by event listener */
function processForm(e) {
  // Start with a clean slate, in case people try multiple locations
  cleanAllFields()

  // Grab the values of the 3 inputs
  let location = document.getElementById('location').value
  let startDate = document.getElementById('startDate').value
  let endDate = document.getElementById('endDate').value

  // validate that the inputs != blank
  if (!validateInput()) { return false }

  // validate that the dates are good
  if (validateDates(startDate, endDate)) {
    // TO DO : probably will go at the end with buildUI
    projectData.start_date = startDate
    projectData.end_date = endDate
    projectData.daysCounter = createDaysCounter(startDate)
    projectData.tripCounter = createTripCounter(startDate, endDate)
  } else {
    return false
  }

  // MAIN LOGIC OF THE APP (API CALLS)
  // 1. Get coordinates from GeoNames
  document.getElementById('locationHolder').innerHTML = "Searching for exact location"
  postToServer('/post-location', {location:location})
  // Process GeoNames API response        
  .then((data) => {
    if(!processCoordinates(data)) {
      throw new Error("Couldn't find location")
    }
    return true
  })

  // 2. Check date to determine correct weather API
  .then((data) => {
    return new Promise((resolve, reject) => {
      // If start date is within a week, call the Current Weather API 
      if (projectData.daysCounter < 7) {
        document.getElementById('weatherHolder').innerHTML = "Searching for the current weather"
        postToServer('/get-current-weather', {
          lat : projectData.lat,
          lon : projectData.lon
        })
        // Process current weather API response        
        .then((data) => {
          if (processCurrentWeather(data)) {
            resolve("SUCCESS")
          } else {
            reject("Couldn't process current weather API data")
          }
        })

        .catch((e) => {
          console.log("ERROR:", e)
        })

      } else {
        // If start date is after a week, call the historical Weather API
        document.getElementById('weatherHolder').innerHTML = "Searching for the historical weather"
        // Generate new dates since the API relies on previous dates 
        let newDates = goBackAYear(projectData.start_date, projectData.end_date)
        postToServer('/get-historical-weather', {
          lat : projectData.lat,
          lon : projectData.lon,
          start_date : newDates.start_date,
          end_date : newDates.end_date
        })
        // Process historical weather API response        
        .then((data) => {
          if (processHistoricalWeather(data)) {
            resolve("SUCCESS")
          } else {
            reject("Couldn't process historical weather API data")
          }
        })

        .catch((e) => {
          console.log("ERROR:", e)
        })
      }  
    })
  })

  // 3. Get picture via Pixabay API
  .then(() => {
    return new Promise((resolve, reject) => {
      document.getElementById('pictureHolder').alt = "Searching for a picture of the location"
      postToServer('/get-picture', {location : projectData.destination})

      // Process Pixabay API response        
      .then((data) => {
        // If false, try country search
        if (!processPicture(data)) {
          postToServer('/get-picture', {location : projectData.country})
          // Results of country picture search
          .then((data) => {
            if (processPicture(data)) {
              resolve("SUCCESS")
            } else {
              reject("Couldn't process historical weather API data")
            }
          })
          .catch((e) => {
            console.log("ERROR:", e)
          })
        } else {
          // Picture was found for the destination
          resolve("SUCCESS")
        }
      })
    })
  })

  // If I got here, all the APIs are done and successfull, time to build the UI
  .then(() => {
    displayResults(projectData)
  })

  // Catch any errors in the chain
  .catch((e) => {
    console.log("ERROR:", e)
  })
}

// Event listener to add function to existing HTML DOM element
document.getElementById('generate').addEventListener('click', processForm)

// EXPORTS
export { processForm }