import { LitElement, html, css } from 'lit';
import { Map as MapLibre, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

class WorldMap extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
    #map {
      width: 100%;
      height: 100%;
    }
    .city-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      opacity: 0;
      transition: opacity 0.8s;
      z-index: 2;
      pointer-events: none;
      background-color: #1a2530;
    }
    .city-layer.active {
      opacity: 1;
    }
    .weather-effects {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 3;
    }
    /* Nubes globales (siempre visibles en modo mundo) */
    .global-clouds {
      position: absolute;
      top: 0;
      left: 0;
      width: 200%;
      height: 100%;
      background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 200" opacity="0.15"><path d="M0 100 Q 50 0 100 100 Q 150 200 200 100 Q 250 0 300 100 Q 350 200 400 100 Q 450 0 500 100 Q 550 200 600 100 Q 650 0 700 100 Q 750 200 800 100 Q 850 0 900 100 Q 950 200 1000 100" fill="none" stroke="white" stroke-width="40" stroke-linecap="round" filter="blur(15px)"/></svg>') repeat-x;
      background-size: 50% 100%;
      animation: cloudDrift 60s linear infinite;
      z-index: 1;
      pointer-events: none;
    }
    @keyframes cloudDrift {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .flight-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }
    .terminator-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      opacity: 0.35;
    }
    .marker::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 40px;
      height: 40px;
      background: rgba(255, 77, 106, 0.3);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: radarPulse 2s infinite;
    }
    @keyframes radarPulse {
      0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
    }
    /* Nubes locales (modo ciudad) */
    .cloud { /* ... */ }
    .rain-container { /* ... */ }
    .snow-container { /* ... */ }
  `;

  static properties = {
    lat: { type: Number },
    lon: { type: Number },
    zoom: { type: Number },
    mode: { type: String },
    cityName: { type: String },
    weatherCondition: { type: String },
    cityImage: { type: String },
  };

  constructor() {
    super();
    this.lat = 20;
    this.lon = 0;
    this.zoom = 2;
    this.mode = 'world';
    this.cityName = '';
    this.weatherCondition = '';
    this.cityImage = '';
    this.flights = [];
    this._map = null;
    this._marker = null;
    this._animationFrame = null;
    this._autoRotateInterval = null;
    this._userInteracting = false;
    this._idleTimeout = null;
    this._terminatorInterval = null;
  }

  firstUpdated() {
    this._initMap();
  }

  _initMap() {
    const mapEl = this.renderRoot.querySelector('#map');
    if (!mapEl || this._map) return;

    this._map = new MapLibre({
      container: mapEl,
      style: {
        version: 8,
        name: 'OSM Raster',
        sources: {
          osm: {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            minzoom: 0,
            maxzoom: 19,
            attribution: '© OSM'
          }
        },
        layers: [{ id: 'osm-layer', type: 'raster', source: 'osm' }]
      },
      center: [this.lon, this.lat],
      zoom: this.zoom,
      attributionControl: false
    });

    // Eventos de interacción
    this._map.on('mousedown', () => this._onUserInteractionStart());
    this._map.on('touchstart', () => this._onUserInteractionStart());
    this._map.on('wheel', () => this._onUserInteractionStart());

    // Clic en el mapa
    this._map.on('click', (e) => {
      const { lat, lng } = e.lngLat;
      this._addMarker(lat, lng);
      this.dispatchEvent(new CustomEvent('map-click', {
        detail: { lat, lon: lng },
        bubbles: true,
        composed: true,
      }));
    });

    // Iniciar animaciones (con retardo para asegurar que el DOM de canvas existe)
    this._generateFlights();
    setTimeout(() => {
      this._startFlightAnimation();
      this._startTerminatorAnimation();
    }, 200);
    this._startAutoRotate();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._map) this._map.remove();
    if (this._animationFrame) cancelAnimationFrame(this._animationFrame);
    if (this._autoRotateInterval) clearInterval(this._autoRotateInterval);
    if (this._idleTimeout) clearTimeout(this._idleTimeout);
    if (this._terminatorInterval) clearInterval(this._terminatorInterval);
  }

  updated(changedProperties) {
    if (!this._map) return;
    if (changedProperties.has('lat') || changedProperties.has('lon')) {
      this._map.setCenter([this.lon, this.lat]);
    }
  }

  // ----------- MARCADOR ------------
  _addMarker(lat, lng) {
    if (this._marker) this._marker.remove();
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.width = '16px';
    el.style.height = '16px';
    el.style.background = '#ff4d6a';
    el.style.borderRadius = '50%';
    el.style.boxShadow = '0 0 15px #ff4d6a';
    this._marker = new Marker({ element: el, anchor: 'center' })
      .setLngLat([lng, lat])
      .addTo(this._map);
  }

  // ----------- VUELOS ------------
  _generateFlights() {
    const cities = [
      { lat: 40.71, lon: -74.00 }, { lat: 51.50, lon: -0.12 }, { lat: 35.68, lon: 139.76 },
      { lat: 25.27, lon: 55.30 }, { lat: 1.35, lon: 103.81 }, { lat: -33.86, lon: 151.20 },
      { lat: 34.05, lon: -118.24 }, { lat: 48.85, lon: 2.34 }, { lat: -23.55, lon: -46.63 },
      { lat: -33.92, lon: 18.42 }, { lat: 55.75, lon: 37.61 }, { lat: 39.90, lon: 116.40 },
      { lat: 28.61, lon: 77.23 }, { lat: 19.43, lon: -99.13 }, { lat: -34.60, lon: -58.38 },
      { lat: -26.20, lon: 28.04 }, { lat: 50.11, lon: 8.68 }, { lat: 13.75, lon: 100.50 },
      { lat: 47.60, lon: -122.33 }, { lat: 37.77, lon: -122.41 }
    ];
    this.flights = [];
    for (let i = 0; i < 15; i++) {
      const from = cities[Math.floor(Math.random() * cities.length)];
      let to = cities[Math.floor(Math.random() * cities.length)];
      while (to.lat === from.lat && to.lon === from.lon) to = cities[Math.floor(Math.random() * cities.length)];
      this.flights.push({
        from, to,
        progress: Math.random(),
        speed: 0.0005 + Math.random() * 0.001,
      });
    }
  }

  _startFlightAnimation() {
    const animate = () => {
      if (!this._map) return;
      const canvas = this.renderRoot.querySelector('.flight-canvas');
      if (!canvas || !canvas.parentElement) {
        this._animationFrame = requestAnimationFrame(animate);
        return;
      }
      const ctx = canvas.getContext('2d');
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      this.flights.forEach(flight => {
        flight.progress += flight.speed;
        if (flight.progress > 1) flight.progress = 0;

        const currentLat = flight.from.lat + (flight.to.lat - flight.from.lat) * flight.progress;
        const currentLon = flight.from.lon + (flight.to.lon - flight.from.lon) * flight.progress;
        const point = this._map.project([currentLon, currentLat]);
        if (!point) return;

        // Avión
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd966';
        ctx.shadowColor = '#ff9a56';
        ctx.shadowBlur = 6;
        ctx.fill();

        // Línea de vuelo
        const fromPoint = this._map.project([flight.from.lon, flight.from.lat]);
        const toPoint = this._map.project([flight.to.lon, flight.to.lat]);
        if (fromPoint && toPoint) {
          const midX = (fromPoint.x + toPoint.x) / 2;
          const midY = Math.min(fromPoint.y, toPoint.y) - 30;
          ctx.beginPath();
          ctx.moveTo(fromPoint.x, fromPoint.y);
          ctx.quadraticCurveTo(midX, midY, toPoint.x, toPoint.y);
          ctx.strokeStyle = 'rgba(255, 217, 102, 0.2)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 8]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      this._animationFrame = requestAnimationFrame(animate);
    };
    this._animationFrame = requestAnimationFrame(animate);
  }

  // ----------- ROTACIÓN AUTOMÁTICA ------------
  _startAutoRotate() {
    this._autoRotateInterval = setInterval(() => {
      if (!this._map || this._userInteracting) return;
      const center = this._map.getCenter();
      let newLng = center.lng + 0.02;
      if (newLng > 180) newLng -= 360;
      if (newLng < -180) newLng += 360;
      this._map.setCenter([newLng, center.lat]);
    }, 50);
  }

  _onUserInteractionStart() {
    this._userInteracting = true;
    if (this._idleTimeout) clearTimeout(this._idleTimeout);
    this._idleTimeout = setTimeout(() => {
      this._userInteracting = false;
    }, 3000);
  }

  // ----------- TERMINADOR DÍA/NOCHE ------------
  _startTerminatorAnimation() {
    const updateTerminator = () => {
      if (!this._map) return;
      const canvas = this.renderRoot.querySelector('.terminator-canvas');
      if (!canvas || !canvas.parentElement) {
        setTimeout(updateTerminator, 1000);
        return;
      }
      const ctx = canvas.getContext('2d');
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = new Date();
      const hours = now.getUTCHours() + now.getUTCMinutes() / 60;
      const terminatorLon = (hours - 12) * 15;
      const termX = ((terminatorLon + 180) / 360) * canvas.width;
      ctx.fillStyle = 'rgba(0, 0, 20, 0.4)';
      ctx.fillRect(0, 0, termX, canvas.height);
      const gradient = ctx.createLinearGradient(termX - 50, 0, termX + 50, 0);
      gradient.addColorStop(0, 'rgba(0, 0, 20, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 0, 20, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(termX - 50, 0, 100, canvas.height);
    };

    setTimeout(updateTerminator, 500);
    this._terminatorInterval = setInterval(updateTerminator, 60000);
  }

  // ----------- MÉTODOS PÚBLICOS ------------
  flyTo(lat, lon, zoom = 6) {
    if (this._map) {
      this._map.flyTo({ center: [lon, lat], zoom, duration: 2000 });
      this._addMarker(lat, lon);
    }
  }

  async flyToCity(lat, lon, cityName, weatherCondition) {
    if (this._map) {
      this._map.flyTo({ center: [lon, lat], zoom: 12, duration: 2000 });
      this._addMarker(lat, lon);
    }
    this._fetchCityImage(cityName);
    setTimeout(() => {
      this.mode = 'city';
      this.cityName = cityName;
      this.weatherCondition = weatherCondition;
    }, 2000);
  }

  backToWorld() {
    this.mode = 'world';
    this.cityImage = '';
    if (this._marker) this._marker.remove();
  }

  async _fetchCityImage(cityName) {
    this.cityImage = '';
    const API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
    const query = `${cityName} city skyline`;
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    try {
      const response = await fetch(url, { headers: { 'Authorization': API_KEY } });
      if (!response.ok) throw new Error('Error en Pexels');
      const data = await response.json();
      if (data.photos && data.photos.length > 0) {
        this.cityImage = data.photos[0].src.large;
      }
    } catch (err) {
      console.warn('No se pudo obtener imagen de la ciudad');
    }
    // Forzar re-render fuera del ciclo actual
    await this.updateComplete;
    await new Promise(r => setTimeout(r, 0));
    this.requestUpdate();
  }

  render() {
    const cityBgStyle = this.cityImage ? `background-image: url('${this.cityImage}')` : '';
    return html`
      <div id="map"></div>
      <canvas class="flight-canvas"></canvas>
      <canvas class="terminator-canvas"></canvas>
      <div class="global-clouds"></div>
      <div class="city-layer ${this.mode === 'city' ? 'active' : ''}" style="${cityBgStyle}"></div>
      ${this.mode === 'city' ? this._weatherEffectTemplate() : ''}
    `;
  }

  _weatherEffectTemplate() {
    // Mantén aquí las nubes locales, lluvia y nieve como antes
    return html``;
  }
}

customElements.define('world-map', WorldMap);