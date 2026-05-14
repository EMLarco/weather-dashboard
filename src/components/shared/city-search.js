import { LitElement, html, css } from 'lit';
import { getCoordinatesByCityName } from '../../services/weather-service.js';

class CitySearch extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    .search-container {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    input {
      flex: 1;
      padding: 0.6rem 0.8rem;
      font-size: 1rem;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 10px;
      background: rgba(20, 30, 40, 0.7);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: white;
      outline: none;
    }
    input::placeholder {
      color: rgba(255,255,255,0.5);
    }
    button {
      padding: 0.6rem 1rem;
      background: linear-gradient(135deg, #ff9a56, #ff4d6a);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: bold;
      transition: transform 0.2s;
    }
    button:hover {
      transform: scale(1.05);
    }
    .suggestions {
      list-style: none;
      padding: 0;
      margin: 0;
      background: rgba(20, 30, 40, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 12px;
      max-height: 200px;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .suggestions::-webkit-scrollbar {
      width: 4px;
    }
    .suggestions::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.05);
      border-radius: 3px;
    }
    .suggestions::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.2);
      border-radius: 3px;
    }
    .suggestions li {
      padding: 0.7rem 1rem;
      cursor: pointer;
      color: #ffffff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      transition: background 0.2s;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .suggestions li:last-child {
      border-bottom: none;
    }
    .suggestions li:hover {
      background: rgba(255,255,255,0.15);
    }
  `;

  static properties = {
    query: { type: String },
    suggestions: { type: Array },
  };

  constructor() {
    super();
    this.query = '';
    this.suggestions = [];
  }

  render() {
    return html`
      <div class="search-container">
        <input
          type="text"
          placeholder="Buscar ciudad..."
          .value=${this.query}
          @input=${this._handleInput}
          @keydown=${this._handleKeydown}
        />
        <button @click=${this._search}>Buscar</button>
      </div>
      ${this.suggestions.length > 0
        ? html`
            <ul class="suggestions">
              ${this.suggestions.map(
                (city) =>
                  html`<li @click=${() => this._selectCity(city)}>
                    ${city.name}, ${city.country}
                  </li>`
              )}
            </ul>
          `
        : ''}
    `;
  }

  async _handleInput(e) {
    this.query = e.target.value;
    if (this.query.length < 3) {
      this.suggestions = [];
      return;
    }
    try {
      const cities = await getCoordinatesByCityName(this.query);
      this.suggestions = Array.isArray(cities) ? cities : [];
    } catch {
      this.suggestions = [];
    }
  }

  _handleKeydown(e) {
    if (e.key === 'Enter') {
      this._search();
    }
  }

  async _search() {
    if (!this.query.trim()) return;
    try {
      const city = await getCoordinatesByCityName(this.query.trim());
      if (city && Array.isArray(city) && city.length > 0) {
        // Emitir evento en lugar de navegar
        this.dispatchEvent(new CustomEvent('city-selected', {
          detail: { city: city[0] },
          bubbles: true,
          composed: true,
        }));
        // Limpiar
        this.query = '';
        this.suggestions = [];
      }
    } catch (error) {
      alert(error.message);
    }
  }

  _selectCity(city) {
    // Emitir evento con la ciudad seleccionada
    this.dispatchEvent(new CustomEvent('city-selected', {
      detail: { city },
      bubbles: true,
      composed: true,
    }));
    // Limpiar
    this.query = '';
    this.suggestions = [];
  }
}

customElements.define('city-search', CitySearch);