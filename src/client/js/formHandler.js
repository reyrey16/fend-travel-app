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
    const location = document.getElementById('location').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // validate that the input isn't blank
    if (location == "") {
        document.getElementById('entryHolder').innerHTML = "Please enter a location"
        return false
    }
  
    //FIRST: Get coordinates
    document.getElementById('entryHolder').innerText = "Searching for exact location"
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
      document.getElementById('entryHolder').innerHTML = JSON.stringify(results)
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