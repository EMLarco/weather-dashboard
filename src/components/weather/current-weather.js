import { LitElement, html, css } from 'lit';

class CurrentWeather extends LitElement {
  static styles = css`
    .card {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      text-align: center;
    }
    .city {
      font-size: 2rem;
      margin: 0;
      color: #2c3e50;
    }
    .temp {
      font-size: 3rem;
      margin: 0.5rem 0;
      color: #e67e22;
    }
    .description {
      text-transform: capitalize;
      font-size: 1.2rem;
      color: #7f8c8d;
    }
    .details {
      display: flex;
      justify-content: space-around;
      margin-top: 1rem;
      color: #2c3e50;
    }
  `;

  static properties = {
    weather: { type: Object },
  };

  render() {
    if (!this.weather) return html`<p>Cargando...</p>`;
    const { name, main, weather: weatherArr, wind } = this.weather;
    return html`
      <div class="card">
        <h2 class="city">${name}</h2>
        <div class="temp">${Math.round(main.temp)}°C</div>
        <div class="description">${weatherArr[0].description}</div>
        <div class="details">
          <span>💧 ${main.humidity}%</span>
          <span>💨 ${wind.speed} m/s</span>
        </div>
      </div>
    `;
  }
}

customElements.define('current-weather', CurrentWeather);