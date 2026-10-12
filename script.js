// ---------- Grab elements with querySelector ----------
const form = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");

const loadingBox = document.querySelector("#loading");
const errorBox = document.querySelector("#error");
const weatherBox = document.querySelector("#weather");

const cityName = document.querySelector("#city-name");
const weatherIcon = document.querySelector("#weather-icon");
const temperature = document.querySelector("#temperature");
const description = document.querySelector("#description");
const feelsLike = document.querySelector("#feels-like");
const humidity = document.querySelector("#humidity");
const wind = document.querySelector("#wind");
const pressure = document.querySelector("#pressure");

// Open-Meteo needs no API key
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// Open-Meteo returns a weather "code" (WMO code). We turn it into text + an emoji icon.
function describeWeather(code, isDay) {
  if (code === 0) return { text: "Clear sky", icon: isDay ? "☀️" : "🌙" };
  if (code === 1) return { text: "Mainly clear", icon: isDay ? "🌤️" : "🌙" };
  if (code === 2) return { text: "Partly cloudy", icon: "⛅" };
  if (code === 3) return { text: "Overcast", icon: "☁️" };
  if (code === 45 || code === 48) return { text: "Fog", icon: "🌫️" };
  if (code >= 51 && code <= 55) return { text: "Drizzle", icon: "🌦️" };
  if (code === 56 || code === 57) return { text: "Freezing drizzle", icon: "🌧️" };
  if (code >= 61 && code <= 65) return { text: "Rain", icon: "🌧️" };
  if (code === 66 || code === 67) return { text: "Freezing rain", icon: "🌧️" };
  if (code >= 71 && code <= 75) return { text: "Snow", icon: "❄️" };
  if (code === 77) return { text: "Snow grains", icon: "❄️" };
  if (code >= 80 && code <= 82) return { text: "Rain showers", icon: "🌦️" };
  if (code === 85 || code === 86) return { text: "Snow showers", icon: "🌨️" };
  if (code === 95) return { text: "Thunderstorm", icon: "⛈️" };
  if (code === 96 || code === 99) return { text: "Thunderstorm with hail", icon: "⛈️" };
  return { text: "Unknown conditions", icon: "❓" };
}

// ---------- Helper functions to show/hide parts of the page ----------
function showLoading() {
  loadingBox.classList.remove("hidden");
  errorBox.classList.add("hidden");
  weatherBox.classList.add("hidden");
  searchBtn.disabled = true;
}

function hideLoading() {
  loadingBox.classList.add("hidden");
  searchBtn.disabled = false;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
  weatherBox.classList.add("hidden");
}

// Checks a response and throws a friendly error if it is not OK.
// (fetch does NOT throw on 400/404/429/500, so we must check ourselves)
function checkResponse(response) {
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Too many requests. Please wait a minute and try again.");
    }
    throw new Error(`The weather service returned an error (${response.status}). Please try again.`);
  }
}

// ---------- Step 1: city name -> latitude/longitude ----------
async function getCoordinates(city) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

  const response = await fetch(url);
  checkResponse(response);

  const data = await response.json();

  // When no city matches, the API returns no "results" property
  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${city}" was not found. Check the spelling and try again.`);
  }

  return data.results[0];
}

// ---------- Step 2: latitude/longitude -> current weather ----------
async function getWeather(latitude, longitude) {
  const params = "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,pressure_msl";
  const url = `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}&current=${params}&timezone=auto`;

  const response = await fetch(url);
  checkResponse(response);

  const data = await response.json();
  return data;
}

// ---------- Show the data on the page ----------
function displayWeather(place, data) {
  const current = data.current;
  const units = data.current_units;
  const info = describeWeather(current.weather_code, current.is_day === 1);

  // Build a name like "Beirut, Lebanon"
  cityName.textContent = place.country ? `${place.name}, ${place.country}` : place.name;

  temperature.textContent = `${Math.round(current.temperature_2m)}${units.temperature_2m}`;
  description.textContent = info.text;
  weatherIcon.textContent = info.icon;
  weatherIcon.setAttribute("aria-label", info.text);

  feelsLike.textContent = `${Math.round(current.apparent_temperature)}${units.apparent_temperature}`;
  humidity.textContent = `${current.relative_humidity_2m}${units.relative_humidity_2m}`;
  wind.textContent = `${current.wind_speed_10m} ${units.wind_speed_10m}`;
  pressure.textContent = `${Math.round(current.pressure_msl)} ${units.pressure_msl}`;

  weatherBox.classList.remove("hidden");
}

// ---------- Handle the form submit ----------
async function handleSearch(event) {
  event.preventDefault(); // stop the page from reloading

  const city = cityInput.value.trim();

  // Bad input: empty
  if (city === "") {
    showError("Please enter a city name.");
    return;
  }

  showLoading();

  try {
    const place = await getCoordinates(city);
    const weatherData = await getWeather(place.latitude, place.longitude);
    displayWeather(place, weatherData);
  } catch (error) {
    // A TypeError from fetch means the network itself failed
    if (error instanceof TypeError) {
      showError("Network error. Check your internet connection and try again.");
    } else {
      showError(error.message);
    }
  } finally {
    // Runs whether it worked or failed
    hideLoading();
  }
}

form.addEventListener("submit", handleSearch);
