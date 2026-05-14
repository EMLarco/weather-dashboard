import { appState } from '../store/app-state.js';
import { API_BASE_URL } from '../utils/constants.js';
import { apiClient } from '../utils/api-client.js';

const TOKEN_KEY = 'weather_jwt';

function _saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem('weather_user', JSON.stringify(user));
  appState.user = user;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export async function login(email, password) {
  const data = await apiClient(`${API_BASE_URL}/auth/login.php`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  _saveSession(data.token, data.user);
}

export async function register(username, email, password) {
  const data = await apiClient(`${API_BASE_URL}/auth/register.php`, {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
  _saveSession(data.token, data.user);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('weather_user');
  appState.user = null;
}

export function checkExistingSession() {
  const token = getToken();
  if (token) {
    const savedUser = JSON.parse(localStorage.getItem('weather_user') || 'null');
    if (savedUser) {
      appState.user = savedUser;
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
}