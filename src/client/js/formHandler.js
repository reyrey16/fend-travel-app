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

/* Function called by event listener */
function processForm(e) {
    const location = document.getElementById('location').value
    let startDate = document.getElementById('startDate').value
    let endDate = document.getElementById('endDate').value
    let today = new Date()
    let counterHolder = document.getElementById('counterHolder')

    // validate that the inputs != blank
    if (location == "") {
      counterHolder.innerHTML = "Please enter a location"
        return false
    } else if (startDate == "") {
      counterHolder.innerHTML = "Please enter a start date"
      return false     
    }

    // validate the start date is >= to today
    if (Date.parse(startDate) < today) {
      counterHolder.innerHTML = "Your start date has to be after today, please choose another start date"
      return false
    }

    // date is good, continue processing form
    startDate = startDate + "T00:00:00" // To ensure start date is at midnight
    startDate = new Date(startDate)

    let daysCounter = (Date.parse(startDate) - today) / 86400000 // amount of milliseconds in a day 
    if (daysCounter < 1) {
      counterHolder.innerHTML = parseInt(daysCounter / 3600000) + " hours left"  // amount of milliseconds in an hour
    } else if (parseInt(daysCounter) == 1) {
      counterHolder.innerHTML = parseInt(daysCounter) + " day left"
    } else {
      counterHolder.innerHTML = parseInt(daysCounter) + " days left"
    }
    console.log(daysCounter)
    console.log(startDate)
  
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
            country : data.geonames[0].countryName
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