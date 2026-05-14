import { OPENWEATHER_BASE_URL, OPENWEATHER_API_KEY } from '../utils/constants.js';
import { apiClient } from '../utils/api-client.js';

// Clima actual por coordenadas
export async function getCurrentWeather(lat, lon) {
  const url = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`;
  return apiClient(url);
}

// Pronóstico de 5 días (3 horas) filtrado a un dato por día
export async function getForecast(lat, lon) {
  const url = `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`;
  const data = await apiClient(url);
  const daily = [];
  const seenDays = new Set();
  for (const item of data.list) {
    const date = item.dt_txt.split(' ')[0];
    if (!seenDays.has(date) && item.dt_txt.includes('12:00:00')) {
      seenDays.add(date);
      daily.push(item);
    }
  }
  if (daily.length < 5) {
    const fallback = [];
    const fallbackDays = new Set();
    for (const item of data.list) {
      const date = item.dt_txt.split(' ')[0];
      if (!fallbackDays.has(date)) {
        fallbackDays.add(date);
        fallback.push(item);
      }
    }
    return fallback.slice(0, 5);
  }
  return daily.slice(0, 5);
}

export async function getCoordinatesByCityName(cityName) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=5&appid=${OPENWEATHER_API_KEY}`;
  const data = await apiClient(url);
  if (!data || data.length === 0) {
    throw new Error(`Ciudad "${cityName}" no encontrada`);
  }
  return data; // array de objetos
}
