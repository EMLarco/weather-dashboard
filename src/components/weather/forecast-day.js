import { LitElement, html, css } from 'lit';

class ForecastDay extends LitElement {
  static styles = css`
    .day {
      background: rgba(255,255,255,0.8);
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      min-width: 100px;
    }
    .date {
      font-weight: bold;
      color: #2c3e50;
    }
    .temp {
      font-size: 1.5rem;
      margin: 0.5rem 0;
      color: #e67e22;
    }
  `;

  static properties = {
    day: { type: Object },
  };

  render() {
    const { dt_txt, main, weather } = this.day;
    const date = new Date(dt_txt).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    return html`
      <div class="day">
        <div class="date">${date}</div>
        <div class="temp">${Math.round(main.temp)}°C</div>
        <div>${weather[0].description}</div>
      </div>
    `;
  }
}

customElements.define('forecast-day', ForecastDay);