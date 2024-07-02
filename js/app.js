/******************************************************************************
***
* WEB422 – Assignment 1
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
* 
* Name:Ali Rezk   Student ID: 105593222   Date: 2024-05-28
*
******************************************************************************
**/

//wait for the DOM content to be fully loaded before executing the JavaScript
document.addEventListener("DOMContentLoaded", () => {
    //check if geolocation is supported by the browser
    if (navigator.geolocation) {

        //get the current position of the user
        navigator.geolocation.getCurrentPosition(position => {

            //extract latitude and longitude from the position object
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            //call a function to fetch weather data by using the user coordinates
            fetchWeatherByCoords(lat, lon);
        }, error => {
           
            console.error("Error getting geolocation:", error.message);
           fetchWeatherByCity("Toronto");
        });
    } else {
        fetchWeatherByCity("Toronto");
    }
});

//my API
const apiKey = 'f0ea161c81fa72480cdd106971f60c86'; 

//variables for pagination
let currentPage = 1;
const resultsPerPage = 3;
let searchResults = [];

//get the language select dropdown element
const languageSelect = document.getElementById('languageSelect');

//an event listener for the search button click
document.getElementById('searchBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();

    //calling the searchCity function with the entered city name
    searchCity(city);
});

//an event listener for pressing Enter in the city input field
document.getElementById('cityInput').addEventListener('keypress', (enter) => {
    if (enter.key === 'Enter') {
        const city = enter.target.value.trim();

        //calling the searchCity function with the entered city name
        searchCity(city);
    }
});

//function to fetch weather data by coordinates
async function fetchWeatherByCoords(lat, lon) {
    try {

        //get the selected language from the language dropdown
        const lang = languageSelect.value;

        //fetch weather data using latitude and longitude
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${lang}`);
        if (!response.ok) {
            console.error(err)
        }

        const data = await response.json();
        //display the weather data
        displayWeather([data]);

    } catch (err) {
        console.error("Error fetching weather data:", err.message);
        
    }
}

//function to search a city by its name
async function searchCity(city) {
    try {
        const lang = languageSelect.value;

        //fetch the weather data by the city name
        const response = await fetch(`https://api.openweathermap.org/data/2.5/find?q=${city}&appid=${apiKey}&units=metric&lang=${lang}&cnt=50`);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        //filtring search results
        searchResults = data.list.filter(city => city.sys.country && city.name.toLowerCase()
         === city.name.toLowerCase());
        if (searchResults.length === 0) {
            throw new Error('No valid cities found');
        }
        currentPage = 1;

        //display search results
        displayWeather(searchResults);

    } catch (error) {
        //display the error message
        document.getElementById('error-message').textContent = error.message;
    }
}

//function to display the weather data
async function displayWeather(data) {
    const weatherDisplay = document.getElementById('weatherDisplay');
    weatherDisplay.innerHTML = '';

    if (data.length === 0) {
        return;
    }

    const start = (currentPage - 1) * resultsPerPage;
    const end = start + resultsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach(city => {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=${apiKey}&units=metric`)
        
            .then(response => {
                if (!response.ok) {
                    throw new Error('Unable to fetch weather data.');
                }
                return response.json();
            })
            .then(weatherData => {
                let  sunriseTime =  new Date(weatherData.sys.sunrise * 1000)
                let sunsetTime =  new Date(weatherData.sys.sunset * 1000)

                // Display weather information
                weatherDisplay.innerHTML += `
                    <div class="card mt-2">
                        <div class="card-body">
                            <h5 class="card-title">${city.name}, ${city.sys.country} <img src="http://openweathermap.org/images/flags/${city.sys.country.toLowerCase()}.png" alt="${city.sys.country} flag"></h5>
                            <p class="card-text">Weather: ${weatherData.weather[0].main}</p>
                            <p class="card-text">Description: ${weatherData.weather[0].description}</p>
                            <p class="card-text">Temperature: ${weatherData.main.temp}°C</p>
                            <p class="card-text">Max Temperature: ${weatherData.main.temp_max}°C</p>
                            <p class="card-text">Min Temperature: ${weatherData.main.temp_min}°C</p>
                            <p class="card-text">Wind Speed: ${weatherData.wind.speed} m/s</p>
                            <p class="card-text">Humidity: ${weatherData.main.humidity}%</p>
                            <p class="card-text">Pressure: ${weatherData.main.pressure} hPa</p>
                            <p class="card-text">Sunrise: ${sunriseTime}</p>
                            <p class="card-text">Sunset: ${sunsetTime}</p>
                        </div>
                    </div>
                `;
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
            });
    });
    displayPagination(data.length);
}

//function to display pagination
function displayPagination(totalResults) {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(totalResults / resultsPerPage);

    pagination.innerHTML = `
        <nav>
            <ul class="pagination">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" aria-label="Previous" onclick="changePage(${currentPage - 1})">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link"
                href="#" onclick="changePage(${i})">${i}</a>
                </li>
            `;
        }
    
        pagination.innerHTML += `
                    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                        <a class="page-link" href="#" aria-label="Next" onclick="changePage(${currentPage + 1})">
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
                </ul>
            </nav>
        `;
    }
    
    //function to change the page
    function changePage(page) {
        currentPage = page;
        displayWeather(searchResults);
    }
    