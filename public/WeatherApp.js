const weatherApiKey = 'YOUR_WeatherApiKey'; //INLOCUIESTE AICI CU API KEY-UL TAU PENTRU A FUNCITONA APLICATIA.

let hourlyData = [];
let startHourIndex = 0;
const HOURS_TO_DISPLAY = 4;

async function getWeather(lat, lon) {
    const weatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${lat},${lon}&days=1&aqi=no&alerts=no`;

    try {
        const response = await fetch(weatherUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error('Error fetching the weather data:', error);
        document.getElementById('left-section').innerHTML = `<p>${error.message}. Please try again.</p>`;
    }
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
                await getWeather(latitude, longitude);
            },
            (error) => {
                console.error('Error getting the current location:', error);
                const errorMessage = getGeolocationErrorMessage(error.code);
                document.getElementById('left-section').innerHTML = `
                    <p>${errorMessage} Please enable location services and try again. <a href="#" onclick="requestLocationPermission()">Click here to retry.</a></p>
                `;
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        document.getElementById('left-section').innerHTML = `<p>Geolocation is not supported by this browser.</p>`;
    }
}

function requestLocationPermission() {
    //Reincearca cererea
    getCurrentLocation();
}



function getGeolocationErrorMessage(errorCode) {
    switch (errorCode) {
        case error.PERMISSION_DENIED:
            return 'User denied the request for Geolocation.';
        case error.POSITION_UNAVAILABLE:
            return 'Location information is unavailable.';
        case error.TIMEOUT:
            return 'The request to get user location timed out.';
        case error.UNKNOWN_ERROR:
            return 'An unknown error occurred.';
        default:
            return 'An error occurred while retrieving the location.';
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' 
    });
}


async function getWeatherByCity() {
    const city = document.getElementById('city').value.trim();
    if (city) {
        try {
            const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${encodeURIComponent(city)}&days=1&aqi=no&alerts=no`);
            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error('CITY NOT FOUND. PLEASE CHECK THE CITY NAME, REFRESH THE PAGE AND TRY AGAIN.');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            const data = await response.json();
            displayWeather(data);
            scrollToTop();
        } catch (error) {
            console.error('Error fetching the weather data:', error);
            document.getElementById('left-section').innerHTML = `<p>${error.message}</p>`;
        }
    } else {
        document.getElementById('left-section').innerHTML = `<p>Please enter a city name.</p>`;
    }
}

function getConditionIcon(conditionText, precip_mm) {
    // Convert precip_mm intr-un numar, pentru a evita erori de comparatie
    const precipitation = parseFloat(precip_mm);
  
    if (precipitation > 40) {
      return '️🌧️'; 
    } else if (conditionText.toLowerCase() === 'rain') {
      return '️🌧️'; 
    } else if (conditionText.toLowerCase() === 'sunny') {
      return '☀️';
    } else if (conditionText.toLowerCase() === 'cloudy') {
      return '☁️';
    } else {
      return '🌙';
    }
  }
  


function displayWeather(data) {
    console.log(data); 

    if (data && data.location && data.current && data.forecast) {
        const { location, current, forecast } = data;
        const { name, country } = location;
        const { temp_c, condition, feelslike_c, precip_mm } = current;
        const { sunrise, sunset } = forecast.forecastday[0].astro;

        hourlyData = forecast.forecastday[0].hour;
        
        // Gaseste indexul orei curente
        const currentHour = new Date().getHours();
        startHourIndex = hourlyData.findIndex(hour => new Date(hour.time).getHours() === currentHour);

        updateLocation(name, country);
        updateTime();
        updateWeatherIcon(condition?.text, precip_mm, new Date(), new Date(`1970-01-01T${sunrise}`), new Date(`1970-01-01T${sunset}`));
        updateTemperature(temp_c, condition?.text);
        updateDetails(forecast, precip_mm, feelslike_c);
        updateSunInfo(sunrise, sunset);

        updateHourlyForecast();
    } else {
        document.getElementById('left-section').innerHTML = '<p>No weather data available.</p>';
    }
}

function updateLocation(name, country) {
    const locationElement = document.getElementById('location');
    if (locationElement) locationElement.textContent = `${name}, ${country}`;
}

function updateTime() {
    const timeElement = document.getElementById('time');
    if (timeElement) timeElement.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
}

function updateWeatherIcon(conditionText, precip_mm, currentTime, sunriseTime, sunsetTime) {
    const weatherIconElement = document.querySelector('.weather-icon');
    if (weatherIconElement) weatherIconElement.innerHTML = getConditionIcon(conditionText, precip_mm, currentTime, sunriseTime, sunsetTime);
}

function updateTemperature(temp_c, conditionText) {
    const tempCurrentElement = document.querySelector('.temp-current');
    const tempDescriptionElement = document.querySelector('.temp-description');
    if (tempCurrentElement) tempCurrentElement.textContent = `${temp_c}°C`;
    if (tempDescriptionElement) tempDescriptionElement.textContent = conditionText || 'Unknown';
}

function updateDetails(forecast, precip_mm, feelslike_c) {
    const detailsElement = document.querySelector('.details');
    if (detailsElement) detailsElement.innerHTML = `
        <p><strong>Min/Max Temp:</strong> ${forecast.forecastday[0].day.mintemp_c}°C / ${forecast.forecastday[0].day.maxtemp_c}°C</p>
        <p><strong>Chance of Rain:</strong> ${precip_mm || 0}%</p>
        <p><strong>Feels like:</strong> ${feelslike_c}°C</p>
    `;
}

function updateSunInfo(sunrise, sunset) {
    const sunriseElement = document.querySelector('.sun-info .card-image.sunrise + .card-content p');
    const sunsetElement = document.querySelector('.sun-info .card-image.sunset + .card-content p');

    if (sunriseElement) {
        sunriseElement.innerHTML = `<strong>Sunrise:</strong> ${sunrise || 'N/A'}`;
    }
    if (sunsetElement) {
        sunsetElement.innerHTML = `<strong>Sunset:</strong> ${sunset || 'N/A'}`;
    }
}

function generateHourlyForecastHtml(sunriseTime, sunsetTime) {
    const totalHours = hourlyData.length;
    let html = '';

    for (let i = 0; i < HOURS_TO_DISPLAY; i++) {
        // Calculeaza indexul orar curent in mod circular pentru prognoza (<- 22 23 00 01 ->)
        const hourIndex = (startHourIndex + i) % totalHours;
        const hour = hourlyData[hourIndex];
        const currentTime = new Date(hour.time);
        const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

        html += `
            <div class="hourly-item">
                <p><strong>${timeString}</strong></p>
                <p><span class="weather-icon">${getConditionIcon(hour.condition.text, hour.precip_mm, currentTime, sunriseTime, sunsetTime)}</span></p>
                <p>${hour.temp_c}°C</p>
                <p>Chance of Rain: ${hour.precip_mm || 0}%</p>
            </div>
        `;
    }

    return html;
}


function updateHourlyForecast(direction) {
    const totalHours = hourlyData.length;

    if (direction === 'prev') {
        startHourIndex = (startHourIndex - 1 + totalHours) % totalHours;
    } else if (direction === 'next') {
        startHourIndex = (startHourIndex + 1) % totalHours;
    }

    const sunriseTime = new Date(`1970-01-01T${hourlyData[0].sunrise}`);
    const sunsetTime = new Date(`1970-01-01T${hourlyData[0].sunset}`);

    const hourlyForecastHtml = generateHourlyForecastHtml(sunriseTime, sunsetTime);
    document.querySelector('.hourly-forecast').innerHTML = hourlyForecastHtml;
}


async function updateCityInfo(cityId, cityName) {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${encodeURIComponent(cityName)}&aqi=no`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const { current } = data;
        document.getElementById(`${cityId}-info`).innerHTML = `
            <h4>${cityName}</h4>
            <p><strong>Temperature:</strong> ${current.temp_c}°C</p>
            <p><strong>Condition:</strong> ${current.condition.text}</p>
            <p><strong>Chance of Rain:</strong> ${current.precip_mm || 0}%</p>
        `;
    } catch (error) {
        console.error(`Error fetching the weather data for ${cityName}:`, error);
        document.getElementById(`${cityId}-info`).innerHTML = `<p>Error fetching data for ${cityName}. Please try again.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getCurrentLocation();
    updateCityInfo('bucharest', 'Bucharest');
    updateCityInfo('newyork', 'New York');

    document.getElementById('search-button').addEventListener('click', getWeatherByCity);

    document.getElementById('prev-hour').addEventListener('click', () => {
        updateHourlyForecast('prev');
    });

    document.getElementById('next-hour').addEventListener('click', () => {
        updateHourlyForecast('next');
    });
});
