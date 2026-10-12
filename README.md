# Weather Dashboard

A responsive weather dashboard built with HTML, CSS and vanilla JavaScript. Enter a city name and the app fetches live weather data from the free [Open-Meteo](https://open-meteo.com/) API using `async/await` and the Fetch API.

## Features
- Search by city name
- Shows temperature, conditions, weather icon, feels-like, humidity, wind speed and pressure
- Loading spinner while requests are in progress
- Clear error messages for empty input, unknown cities, rate limits and network failures
- Responsive layout (mobile and desktop)

## Setup

**No API key is needed.** Open-Meteo is free for non-commercial use and requires no sign-up, so there are no secrets in this repository.

1. Download or clone the repository.
2. Open `index.html` in your browser (or use the VS Code "Live Server" extension).
3. Type a city (e.g. `Beirut`) and click **Search**.

> If you switch to an API that needs a key (e.g. OpenWeatherMap), keep the key in a `config.js` file, add `config.js` to `.gitignore`, and commit a `config.example.js` placeholder instead.

## How it works
Open-Meteo needs coordinates, so each search makes two requests:
1. **Geocoding API** (`geocoding-api.open-meteo.com/v1/search`) turns the city name into latitude and longitude.
2. **Forecast API** (`api.open-meteo.com/v1/forecast`) returns the current weather for those coordinates.

The API returns a numeric weather code, which the app converts to a description and an emoji icon.

## Project structure
```
index.html   page structure
style.css    styling and responsive layout
script.js    fetch logic, loading/error handling, rendering
.gitignore
```

## How errors are handled
| Situation | Message shown |
|-----------|---------------|
| Empty input | "Please enter a city name." |
| City not found | City was not found |
| Rate limit (429) | Too many requests |
| Other bad response | Weather service error with status code |
| No internet | Network error |

## Screenshot
See `screenshot.png`.

## Technologies
HTML5, CSS3, JavaScript (Fetch API, async/await, try/catch/finally), Open-Meteo API.
