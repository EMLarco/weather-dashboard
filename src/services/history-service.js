import { API_BASE_URL } from '../utils/constants.js';
import { apiClient } from '../utils/api-client.js';

export async function getHistory() {
  return apiClient(`${API_BASE_URL}/history.php`);
}

export async function addToHistory(cityName, lat, lon) {
  return apiClient(`${API_BASE_URL}/history.php`, {
    method: 'POST',
    body: JSON.stringify({ city_name: cityName, latitude: lat, longitude: lon }),
  });
}