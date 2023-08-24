const cityCoordinates = {};

// Constants
const API_BASE_URL = 'http://www.7timer.info/bin/api.pl';
const IMAGE_BASE_PATH = '/images/';

// DOM Elements
const fetchWeatherButton = document.getElementById('fetchWeather');
const citySelector = document.getElementById('citySelector');
const weatherDisplay = document.getElementById('weatherDisplay');

// Functions
function fetchCSVData() {
    return fetch('city_coordinates.csv')
        .then(response => response.text());
}

function parseCSVData(data) {
    const rows = data.split('\n');
    rows.slice(1).forEach(row => {
        const [latitude, longitude, city, country] = row.split(',');
        const cityName = city.toLowerCase().trim();
        cityCoordinates[cityName] = { lat: parseFloat(latitude), lon: parseFloat(longitude) };

        const option = document.createElement('option');
        option.value = cityName;
        option.textContent = `${city}, ${country}`;
        citySelector.appendChild(option);
    });
}

function fetchWeatherData(coordinates) {
    const apiUrl = `${API_BASE_URL}?lon=${coordinates.lon}&lat=${coordinates.lat}&product=civil&output=json`;

    return fetch(apiUrl)
        .then(response => response.json());
}

function displayWeatherData(data) {
    const currentDate = new Date();
    const forecastData = data.dataseries;

    let weatherHTML = `<h2>${citySelector.value.toUpperCase()} Weather Forecast</h2>`;
    weatherHTML += '<ul>';

    for (let index = 0; index < Math.min(7, forecastData.length); index++) {
        const forecastDate = new Date(currentDate);
        forecastDate.setDate(currentDate.getDate() + index);

        const dayData = forecastData[index];
        const formattedDate = forecastDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const weatherImage = getWeatherImage(dayData.weather);

        weatherHTML += `
            <li>
                <strong>${formattedDate}</strong><br>
                <img class="weather-icon" src="${weatherImage}" alt="${dayData.weather}">
                Temperature: ${dayData.temp2m}°C
            </li>`;
    }

    weatherHTML += '</ul>';
    weatherDisplay.innerHTML = weatherHTML;
}

function getWeatherImage(weather) {
    const weatherImages = {
        clearday: 'clear.png',
        clearnight: 'clear.png',
        clearday: 'clear.png',
        pcloudyday: 'pcloudy.png',
        mcloudyday: 'mcloudy.png',
        cloudyday: 'pcloudy.png',
        lightrainday: 'lightrain.png',
        rain: 'rain.png',
        lightsnow: 'lightsnow.png',
        snow: 'snow.png',
        oshowernight: 'ishower.png',
        lightrainnight:'lightrain.png',
        humidday:'humid.png',
        humidnight:'humid.png',
        ishowerday:'ishower.png'
    };

    const lowerCaseWeather = weather.toLowerCase();
    const imagePath = `${IMAGE_BASE_PATH}${weatherImages[lowerCaseWeather] || 'default.png'}`;
    console.log('Weather:', weather);
    console.log('Lowercase Weather:', lowerCaseWeather);
    console.log('Image Path:', imagePath);

    return imagePath;
}

// Event Listeners
citySelector.addEventListener('change', () => {
    const selectedCity = citySelector.value;
    const coordinates = cityCoordinates[selectedCity];
    console.log('Selected City:', selectedCity);
    console.log('Coordinates:', coordinates);

    if (!coordinates) {
        weatherDisplay.innerHTML = 'Coordinates not available.';
        return;
    }

    fetchWeatherData(coordinates)
        .then(data => {
            displayWeatherData(data); // Display weather forecast
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            weatherDisplay.innerHTML = 'An error occurred while fetching weather data.';
        });
});

// Load CSV data and initialize
fetchCSVData()
    .then(parseCSVData)
    .catch(error => {
        console.error('Error fetching CSV data:', error);
    });
