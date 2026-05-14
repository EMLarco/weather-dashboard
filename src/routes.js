import { appState } from './store/app-state.js';
import { checkExistingSession } from './services/auth-service.js';

// Verificar sesión almacenada al cargar la app
checkExistingSession();

export const routes = [
  {
    path: '/',
    component: 'login-view',
    action: async (context, commands) => {
      await import('./components/auth/login-view.js');
      if (appState.isLoggedIn()) {
        return commands.redirect('/dashboard');
      }
    },
  },
  {
    path: '/register',
    component: 'register-view',
    action: async (context, commands) => {
      await import('./components/auth/register-view.js');
      if (appState.isLoggedIn()) {
        return commands.redirect('/dashboard');
      }
    },
  },
  {
    path: '/dashboard',
    component: 'newsroom-view',
    action: async (context, commands) => {
      await import('./components/weather/newsroom-view.js');
      if (!appState.isLoggedIn()) {
        return commands.redirect('/');
      }
    },
  },
  {
    path: '/report/:cityName',
    component: 'city-report-view',
    action: async (context, commands) => {
      await import('./components/weather/city-report-view.js');
      if (!appState.isLoggedIn()) {
        return commands.redirect('/');
      }
    },
  },
  {
    path: '(.*)',
    component: 'not-found-view',
    action: async () => {
      await import('./components/shared/not-found-view.js');
    },
  },
];