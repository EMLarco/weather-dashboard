import { LitElement, html, css } from 'lit';
import { getHistory } from '../../services/history-service.js';
import './history-item.js';

class SearchHistoryPanel extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: inherit;
    }
    h3 {
      margin-top: 0;
      color: #ffffff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      margin-bottom: 1rem;
    }
    .history-list {
      display: flex;
      flex-direction: column;
    }
  `;

  static properties = {
    history: { type: Array },
    loading: { type: Boolean },
  };

  constructor() {
    super();
    this.history = [];
    this.loading = true;
  }

  connectedCallback() {
    super.connectedCallback();
    this._load();
    window.addEventListener('vaadin-router-location-changed', this._refreshIfDashboard);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('vaadin-router-location-changed', this._refreshIfDashboard);
  }

  _refreshIfDashboard = (e) => {
    if (e.detail.location.pathname === '/dashboard') {
      this._load();
    }
  };

  async _load() {
    this.loading = true;
    try {
      this.history = await getHistory();
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  render() {
    if (this.loading) return html`<p>Cargando historial...</p>`;
    return html`
      <h3>🕒 Últimas búsquedas</h3>
      <div class="history-list">
        ${this.history.length === 0
          ? html`<p>No hay búsquedas recientes.</p>`
          : this.history.map(item => html`<history-item .item=${item}></history-item>`)
        }
      </div>
    `;
  }
}

customElements.define('search-history-panel', SearchHistoryPanel);