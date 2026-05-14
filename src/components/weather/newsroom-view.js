import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import { getCurrentPosition } from '../../services/location-service.js';
import { getCurrentWeather, getForecast } from '../../services/weather-service.js';
import { addToHistory } from '../../services/history-service.js';
import { addFavorite } from '../../services/favorites-service.js';
import './world-map.js';
import '../shared/city-search.js';
import '../favorites/favorites-panel.js';
import '../history/search-history-panel.js';
import '../shared/loading-spinner.js';

class NewsroomView extends LitElement {
static styles = css`
  :host {
    display: block;
    height: 100%;
    position: relative;
    overflow: hidden;
  }
  world-map {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
  .main-layout {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    gap: 1.5rem;
    padding: 20px;
    z-index: 1000;
    justify-content: space-between;
    pointer-events: none;   /* ← Permite que el mapa reciba clics y gestos */
  }
  .left-side {
    width: 380px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    padding-right: 6px;
    pointer-events: auto;   /* ← Reactiva la interacción */
  }
  .right-side {
    width: 340px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    pointer-events: auto;
  }
  .history-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    min-height: 0;
    pointer-events: auto;
  }
  .panel {
    background: rgba(20, 30, 40, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 20px;
    padding: 1.5rem;
    color: #ffffff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    transition: transform 0.3s;
    overflow: visible;
    max-height: none;
    height: auto;
    pointer-events: auto;
  }
  .panel:hover {
    transform: translateY(-2px);
  }
  .panel > * {
    overflow: visible !important;
    max-height: none !important;
  }
  /* Scrollbar personalizada */
  .left-side::-webkit-scrollbar,
  .history-panel::-webkit-scrollbar {
    width: 5px;
  }
  .left-side::-webkit-scrollbar-track,
  .history-panel::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.05);
    border-radius: 3px;
  }
  .left-side::-webkit-scrollbar-thumb,
  .history-panel::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.2);
    border-radius: 3px;
  }
  city-search {
    width: 100%;
    pointer-events: auto;
  }
  .weather-card {
    margin-top: 1rem;
  }
  .temp-large {
    font-size: 3.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #ff9a56, #ff4d6a);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .weather-details {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.8rem;
  font-size: 0.95rem;
  color: rgba(255,255,255,0.8);
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
.weather-details span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
  /* Pronóstico vertical */
  .forecast-vertical {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
    max-height: 280px;
    overflow-y: auto;
    padding-right: 6px;
  }
  .forecast-vertical::-webkit-scrollbar {
    width: 5px;
  }
  .forecast-vertical::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.05);
    border-radius: 3px;
  }
  .forecast-vertical::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.2);
    border-radius: 3px;
  }
  .forecast-item-vertical {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 0.5rem 1rem;
    backdrop-filter: blur(5px);
  }
  .forecast-item-vertical .day {
    font-weight: bold;
    min-width: 80px;
    color: #ffd966;
  }
  .forecast-item-vertical .temp {
    font-size: 1.2rem;
    font-weight: bold;
    color: #ff9a56;
  }
  .forecast-item-vertical .desc {
    color: rgba(255,255,255,0.9);
    font-size: 0.9rem;
    text-transform: capitalize;
  }
  button {
    background: linear-gradient(135deg, #ff9a56, #ff4d6a);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 0.8rem;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s;
    text-shadow: 0 1px 3px rgba(0,0,0,0.3);
    pointer-events: auto;
  }
  button:hover {
    transform: scale(1.05);
  }
  .back-to-world-btn {
    margin-bottom: 1rem;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    backdrop-filter: blur(10px);
  }
`;

  static properties = {
    weatherData: { type: Object },
    forecastData: { type: Array },
    currentLat: { type: Number },
    currentLon: { type: Number },
  };

  constructor() {
    super();
    this.weatherData = null;
    this.forecastData = [];
    this.currentLat = 20;
    this.currentLon = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    this._initLocation();
  }

  async _initLocation() {
    try {
      const { lat, lon } = await getCurrentPosition();
      this.currentLat = lat;
      this.currentLon = lon;
      await this._fetchWeather(lat, lon);
      const map = this.renderRoot.querySelector('world-map');
      if (map) map.flyTo(lat, lon);
    } catch {
      this.currentLat = 40.4168;
      this.currentLon = -3.7038;
      await this._fetchWeather(this.currentLat, this.currentLon);
      const map = this.renderRoot.querySelector('world-map');
      if (map) map.flyTo(this.currentLat, this.currentLon);
    }
  }

  async _fetchWeather(lat, lon) {
    try {
      this.weatherData = await getCurrentWeather(lat, lon);
      this.forecastData = await getForecast(lat, lon);
    } catch (e) {
      console.error('Error al obtener el clima', e);
      this.weatherData = null;
      this.forecastData = [];
    }
  }

  async _onMapClick(e) {
    const { lat, lon } = e.detail;
    this.currentLat = lat;
    this.currentLon = lon;
    await this._fetchWeather(lat, lon);

    const map = this.renderRoot.querySelector('world-map');
    if (map && this.weatherData) {
      map.flyToCity(lat, lon, this.weatherData.name, this.weatherData.weather[0].main);
      addToHistory(this.weatherData.name, lat, lon).catch(console.error);
    }
  }

  async _onCitySelected(e) {
    const city = e.detail.city;
    this.currentLat = city.lat;
    this.currentLon = city.lon;
    await this._fetchWeather(city.lat, city.lon);

    const map = this.renderRoot.querySelector('world-map');
    if (map && this.weatherData) {
      map.flyToCity(city.lat, city.lon, this.weatherData.name, this.weatherData.weather[0].main);
      addToHistory(this.weatherData.name, city.lat, city.lon).catch(console.error);
    }
  }

  async _onHistoryCitySelected(e) {
    const { cityName, lat, lon } = e.detail;
    this.currentLat = lat;
    this.currentLon = lon;
    await this._fetchWeather(lat, lon);

    const map = this.renderRoot.querySelector('world-map');
    if (map && this.weatherData) {
      map.flyToCity(lat, lon, this.weatherData.name, this.weatherData.weather[0].main);
    }
  }

  render() {
    return html`
      <world-map
        lat=${this.currentLat}
        lon=${this.currentLon}
        @map-click=${this._onMapClick}
      ></world-map>

      <div class="main-layout">
        <!-- Columna izquierda: búsqueda, clima, favoritos -->
        <div class="left-side">
          <div class="panel">
            <city-search @city-selected=${this._onCitySelected}></city-search>
            ${this.weatherData
              ? html`
                  <button class="back-to-world-btn" @click=${() => {
                    const map = this.renderRoot.querySelector('world-map');
                    if (map) map.backToWorld();
                    this.weatherData = null;
                  }}>🌍 Volver al mapa mundial</button>
                  <div class="weather-card">
                    <h2>${this.weatherData.name}</h2>
                    <div class="temp-large">${Math.round(this.weatherData.main.temp)}°C</div>
                    <div>${this.weatherData.weather[0].description}</div>
                    <div class="weather-details">
                      <span>💨 ${this.weatherData.wind.speed} m/s</span>
                      <span>💧 ${this.weatherData.main.humidity}%</span>
                    </div>
                    <div class="forecast-vertical">
                      ${this.forecastData.map(day => html`
                        <div class="forecast-item-vertical">
                          <span class="day">${new Date(day.dt_txt).toLocaleDateString('es', {weekday: 'short', day: 'numeric'})}</span>
                          <span class="desc">${day.weather[0].description}</span>
                          <span class="temp">${Math.round(day.main.temp)}°</span>
                        </div>
                      `)}
                    </div>
                    <button @click=${() => this._addToFavorites()} style="margin-top: 1rem; width:100%;">
                      ⭐ Guardar favorito
                    </button>
                  </div>
                `
              : html`<loading-spinner></loading-spinner>`}
          </div>
          <div class="panel">
            <favorites-panel></favorites-panel>
          </div>
        </div>

        <!-- Columna derecha: historial -->
        <div class="right-side">
          <div class="panel history-panel">
            <search-history-panel @search-city=${this._onHistoryCitySelected}></search-history-panel>
          </div>
        </div>
      </div>
    `;
  }

  async _addToFavorites() {
    if (!this.weatherData) return;
    const { name, coord } = this.weatherData;
    try {
      await addFavorite(name, this.weatherData.sys?.country || '', coord.lat, coord.lon);
      alert('Añadido a favoritos');
      this.requestUpdate();
    } catch (e) {
      alert('Error al añadir favorito');
    }
  }
}

customElements.define('newsroom-view', NewsroomView);