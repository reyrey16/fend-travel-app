// This file contains all the functions that process the API responses

/**
* @description Validates the data returned from the GeoNames
* @param {object} data, returned from the API
* @returns {boolean} false if API call was successful, otherwise false
*/
export function processCoordinates(data) {
  // If API call is successfull
  if (data.totalResultsCount > 0) {
    // Assigning values into the global Client.projectData object
    Client.projectData.destination = data.geonames[0].name
    Client.projectData.lon = data.geonames[0].lng
    Client.projectData.lat = data.geonames[0].lat
    Client.projectData.country = data.geonames[0].countryName
    document.getElementById('locationHolder').innerHTML = Client.projectData.destination
    return true
   } else {
    document.getElementById('locationHolder').innerHTML = "Sorry, I couldn't find that location. It must be so exclusive that I haven't heard about it. Please try another location"
    return false
  }
}

/**
* @description Validates the data returned from the WeatherBit API
* @param {object} data, returned from the API
* @returns {boolean} false if API call was successful, otherwise false
*/
export function processCurrentWeather(data) {
  // If API call is successful
  if (data.count > 0) {
    console.log("process current weather:", data)
    Client.projectData.temp = data.data[0].temp
    Client.projectData.weatherDesc = data.data[0].weather.description
    Client.projectData.weatherIcon = "/images/" + data.data[0].weather.icon + ".png"
    Client.projectData.weatherType = "current" 
    return true
  }
  else {
    document.getElementById('weatherHolder').innerHTML = "Sorry, I couldn't find the weather for that location"
    return false
  }
}

/**
* @description Validates the data returned from the WeatherBit API
* @param {object} data, returned from the API
* @returns {boolean} false if API call was successful, otherwise false
*/
export function processHistoricalWeather(data) {
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

    Client.projectData.temp = data.data[0].temp
    Client.projectData.avgMaxTemp = avgMaxTemp
    Client.projectData.avgMinTemp = avgMinTemp
    Client.projectData.weatherType = "historical"
    return true
  }  else {
    document.getElementById('weatherHolder').innerHTML = "Sorry, I couldn't find the weather for that location"
    return false
  }
}

/**
* @description Validates the data returned from the PixaBay API
* @param {object} data, returned from the API
* @returns {boolean} false if API call was successful, otherwise false
*/
export function processPicture(data) {
  // If API call is successful
  if (data.total > 0) {
    Client.projectData.picture = data.hits[0].webformatURL
    return true
  } else {
    document.getElementById('pictureHolder').src = ""
    document.getElementById('pictureHolder').alt = "Sorry, I couldn't find a picture of the destination"
    return false // Couldn't find a location specific or country picture
  }
}

/**
* @description Returns the dates entered rolled back 365 days
* @param {date} StartDate
* @param {date} endDate
* @returns {object} returns the newStartDate and newEndDate
*/
export function goBackAYear(start_date, end_date) {
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