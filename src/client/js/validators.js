// This file contains all the validating and cleaning functions

/**
* @description Cleans all the elements in case user runs through the app multiple times
*/
export function cleanAllFields() {
  //Clean all inputs every time it runs, I am not designing it for multiple trips
  Client.projectData = {}
  document.getElementById("pictureHolder").src = ""
  document.getElementById("pictureHolder").alt = ""
  document.getElementById("locationHolder").innerHTML = ""
  document.getElementById("counterHolder").innerHTML = ""
  document.getElementById("weatherHolder").innerHTML = ""
  document.getElementById("currentWeatherIcon").src = ""
  document.getElementById('currentWeatherIcon').alt = ""
}

/**
* @description Validates the startDate and endDate provided by the user
* @param {date} StartDate
* @param {date} endDate
* @returns {boolean} false if dates entered aren't valid, otherwise true
*/
export function validateDates(startDate, endDate) {
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
 
/**
* @description Validates the 3 inputs users can enter data into
* @returns {boolean} false if any fields are empty, otherwise true
*/
export function validateInput() {
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

/**
* @description Creates the daysCounter
* @param {date} StartDate
* @returns {number} returns the amount of days before the trip starts
*/
export function createDaysCounter(startDate) {
  let startDateWithTime = new Date(startDate+"T00:00:00") // To ensure start date is at midnight
  let today = new Date()
  let daysCounter = (Date.parse(startDateWithTime) - today) / 86400000 // amount of milliseconds in a day
  
  return daysCounter
}

/**
* @description Creates the tripCounter
* @param {date} StartDate
* @param {date} endDate
* @returns {number} returns the total number of days the trip is
*/
export function createTripCounter(startDate, endDate) {
  let startDateWithTime = new Date(startDate+"T00:00:00") // To ensure start date is at midnight
  let endDateWithTime = new Date(endDate+"T00:00:00") // To ensure start date is at midnight
  let tripCounter = (Date.parse(endDateWithTime) - Date.parse(startDateWithTime)) / 86400000 // amount of milliseconds in a day

  return tripCounter
}