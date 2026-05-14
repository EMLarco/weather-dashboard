import { LitElement, html, css } from 'lit';

class HistoryItem extends LitElement {
  static styles = css`
    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }
    .name {
      cursor: pointer;
      color: #ffd966;
      font-weight: bold;
    }
    .date {
      color: rgba(255,255,255,0.6);
      font-size: 0.8rem;
    }
  `;

  static properties = {
    item: { type: Object },
  };

  render() {
    const date = new Date(this.item.searched_at).toLocaleString();
    return html`
      <div class="item">
        <span class="name" @click=${this._navigate}>${this.item.city_name}</span>
        <span class="date">${date}</span>
      </div>
    `;
  }

  _navigate() {
    this.dispatchEvent(new CustomEvent('search-city', {
      detail: {
        cityName: this.item.city_name,
        lat: this.item.latitude,
        lon: this.item.longitude,
      },
      bubbles: true,
      composed: true,
    }));
  }
}

customElements.define('history-item', HistoryItem);