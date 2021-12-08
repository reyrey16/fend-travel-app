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
      projectData.lat = data.geonames[0].lat,
      projectData.country = data.geonames[0].countryName,

      document.getElementById('locationHolder').innerHTML = JSON.stringify(projectData)
      console.log("ProjectData processCoordinates:", projectData)
      return true
     } else {
      document.getElementById('locationHolder').innerHTML = "Sorry, I couldn't find that location. It must be so exclusive that I haven't heard about it. Please try another location"
      projectData = {}
      console.log("ProjectData processCoordinates:", projectData)
      return false
    }
 }

function processCurrentWeather(data) {
    // If API call is successfull
    console.log("WEATHERBIT DATA:",data)
    if (data.count > 0) {
      projectData.temp = data.data[0].temp
      projectData.weatherDesc = data.data[0].weather.description
      projectData.weatherIcon = "/images/" + data.data[0].weather.icon + ".png"

      document.getElementById('weatherHolder').innerHTML = JSON.stringify(projectData)
      document.getElementById('currentWeatherIcon').src = projectData.weatherIcon
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
    console.log("WEATHERBIT DATA:",data)

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

      projectData.temp = data.data[0].temp
      projectData.avg_max_temp = avgMaxTemp
      projectData.avg_min_temp = avgMinTemp
      
      document.getElementById('weatherHolder').innerHTML = JSON.stringify(projectData)
      return true
    }  else {
      document.getElementById('weatherHolder').innerHTML = "Sorry, I couldn't find the weather for that location"
      return false
    }
}

function getPicture(location) {
  document.getElementById('pictureHolder').alt = "Searching for a picture of the location"
  console.log("LOCATION WITHIN GET PICTURE FUNCTION:", location)
  postToServer('/get-picture', {location : location })

  // SECOND: Process results
  .then((data) => {
    console.log(data)
    let results = {}
    // If API call is successfull
    console.log("PIXABAY DATA:",data)
    if (data.total > 0) {
      results = {
          webformatURL : data.hits[0].webformatURL
      }
      projectData.push(results)
      document.getElementById('pictureHolder').src = results.webformatURL
    } else {
      document.getElementById('pictureHolder').src = ""
      //document.getElementById('pictureHolder').alt = "Sorry, I couldn't find a picture of that location"
      return false // Couldn't find a location specific or country picture
      
    }
    console.log("PIXABAY RESULTS:", results)
  })
  
  // IF IT ERRORS OUT: Catch the error here
  .catch((e) => {
    if (e.message.includes("NetworkError")) {
      document.getElementById('entryHolder').innerHTML = "It seems you are not connected to the internet. Please check your internet connection and try again"
    } else {
      document.getElementById('entryHolder').innerHTML = e.message
    }
  })

  return true
}

/* Function called by event listener */
function processForm(e) {
    projectData = {}
    document.getElementById('currentWeatherIcon').src = ""
    let location = document.getElementById('location').value
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
      counterHolder.innerHTML = parseInt(daysCounter) + " day left. "
    } else {
      counterHolder.innerHTML = parseInt(daysCounter) + " days left. "
    }

    let tripCounter = (Date.parse(endDateWithTime) - Date.parse(startDateWithTime)) / 86400000 // amount of milliseconds in a day
    if (parseInt(tripCounter) == 1) {
      document.getElementById('tripCounterHolder').innerHTML = "day trip"
    } else {
      document.getElementById('tripCounterHolder').innerHTML = parseInt(tripCounter) + " total days"
    }
    console.log("DAYS COUNTER:",daysCounter)
    console.log("START DATE:", startDate)
    console.log("START DATE WITH TIME:",startDateWithTime)

    projectData.start_date = startDate
    projectData.end_date = endDate
    projectData.daysCounter = daysCounter
  
        // MAIN LOGIC OF THE APP
        // 1. Get coordinates from GeoNames
        document.getElementById('locationHolder').innerHTML = "Searching for exact location"
        postToServer('/post-location', {location:location})
        // Process GeoNames API response        
        .then((data) => {
          if(!processCoordinates(data)) {
            throw new Error("Couldn't find location")
          }
        })

        // 2. Check date to determine correct weather API
        .then(() => {
          // If start date is within a week, call the Current Weather API 
          if (projectData.daysCounter < 7) {
            document.getElementById('weatherHolder').innerHTML = "Searching for the current weather"
            postToServer('/get-current-weather', {
              lat : projectData.lat,
              lon : projectData.lon
            })
            // Process current weather API response        
            .then((data) => {
              console.log("PROCESS CURRENT WEATHER API:",data)
              processCurrentWeather(data)
            })
          } else {
            // If start date is after a week, call the historical Weather API
            document.getElementById('weatherHolder').innerHTML = "Searching for the historical weather"
            // Generate new dates since the API relies on previous dates 
            let newDates = goBackAYear(projectData.start_date, projectData.end_date)
            console.log("New Dates:", newDates)
            postToServer('/get-historical-weather', {
              lat : projectData.lat,
              lon : projectData.lon,
              start_date : newDates.start_date,
              end_date : newDates.end_date
            })
            // Process historical weather API response        
            .then((data) => {
              console.log("PROCESS HISTORICAL WEATHER API:",data)
              processHistoricalWeather(data)
            })
          }  
        })


        
        // Catch any errors in the chain
        .catch((e) => {
          console.log("ERROR:", e)
        })





        // // Get picture from Pixabay
        // console.log(projectData)
        // console.log("RESULTS FOR PIXABAY:",results)
        // // If it's false, I will try to get picture of the country
        // if (!getPicture(results.destination)) {
        //   getPicture(results.country)
        // }


}

// Event listener to add function to existing HTML DOM element
document.getElementById('generate').addEventListener('click', processForm)

// Create a new date instance dynamically with JS
let d = new Date();
let newDate = d.getMonth()+'.'+ d.getDate()+'.'+ d.getFullYear();

// EXPORTS
export { processForm }