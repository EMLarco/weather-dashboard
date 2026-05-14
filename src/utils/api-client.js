import { getToken } from '../services/auth-service.js';
import { API_BASE_URL } from './constants.js';

export async function apiClient(url, options = {}) {
  const headers = {};
  const isOwnApi = url.startsWith(API_BASE_URL);

  // Solo añadimos Content-Type si hay body (POST, PUT, etc.)
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  // El token solo se envía a nuestra propia API
  if (isOwnApi) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers, // por si alguna llamada quiere sobrescribir
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (isOwnApi && response.status === 401) {
      const { logout } = await import('../services/auth-service.js');
      logout();
      window.location.href = '/';
      throw new Error('Sesión expirada');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.error || error.message || `Error ${response.status}`);
    }
    return response.json();
  } catch (err) {
    throw new Error(`Error de conexión: ${err.message}`);
  }
}