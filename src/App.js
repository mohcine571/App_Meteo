import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

function Grp204WeatherApp() {
    const [input, setInput] = useState('');
    const [weather, setWeather] = useState({ loading: false, data: {}, error: false });
    const [forecast, setForecast] = useState([]);
    const [theme, setTheme] = useState('day'); // État pour le thème (jour/nuit)

    const apiKey = 'f00c38e0279b7bc85480c3fe775d518c';

    // Fonction pour récupérer les prévisions météo
    const getForecast = async (city) => {
        try {
            const response = await axios.get(forecastUrl, {
                params: {
                    q: city,
                    units: 'metric',
                    appid: apiKey,
                },
            });

            const dailyForecast = response.data.list.filter((item) =>
                item.dt_txt.includes('12:00:00')
            );
            setForecast(dailyForecast);
        } catch (error) {
            console.error('Erreur lors de la récupération des prévisions :', error);
        }
    };

    // Fonction pour changer le thème en fonction de l'heure locale
    const updateTheme = (timezoneOffset) => {
        const localTime = new Date(new Date().getTime() + timezoneOffset * 1000);
        const hour = localTime.getUTCHours();
        setTheme(hour >= 6 && hour < 18 ? 'day' : 'night'); // Jour entre 6h et 18h
    };

    // Fonction pour détecter la localisation de l'utilisateur
    const detectLocation = async () => {
        try {
            setWeather({ ...weather, loading: true });

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const { latitude, longitude } = position.coords;
            const response = await axios.get(weatherUrl, {
                params: {
                    lat: latitude,
                    lon: longitude,
                    units: 'metric',
                    appid: apiKey,
                },
            });

            setWeather({ data: response.data, loading: false, error: false });
            updateTheme(response.data.timezone);
            await getForecast(response.data.name);
        } catch (error) {
            console.error('Erreur lors de la détection de la localisation :', error);
            setWeather({ ...weather, data: {}, error: true });
        }
    };

    // Fonction de recherche
    const search = async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            setInput('');
            setWeather({ ...weather, loading: true });

            try {
                const response = await axios.get(weatherUrl, {
                    params: {
                        q: input,
                        units: 'metric',
                        appid: apiKey,
                    },
                });

                setWeather({ data: response.data, loading: false, error: false });
                updateTheme(response.data.timezone);
                await getForecast(input);
            } catch (error) {
                setWeather({ ...weather, data: {}, error: true });
                setInput('');
            }
        }
    };

    // Détecter automatiquement la localisation à l'ouverture de l'application
    useEffect(() => {
        detectLocation();
    }, []);

    return (
        <div className={`App ${theme}`}>
            <h1 className="app-name">Application Météo grp204</h1>
            <div className="search-bar">
                <input
                    type="text"
                    className="city-search"
                    placeholder="Entrez le nom de la ville..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={search}
                />
            </div>


            {weather.error && <p className="error-message">Ville introuvable</p>}

            {weather.data && weather.data.main && (
                <div className="weather-info">
                    <h2>{weather.data.name}, {weather.data.sys.country}</h2>
                    <p>Température : {Math.round(weather.data.main.temp)}°C</p>
                    <p>Vitesse du vent : {weather.data.wind.speed} m/s</p>
                </div>
            )}

            {/* Affichage des prévisions sur 5 jours */}
            {forecast.length > 0 && (
                <div className="forecast">
                    <h3>Prévisions sur 5 jours</h3>
                    <div className="forecast-items">
                        {forecast.map((day) => (
                            <div key={day.dt} className="forecast-item">
                                <p>{new Date(day.dt_txt).toLocaleDateString()}</p>
                                <img
                                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                                    alt={day.weather[0].description}
                                />
                                <p>{Math.round(day.main.temp)}°C</p>
                                <p>{day.weather[0].description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Grp204WeatherApp;
