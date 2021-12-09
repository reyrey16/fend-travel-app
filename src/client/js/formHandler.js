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
      console.log("POST ERROR:", error);
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
  if (parseInt(tripCounter) == 0) {
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
    Client.projectData.daysCounter = createDaysCounter(startDate)
    Client.projectData.tripCounter = createTripCounter(startDate, endDate)
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
      console.log("CURRENT Client.projectData:", Client.projectData)
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
        let newDates = goBackAYear(Client.projectData.start_date, Client.projectData.end_date)
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
