import { LitElement, html, css } from 'lit';
import { getCoordinatesByCityName, getCurrentWeather, getForecast } from '../../services/weather-service.js';
import { addFavorite } from '../../services/favorites-service.js';
import './current-weather.js';
import './forecast-day.js';
import '../shared/loading-spinner.js';

class CityReportView extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
      animation: enter 0.5s ease-out forwards;
    }
    @keyframes enter {
      0% {
        transform: scale(0.8);
        opacity: 0;
        filter: blur(10px);
      }
      100% {
        transform: scale(1);
        opacity: 1;
        filter: blur(0);
      }
    }
    .forecast {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      overflow-x: auto;
      padding-bottom: 1rem;
    }
    .back-btn {
      display: inline-block;
      margin-bottom: 1rem;
      color: var(--primary-color, #3498db);
      cursor: pointer;
      text-decoration: underline;
    }
    .fav-btn {
      margin-left: 1rem;
      padding: 0.5rem 1rem;
      background: var(--primary-color, #3498db);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    .fav-btn:hover {
      background: var(--primary-dark, #2980b9);
    }
  `;

  static properties = {
    loading: { type: Boolean },
    weatherData: { type: Object },
    forecastData: { type: Array },
    cityName: { type: String },
  };

  constructor() {
    super();
    this.loading = true;
    this.weatherData = null;
    this.forecastData = [];
    this.cityName = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.cityName = this.location?.params?.cityName || '';
    this._fetchData();
  }

async _fetchData() {
  this.loading = true;
  try {
    const cities = await getCoordinatesByCityName(this.cityName);
    if (!cities || cities.length === 0) {
      throw new Error('Ciudad no encontrada');
    }
    const coords = cities[0]; // Tomamos el primer resultado
    const weather = await getCurrentWeather(coords.lat, coords.lon);
    const forecast = await getForecast(coords.lat, coords.lon);
    this.weatherData = weather;
    this.forecastData = forecast;
  } catch (error) {
    console.error(error);
    this.weatherData = null;
    this.forecastData = [];
  } finally {
    this.loading = false;
  }
}

_addToFavorites = async () => {
  try {
    const cities = await getCoordinatesByCityName(this.cityName);
    if (cities && cities.length > 0) {
      const city = cities[0];
      await addFavorite(city.name, city.country, city.lat, city.lon);
      alert('Ciudad añadida a favoritos');
    }
  } catch (e) {
    alert('Error al añadir: ' + e.message);
  }
}

  render() {
    if (this.loading) {
      return html`<loading-spinner></loading-spinner>`;
    }

    return html`
      <div class="back-btn" @click=${() => window.history.back()}>← Volver</div>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h1>Reporte de ${this.cityName}</h1>
        <button @click=${this._addToFavorites} class="fav-btn">⭐ Añadir a favoritos</button>
      </div>
      ${!this.weatherData
        ? html`<p>No se pudo obtener el clima para esta ciudad.</p>`
        : html`
            <current-weather .weather=${this.weatherData}></current-weather>
            <div class="forecast">
              ${this.forecastData.map(day => html`<forecast-day .day=${day}></forecast-day>`)}
            </div>
          `}
    `;
  }
}

customElements.define('city-report-view', CityReportView);