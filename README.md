<p align="center">
  <img src="logo.png" alt="Weather Dashboard logo" width="120" />
</p>

<h1 align="center">Weather Dashboard</h1>

<p align="center">
  Single-page weather application built with <strong>Lit Web Components</strong> and <strong>Vite</strong>.<br/>
  Search any city, check current conditions and forecasts, explore an interactive world map, and keep your favorite places one click away.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Lit-3-324FFF?style=for-the-badge&logo=lit&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet&logoColor=white" />
  <img src="https://img.shields.io/badge/MapLibre_GL-5-396CB2?style=for-the-badge&logo=maplibre&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenWeatherMap-API-EB6E4B?style=for-the-badge&logo=openweathermap&logoColor=white" />
</p>

<p align="center">
  <img src="world-map.png" alt="World map view" width="85%" />
</p>

---

## Features

- **User accounts** — registration and login with JWT-based sessions that persist across page reloads.
- **Protected routes** — the dashboard and city reports are only available to authenticated users.
- **City search** — look up any city and get its current weather instantly.
- **Current weather** — temperature, conditions and key metrics for the selected location.
- **Forecast** — day-by-day forecast cards for upcoming weather.
- **Interactive world map** — powered by Leaflet and MapLibre GL.
- **Geolocation** — detects the user's position to show local weather.
- **Favorites** — save cities and open their reports with one click.
- **Search history** — quick access to recently searched cities.
- **City report page** — dedicated view for each city at `/report/:cityName`.
- **Lazy-loaded views** — each route loads its component only when visited.
- **404 page** — friendly not-found view for unknown routes.

## Tech Stack

| Layer | Technology |
|---|---|
| UI components | [Lit 3](https://lit.dev/) (Web Components) |
| Routing | [@vaadin/router](https://github.com/vaadin/router) |
| Maps | [Leaflet](https://leafletjs.com/), [MapLibre GL JS](https://maplibre.org/) |
| Weather data | [OpenWeatherMap API](https://openweathermap.org/api) |
| Build tool | [Vite 8](https://vite.dev/) |
| Auth | JWT issued by a REST backend (`auth/login.php`, `auth/register.php`) |

## Project Structure

```
weather-dashboard/
├── index.html
├── public/                     # Static assets (favicon, icons)
└── src/
    ├── main.js                 # App entry point
    ├── routes.js               # Route definitions and auth guards
    ├── index.css               # Global styles
    ├── components/
    │   ├── app/                # Header and footer
    │   ├── auth/               # Login and register views
    │   ├── favorites/          # Favorites panel and items
    │   ├── history/            # Search history panel and items
    │   ├── shared/             # City search, loading spinner, 404 view
    │   └── weather/            # Dashboard, city report, current weather, forecast, world map
    ├── services/               # Auth, weather, location, favorites and history services
    ├── store/
    │   └── app-state.js        # Shared application state
    └── utils/
        ├── api-client.js       # HTTP client for the backend API
        └── constants.js        # API URLs and configuration
```

## Routes

| Path | View | Access |
|---|---|---|
| `/` | Login | Public (redirects to `/dashboard` if logged in) |
| `/register` | Register | Public (redirects to `/dashboard` if logged in) |
| `/dashboard` | Weather dashboard | Authenticated |
| `/report/:cityName` | City weather report | Authenticated |
| `*` | Not found | Public |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- An [OpenWeatherMap API key](https://home.openweathermap.org/api_keys) (free tier works)
- The backend API running (handles authentication, favorites and history)

### Installation

```bash
git clone https://github.com/EMLarco/weather-dashboard.git
cd weather-dashboard
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
VITE_OPENWEATHER_API_KEY=your_openweathermap_api_key
VITE_API_BASE_URL=http://localhost/your-backend-path/
```

| Variable | Description |
|---|---|
| `VITE_OPENWEATHER_API_KEY` | Your OpenWeatherMap API key |
| `VITE_API_BASE_URL` | Base URL of the backend API (authentication, favorites, history) |

> The `.env` file is ignored by Git. Never commit your API keys.

### Run

```bash
npm run dev       # Start the development server
npm run build     # Build for production into dist/
npm run preview   # Preview the production build locally
```

Then open the URL shown in the terminal (by default `http://localhost:5173`).

## Author

**Esteban Larco** — Information Technology Engineering student at Universidad de las Fuerzas Armadas ESPE.

[![GitHub](https://img.shields.io/badge/GitHub-EMLarco-181717?style=flat&logo=github)](https://github.com/EMLarco)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Esteban%20Larco-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/esteban-larco-66491843b)
