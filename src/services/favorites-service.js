import { API_BASE_URL } from '../utils/constants.js';
import { apiClient } from '../utils/api-client.js';

export async function getFavorites() {
  return apiClient(`${API_BASE_URL}/favorites.php`);
}

export async function addFavorite(cityName, countryCode, lat, lon) {
  return apiClient(`${API_BASE_URL}/favorites.php`, {
    method: 'POST',
    body: JSON.stringify({ city_name: cityName, country_code: countryCode, latitude: lat, longitude: lon }),
  });
}

export async function removeFavorite(id) {
  return apiClient(`${API_BASE_URL}/favorites.php?id=${id}`, {
    method: 'DELETE',
  });
}