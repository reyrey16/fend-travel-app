// Importing functions
import { processForm } from './js/formHandler'
import { cleanAllFields, validateInput, validateDates, createDaysCounter, createTripCounter } from './js/validators'
import { processCoordinates, processCurrentWeather, processHistoricalWeather, processPicture, goBackAYear } from './js/processAPI'

// Exporting so we can access via Client.NAME
export { processForm }
export { cleanAllFields, validateInput, validateDates, createDaysCounter, createTripCounter }
export { processCoordinates, processCurrentWeather, processHistoricalWeather, processPicture, goBackAYear }

// Importing styles
import './styles/base.scss'
import './styles/resets.scss'

// Importing the images
import './media/weather-icons/a01d.png'
import './media/weather-icons/a01n.png'
import './media/weather-icons/a02d.png'
import './media/weather-icons/a02n.png'
import './media/weather-icons/a03d.png'
import './media/weather-icons/a03n.png'
import './media/weather-icons/a04d.png'
import './media/weather-icons/a04n.png'
import './media/weather-icons/a05d.png'
import './media/weather-icons/a05n.png'
import './media/weather-icons/a06d.png'
import './media/weather-icons/a06n.png'
import './media/weather-icons/c01d.png'
import './media/weather-icons/c01n.png'
import './media/weather-icons/c02d.png'
import './media/weather-icons/c02n.png'
import './media/weather-icons/c03d.png'
import './media/weather-icons/c03n.png'
import './media/weather-icons/c04d.png'
import './media/weather-icons/c04n.png'
import './media/weather-icons/d01d.png'
import './media/weather-icons/d01n.png'
import './media/weather-icons/d02d.png'
import './media/weather-icons/d02n.png'
import './media/weather-icons/d03d.png'
import './media/weather-icons/d03n.png'
import './media/weather-icons/f01d.png'
import './media/weather-icons/f01n.png'
import './media/weather-icons/r01d.png'
import './media/weather-icons/r01n.png'
import './media/weather-icons/r02d.png'
import './media/weather-icons/r02n.png'
import './media/weather-icons/r03d.png'
import './media/weather-icons/r03n.png'
import './media/weather-icons/r04d.png'
import './media/weather-icons/r04n.png'
import './media/weather-icons/r05d.png'
import './media/weather-icons/r05n.png'
import './media/weather-icons/r06d.png'
import './media/weather-icons/r06n.png'
import './media/weather-icons/s01d.png'
import './media/weather-icons/s01n.png'
import './media/weather-icons/s02d.png'
import './media/weather-icons/s02n.png'
import './media/weather-icons/s03d.png'
import './media/weather-icons/s03n.png'
import './media/weather-icons/s04d.png'
import './media/weather-icons/s04n.png'
import './media/weather-icons/s05d.png'
import './media/weather-icons/s05n.png'
import './media/weather-icons/s06d.png'
import './media/weather-icons/s06n.png'
import './media/weather-icons/t01d.png'
import './media/weather-icons/t01n.png'
import './media/weather-icons/t02d.png'
import './media/weather-icons/t02n.png'
import './media/weather-icons/t03d.png'
import './media/weather-icons/t03n.png'
import './media/weather-icons/t04d.png'
import './media/weather-icons/t04n.png'
import './media/weather-icons/t05d.png'
import './media/weather-icons/t05n.png'
import './media/weather-icons/u00d.png'
import './media/weather-icons/u00n.png'


