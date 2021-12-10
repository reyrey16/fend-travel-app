// Global variable where all the data is stored for the trip
export let projectData = {}

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
      document.getElementById('locationHolder').innerHTML = "Seems like you may not be connected to the internet, please check your internet connection and try again"
      console.log("POST ERROR:", error);
    }
}

// Helper functions to display the output
function displayDaysCounter(daysCounter) {
  if (daysCounter < 1) {
    return parseInt(daysCounter / 3600000) + " hours left"  // amount of milliseconds in an hour
  } else if (parseInt(daysCounter) == 1) {
    return parseInt(daysCounter) + " day left"
  } else {
    return parseInt(daysCounter) + " days left"
  }
}

function displayTripCounter(tripCounter) {
  if (parseInt(tripCounter) == 0) {
    return ",day trip"
  } else {
    return ", " + parseInt(tripCounter) + " day trip"
  }
}

function displayResults(data) {
  // Display the destination
  document.getElementById('locationHolder').innerHTML = `${data.destination}, ${data.country}`
  
  // Gather the counter data
  let counterHolder = displayDaysCounter(data.daysCounter)
  counterHolder += displayTripCounter(data.tripCounter)
  document.getElementById('counterHolder').innerHTML = counterHolder


  // Display the weather
  if (data.weatherType == "current") {
    document.getElementById('currentWeatherIcon').src = data.weatherIcon
    document.getElementById('weatherHolder').innerHTML = `Current weather: ${data.temp}&deg; F <br> ${data.weatherDesc}`
  } 

  else if (data.weatherType == "historical") {
    document.getElementById('weatherHolder').innerHTML = `Typical weather for then is:<br> ${parseInt(data.avgMaxTemp)}&deg; F, ${parseInt(data.avgMinTemp)}&deg; F`
  }

  // Display the picture
  if(data.picture) {
    document.getElementById('pictureHolder').src = data.picture
  }

  // Display the title
  document.getElementById('entry').style.display = "block"
}

/* Function called by event listener */
export function processForm(e) {
  // Start with a clean slate, in case people try multiple locations
  Client.cleanAllFields()

  // Grab the values of the 3 inputs
  let location = document.getElementById('location').value
  let startDate = document.getElementById('startDate').value
  let endDate = document.getElementById('endDate').value

  // validate that the inputs != blank
  if (!Client.validateInput()) { return false }

  // validate that the dates are good
  if (Client.validateDates(startDate, endDate)) {
    // TO DO : probably will go at the end with buildUI
    Client.projectData.start_date = startDate
    Client.projectData.end_date = endDate
    Client.projectData.daysCounter = Client.createDaysCounter(startDate)
    Client.projectData.tripCounter = Client.createTripCounter(startDate, endDate)
  } else {
    return false
  }

  // MAIN LOGIC OF THE APP (API CALLS)
  // 1. Get coordinates from GeoNames
  document.getElementById('locationHolder').innerHTML = "Searching for exact location"
  postToServer('/post-location', {location:location})
  // Process GeoNames API response        
  .then((data) => {
    if(!Client.processCoordinates(data)) {
      throw new Error("Couldn't find location")
    }
    return true
  })

  // 2. Check date to determine correct weather API
  .then((data) => {
    return new Promise((resolve, reject) => {
      // If start date is within a week, call the Current Weather API 
      if (Client.projectData.daysCounter < 7) {
        document.getElementById('weatherHolder').innerHTML = "Searching for the current weather"
        postToServer('/get-current-weather', {
          lat : Client.projectData.lat,
          lon : Client.projectData.lon
        })
        // Process current weather API response        
        .then((data) => {
          if (Client.processCurrentWeather(data)) {
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
        let newDates = Client.goBackAYear(Client.projectData.start_date, Client.projectData.end_date)
        postToServer('/get-historical-weather', {
          lat : Client.projectData.lat,
          lon : Client.projectData.lon,
          start_date : newDates.start_date,
          end_date : newDates.end_date
        })
        // Process historical weather API response        
        .then((data) => {
          if (Client.processHistoricalWeather(data)) {
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
      postToServer('/get-picture', {location : Client.projectData.destination})

      // Process Pixabay API response        
      .then((data) => {
        // If false, try country search
        if (!Client.processPicture(data)) {
          postToServer('/get-picture', {location : Client.projectData.country})
          // Results of country picture search
          .then((data) => {
            if (Client.processPicture(data)) {
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
    displayResults(Client.projectData)
  })

  // Catch any errors in the chain
  .catch((e) => {
    console.log("ERROR:", e)
  })
}

// Event listener to add function to existing HTML DOM element
document.getElementById('generate').addEventListener('click', processForm)
