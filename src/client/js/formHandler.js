let projectData = []

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

function getCurrentWeather(location) {
  document.getElementById('weatherHolder').innerHTML = "Searching for the current weather"
  postToServer('/get-current-weather', {
      lat : location.lat,
      lon : location.lon
  })

  // SECOND: Process results
  .then((data) => {
    console.log(data)
    let results = {}
    // If API call is successfull
    console.log("WEATHERBIT DATA:",data)
    if (data.count > 0) {
      results = {
          temp : data.data[0].temp,
          weatherDesc : data.data[0].weather.description,
          weatherIcon : data.data[0].weather.icon
      }
      projectData.push(results)
    }
    else {
      results = "Sorry, I couldn't find the weather for that location"
    }
    document.getElementById('weatherHolder').innerHTML = JSON.stringify(results)
    console.log("WEATHERBIT RESULTS:", results)
  })
  
  // IF IT ERRORS OUT: Catch the error here
  .catch((e) => {
    if (e.message.includes("NetworkError")) {
      document.getElementById('entryHolder').innerHTML = "It seems you are not connected to the internet. Please check your internet connection and try again"
    } else {
      document.getElementById('entryHolder').innerHTML = e.message
    }
  })
}

function getHistoricalWeather(location) {
  document.getElementById('weatherHolder').innerHTML = "Searching for the historical weather"

    // Manipulating the dates to go back a year
    let start_date = new Date(location.start_date)
    let newStartDate = start_date.setDate(start_date.getDate() - 365)
    newStartDate = new Date(newStartDate).toISOString() // Convert to ISOString
    newStartDate = newStartDate.split("T", 1)[0] // Grab the date only
    let end_date = new Date(location.end_date)
    let newEndDate =end_date.setDate(end_date.getDate() - 365)
    newEndDate = new Date(newEndDate).toISOString() // Convert to ISOString
    newEndDate = newEndDate.split("T", 1)[0] // Grab the date only

  postToServer('/get-historical-weather', {
      lat : location.lat,
      lon : location.lon,
      start_date : newStartDate,
      end_date : newEndDate
  })

  // SECOND: Process results
  .then((data) => {
    console.log(data)
    let results = {}
    // If API call is successfull
    console.log("WEATHERBIT DATA:",data)
    //TO DO Calculate average temps by looping through array
    console.log("Date array length:", data.data.length)
    // If data.data exists, proper response is received from API
    if (data.data) {
      // Calculating average temps
      let maxTemp = 0
      let minTemp = 0
      data.data.forEach((day, index, array) => {
        console.log(day.max_temp,day.min_temp)
        maxTemp += day.max_temp
        minTemp += day.min_temp
      })
      let avgMaxTemp = maxTemp / data.data.length
      let avgMinTemp = minTemp / data.data.length
      results = {
          temp : data.data[0].temp,
          avg_max_temp : avgMaxTemp,
          avg_min_temp : avgMinTemp
      }
      projectData.push(results)
    }
    else {
      results = "Sorry, I couldn't find the weather for that location"
    }
    document.getElementById('weatherHolder').innerHTML = JSON.stringify(results)
    console.log("WEATHERBIT RESULTS:", results)
  })
  
  // IF IT ERRORS OUT: Catch the error here
  .catch((e) => {
    if (e.message.includes("NetworkError")) {
      document.getElementById('entryHolder').innerHTML = "It seems you are not connected to the internet. Please check your internet connection and try again"
    } else {
      document.getElementById('entryHolder').innerHTML = e.message
    }
  })
}

/* Function called by event listener */
function processForm(e) {
    const location = document.getElementById('location').value
    let startDate = document.getElementById('startDate').value
    let startDateWithTime = new Date(startDate+"T00:00:00") // To ensure start date is at midnight
    let endDate = document.getElementById('endDate').value
    let endDateWithTime = new Date(endDate+"T00:00:00") // To ensure start date is at midnight
    let today = new Date()
    let counterHolder = document.getElementById('counterHolder')

    // validate that the inputs != blank
    if (location == "") {
      counterHolder.innerHTML = "Please enter a location"
        return false
    } else if (startDate == "") {
      counterHolder.innerHTML = "Please enter a start date"
      return false     
    } else if (endDate == "") {
      counterHolder.innerHTML = "Please enter an end date, sorry we can't vacation forever :)"
      return false     
    }

    // validate the start date is >= to today
    if (Date.parse(startDateWithTime) < today) {
      counterHolder.innerHTML = "Your start date has to be after today, please choose another start date"
      console.log("DATE DIFF:", (Date.parse(startDateWithTime) - today) / 86400000)
      return false
    } else if (Date.parse(endDateWithTime) < Date.parse(startDateWithTime)) {
      counterHolder.innerHTML = "Your end date can't be before your start date. I haven't figured out how to time travel"
      return false
    }

    // date is good, continue processing form
    let daysCounter = (Date.parse(startDateWithTime) - today) / 86400000 // amount of milliseconds in a day 
    if (daysCounter < 1) {
      counterHolder.innerHTML = parseInt(daysCounter / 3600000) + " hours left"  // amount of milliseconds in an hour
    } else if (parseInt(daysCounter) == 1) {
      counterHolder.innerHTML = parseInt(daysCounter) + " day left"
    } else {
      counterHolder.innerHTML = parseInt(daysCounter) + " days left"
    }
    console.log("DAYS COUNTER:",daysCounter)
    console.log("START DATE:", startDate)
    console.log("START DATE WITH TIME:",startDateWithTime)
  
    //FIRST: Get coordinates
    document.getElementById('locationHolder').innerHTML = "Searching for exact location"
    postToServer('/post-location', {location:location})

    // SECOND: Process results
    .then((data) => {
      console.log(data)
      let results = {}
      // If API call is successfull
      if (data.totalResultsCount > 0) {
        results = {
            destination : data.geonames[0].name,
            lon : data.geonames[0].lng,
            lat : data.geonames[0].lat,
            country : data.geonames[0].countryName,
            start_date : startDate,
            end_date : endDate
        }
        projectData.push({results})
        console.log("ProjectData:", projectData)
        // Call to GeoNames was successfull, now let's get the weather
        //FIRST: Check date
        // If start date is within a week, call the Current Weather API 
        if (daysCounter < 7) {
          console.log("WITHIN A WEEK")
          getCurrentWeather(results)
        } else {
          // If start date is after a week, call the historical Weather API
          console.log("AFTER A WEEK")
          getHistoricalWeather(results)
        }
        

      }
      else {
        results = "Sorry, I couldn't find that location. It must be so exclusive that I haven't heard about it. Please try another location"
      }
      document.getElementById('locationHolder').innerHTML = JSON.stringify(results)
      console.log("GEONAMES RESULTS:", results)
    })
    
    // IF IT ERRORS OUT: Catch the error here
    .catch((e) => {
      if (e.message.includes("NetworkError")) {
        document.getElementById('entryHolder').innerHTML = "It seems you are not connected to the internet. Please check your internet connection and try again"
      } else {
        document.getElementById('entryHolder').innerHTML = e.message
      }
    })
}

// Event listener to add function to existing HTML DOM element
document.getElementById('generate').addEventListener('click', processForm)

// Create a new date instance dynamically with JS
let d = new Date();
let newDate = d.getMonth()+'.'+ d.getDate()+'.'+ d.getFullYear();

// EXPORTS
export { processForm }