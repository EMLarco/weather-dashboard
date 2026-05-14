import { LitElement, html, css } from 'lit';

class FavoriteItem extends LitElement {
  static styles = css`
    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      border-bottom: 1px solid #eee;
    }
    .name {
      font-weight: bold;
    }
    button {
      background: none;
      border: none;
      color: red;
      cursor: pointer;
    }
  `;

  static properties = {
    favorite: { type: Object },
  };

  render() {
    return html`
      <div class="item">
        <span class="name">${this.favorite.city_name}</span>
        <button @click=${this._remove}>×</button>
      </div>
    `;
  }

  _remove() {
    this.dispatchEvent(new CustomEvent('remove-favorite', {
      detail: { id: this.favorite.id },
      bubbles: true,
      composed: true,
    }));
  }
}

customElements.define('favorite-item', FavoriteItem);