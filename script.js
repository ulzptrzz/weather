const container = document.querySelector('.container');
const search = document.querySelector('.search-box button');
const searchInput = document.querySelector('.search-box');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');
const card = document.querySelector('.card');
const hourly = document.querySelector('.hourly');
const currentWeatherCard = document.querySelectorAll('.weather-left .card')[0];
const fiveDaysForecastCard = document.querySelector('.day-forecast');
const hourlyForecastCard = document.querySelector('.hourly-forecast');
const cityHide = document.querySelector('.city-hide');

const APIKey = '64833336264ff473245536706fd4efbd';

function updateWeatherUI(json, city) {
    const image = document.querySelector('.weather-box img');
    const temperature = document.querySelector('.weather-box .temperature');
    const description = document.querySelector('.weather-box .description');
    const humidity = document.querySelector('.weather-details .humidity span');
    const wind = document.querySelector('.weather-details .wind span');

    cityHide.textContent = city;
    container.style.height = '730px';
    container.style.width = '800px';
    searchInput.style.width = '100%';
    container.classList.add('active');
    weatherBox.classList.add('active');
    weatherDetails.classList.add('active');
    card.classList.add('active');
    hourly.classList.add('active');
    error404.classList.remove('active');

    setTimeout(() => {
        container.classList.remove('active');
    }, 2500);

    switch (json.weather[0].main) {
        case 'Clear':
            image.src = 'images/sun.png';
            break;
        case 'Rain':
            image.src = 'images/hujan.png';
            break;
        case 'Snow':
            image.src = 'images/snow.png';
            break;
        case 'Clouds':
            image.src = 'images/cloudsun.png';
            break;
        case 'Mist':
        case 'Haze':
            image.src = 'images/mist.png';
            break;
        default:
            image.src = 'images/cloudsun.png';
    }

    temperature.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
    description.innerHTML = `${json.weather[0].description}`;
    humidity.innerHTML = `${json.main.humidity}%`;
    wind.innerHTML = `${parseInt(json.wind.speed)}km/h`;

    cloneAndRemoveInfo('.info-weather', 'clone-info-weather');
    cloneAndRemoveInfo('.info-humidity', 'clone-info-humidity');
    cloneAndRemoveInfo('.info-wind', 'clone-info-wind');
}

function cloneAndRemoveInfo(selector, cloneId) {
    const infoElement = document.querySelector(selector);
    const clonedElement = infoElement.cloneNode(true);

    clonedElement.id = cloneId;
    clonedElement.classList.add('active-clone');

    setTimeout(() => {
        infoElement.insertAdjacentElement('afterend', clonedElement);
    }, 2200);

    const clones = document.querySelectorAll(`${selector}.active-clone`);
    if (clones.length > 0) {
        clones[0].classList.remove('active-clone');
        setTimeout(() => {
            clones[0].remove();
        }, 2200);
    }
}

function updateHourlyForecast(data) {
    if (!data || !data.list || data.list.length === 0) {
        console.error("Invalid data for hourly forecast");
        return;
    }

    const hourlyForecast = data.list.slice(0, 8); 
    hourlyForecastCard.innerHTML = ''; 

    hourlyForecast.forEach(forecast => {
        const forecastDate = new Date(forecast.dt_txt);
        let hour = forecastDate.getHours();
        const period = hour < 12 ? 'AM' : 'PM';
        if (hour === 0) {
            hour = 12;
        } else if (hour > 12) {
            hour -= 12;
        }

        const temperature = Math.round(forecast.main.temp); 

        hourlyForecastCard.innerHTML += `
            <div class="hourly-items">
                <p>${hour} ${period}</p>
                <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
                <p>${forecast.main.temp.toFixed(2)}&deg;C</p>
            </div>
        `;
    });

    const currentCards = hourlyForecastCard.querySelectorAll('.hourly-items').length;
    if (currentCards < 8) {
        for (let i = currentCards; i < 8; i++) {
            hourlyForecastCard.innerHTML += `
               <div class="hourly-items">
                    <p> _ AM</p>
                    <img src="" alt="">
                    <p>--&deg;C</p>
                </div>
            `;
        }
    }
}


function updateFiveDaysForecast(data) {
    let uniqueForecastDays = [];
    let fiveDaysForecast = data.list.filter(forecast => {
        let forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
            uniqueForecastDays.push(forecastDate);
            return true;
        }
        return false;
    });

    fiveDaysForecastCard.innerHTML = '';
    fiveDaysForecast.slice(1).forEach(forecast => {
        let date = new Date(forecast.dt_txt);
        fiveDaysForecastCard.innerHTML += `
            <div class="forecast-item">
                <div class="icon-wrapper">
                    <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="">
                    <span>${forecast.main.temp.toFixed(2)}&deg;C</span>
                </div>
                <p>${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}</p>
                <p>${date.toLocaleString('default', { weekday: 'short' })}</p>
            </div>
        `;
    });
}

search.addEventListener('click', () => {
    const city = document.querySelector('.search-box input').value;

    if (city === '') return;

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`)
        .then(response => response.json())
        .then(json => {
            if (json.cod === '404') {
                cityHide.textContent = city;
                container.style.height = '400px';
                container.style.width = '400px';
                searchInput.style.width = '800cm';
                weatherBox.classList.remove('active');
                weatherDetails.classList.remove('active');
                card.classList.remove('active');
                hourly.classList.remove('active');
                error404.classList.add('active');
                return;
            }

            if (cityHide.textContent === city) return;

            updateWeatherUI(json, city);

            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${APIKey}`)
                .then(res => res.json())
                .then(data => {
                    updateHourlyForecast(data);
                    updateFiveDaysForecast(data);
                })
                .catch(() => {
                    alert('Failed to fetch weather forecast');
                });
        })
        .catch(() => {
            alert('Failed to fetch current weather');
        });
});