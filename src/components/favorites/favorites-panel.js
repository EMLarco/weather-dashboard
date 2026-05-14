import { LitElement, html, css } from 'lit';
import { getFavorites, removeFavorite } from '../../services/favorites-service.js';
import './favorite-item.js';

class FavoritesPanel extends LitElement {
 static styles = css`
  .panel {
    background: none;
    padding: 0;
    color: inherit;
  }
  h3 { margin-top: 0; color: #fff; }
`;

  static properties = {
    favorites: { type: Array },
    loading: { type: Boolean },
  };

  constructor() {
    super();
    this.favorites = [];
    this.loading = true;
    this._boundRefresh = this._refreshIfDashboard.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this._load();
    window.addEventListener('vaadin-router-location-changed', this._boundRefresh);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('vaadin-router-location-changed', this._boundRefresh);
  }

  _refreshIfDashboard(e) {
    if (e.detail.location.pathname === '/dashboard') {
      this._load();
    }
  }

  async _load() {
    this.loading = true;
    try {
      this.favorites = await getFavorites();
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  async _handleRemove(e) {
    const id = e.detail.id;
    try {
      await removeFavorite(id);
      // Recargar la lista completa desde el backend
      this.favorites = await getFavorites();
    } catch (error) {
      console.error('Error al eliminar favorito', error);
    }
  }

  render() {
    if (this.loading) return html`<p>Cargando favoritos...</p>`;
    return html`
      <div class="panel">
        <h3>⭐ Ciudades favoritas</h3>
        ${this.favorites.length === 0
          ? html`<p>No tienes favoritos aún.</p>`
          : this.favorites.map(fav => html`<favorite-item .favorite=${fav} @remove-favorite=${this._handleRemove}></favorite-item>`)
        }
      </div>
    `;
  }
}

customElements.define('favorites-panel', FavoritesPanel);