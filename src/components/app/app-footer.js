import { LitElement, html, css } from 'lit';

class AppFooter extends LitElement {
  static styles = css`
    footer {
      background: rgba(20, 30, 40, 0.7);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.8);
      text-align: center;
      padding: 0.8rem 1rem;
      font-size: 0.85rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 2rem;
      flex-wrap: wrap;
    }
    a {
      color: #ff9a56;
      text-decoration: none;
      transition: color 0.2s;
    }
    a:hover {
      color: #ff4d6a;
    }
    .attribution {
      display: flex;
      gap: 1.5rem;
    }
  `;

  render() {
    return html`
      <footer>
        <span>© 2026 Weather Dashboard</span>
        <div class="attribution">
          <span>Fotos por <a href="https://pexels.com" target="_blank" rel="noopener">Pexels</a></span>
          <span>Mapa: <a href="https://openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a></span>
        </div>
      </footer>
    `;
  }
}

customElements.define('app-footer', AppFooter);