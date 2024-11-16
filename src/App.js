import { Oval } from 'react-loader-spinner';
import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function Grp204WeatherApp() {
  const [input, setInput] = useState('');
  const [weather, setWeather] = useState({
    loading: false,
    currentData: {},
    forecastData: [],
    error: false,
  });

  const toDateFunction = (timestamp = null) => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const WeekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const currentDate = timestamp ? new Date(timestamp * 1000) : new Date();
    const date = `${WeekDays[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
    return date;
  };

  const search = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setInput('');
      setWeather({ ...weather, loading: true });
      const api_key = 'f00c38e0279b7bc85480c3fe775d518c';

      try {
        // Current Weather Data API Call
        const currentWeatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
        const currentResponse = await axios.get(currentWeatherUrl, {
          params: {
            q: input,
            units: 'metric',
            appid: api_key,
          },
        });

        // 5-Day Forecast Data API Call
        const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
        const forecastResponse = await axios.get(forecastUrl, {
          params: {
            q: input,
            units: 'metric',
            appid: api_key,
          },
        });

        // Extracting 5-day forecast data (one data point per day at 12:00)
        const dailyForecast = forecastResponse.data.list.filter(item => item.dt_txt.includes("12:00:00"));
        
        setWeather({
          currentData: currentResponse.data,
          forecastData: dailyForecast,
          loading: false,
          error: false,
        });
      } catch (error) {
        setWeather({ ...weather, currentData: {}, forecastData: [], error: true });
        setInput('');
      }
    }
  };

  return (
    <div className="App">
      <h1 className="app-name">Application Météo grp206</h1>
      <div className="search-bar">
        <input
          type="text"
          className="city-search"
          placeholder="Entrez le nom de la ville..."
          name="query"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyPress={search}
        />
      </div>
      
      {weather.loading && <Oval type="Oval" color="black" height={100} width={100} />}

      {weather.error && (
        <span className="error-message">
          <FontAwesomeIcon icon={faFrown} />
          <span>Ville introuvable</span>
        </span>
      )}

      {weather.currentData.main && (
        <div>
          <h2>{weather.currentData.name}, {weather.currentData.sys.country}</h2>
          <span>{toDateFunction()}</span>
          <img src={`https://openweathermap.org/img/wn/${weather.currentData.weather[0].icon}@2x.png`}
            alt={weather.currentData.weather[0].description} />
          <p>{Math.round(weather.currentData.main.temp)}°C</p>
          <p>Vitesse du vent : {weather.currentData.wind.speed} m/s</p>
        </div>
      )}

      {weather.forecastData.length > 0 && (
        <div className="forecast">
          <h3>Prévisions sur 5 jours</h3>
          <div className="forecast-cards">
            {weather.forecastData.map((day, index) => (
              <div className="forecast-card" key={index}>
                <span>{toDateFunction(day.dt)}</span>
                <img src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`} alt={day.weather[0].description} />
                <p>{Math.round(day.main.temp)}°C</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Grp204WeatherApp;
