// src/components/app/app-header.js
import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import { appState } from '../../store/app-state.js';
import { logout } from '../../services/auth-service.js';

class AppHeader extends LitElement {
  static styles = css`
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 2rem;
      background: rgba(10, 20, 30, 0.75);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 2000;
      position: relative;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-img {
      height: 36px;
      width: auto;
      filter: drop-shadow(0 0 6px rgba(255, 154, 86, 0.45));
    }

    .brand h1 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 700;
      background: linear-gradient(135deg, #ff9a56, #ff4d6a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .greeting {
      font-size: 0.9rem;
      opacity: 0.8;
      margin-left: 1rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .nav-links {
      display: flex;
      gap: 1rem;
    }

    .nav-links a {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      transition: color 0.2s;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
    }

    .nav-links a:hover {
      color: #ff9a56;
      background: rgba(255, 255, 255, 0.08);
    }

    .user-menu {
      position: relative;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 30px;
      padding: 0.35rem 0.8rem;
      cursor: pointer;
      color: #fff;
      font-size: 0.9rem;
      transition: background 0.2s;
    }

    .user-button:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ff9a56, #ff4d6a);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.8rem;
    }

    .dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: rgba(20, 30, 40, 0.95);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 0.5rem;
      min-width: 180px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      display: none;
      flex-direction: column;
      gap: 0.25rem;
    }

    .dropdown.open {
      display: flex;
    }

    .dropdown button {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.85);
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      text-align: left;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.2s;
    }

    .dropdown button:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ff9a56;
    }

    .logout-btn {
      color: #ff4d6a !important;
    }

    @media (max-width: 600px) {
      header {
        padding: 0.75rem 1rem;
        flex-wrap: wrap;
      }
      .greeting {
        display: none;
      }
      .nav-links {
        display: none;
      }
    }
  `;

  static properties = {
    user: { type: Object, state: true },
    dropdownOpen: { type: Boolean },
    greeting: { type: String },
  };

  constructor() {
    super();
    this.user = null;
    this.dropdownOpen = false;
    this.greeting = this._getGreeting();
    this._closeDropdown = this._closeDropdown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this._unsubscribe = appState.subscribe((user) => {
      this.user = user;
    });
    document.addEventListener('click', this._closeDropdown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribe) this._unsubscribe();
    document.removeEventListener('click', this._closeDropdown);
  }

  _getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  _closeDropdown(e) {
    if (!e.composedPath().includes(this)) {
      this.dropdownOpen = false;
    }
  }

  _toggleDropdown(e) {
    e.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  _navigate(e) {
    e.preventDefault();
    Router.go(e.target.getAttribute('href'));
    this.dropdownOpen = false;
  }

  _handleLogout() {
    logout();
    this.dropdownOpen = false;
    Router.go('/');
  }

  render() {
    return html`
      <header>
        <div class="brand">
          <img class="logo-img" src="/logo.png" alt="Logo" />
          <h1>Weather Newsroom</h1>
          ${this.user
            ? html`<span class="greeting">${this.greeting}, ${this.user.username}</span>`
            : ''}
        </div>

        <div class="user-section">
          ${this.user
            ? html`
                <div class="nav-links">
     
            
                </div>
                <div class="user-menu">
                  <button class="user-button" @click=${this._toggleDropdown}>
                    <div class="avatar">${this.user.username.charAt(0).toUpperCase()}</div>
                    <span>${this.user.username}</span>
                  </button>
                  <div class="dropdown ${this.dropdownOpen ? 'open' : ''}">
                    <button @click=${this._navigate} href="/dashboard">🗺️ Dashboard</button>
                    <button @click=${this._handleLogout} class="logout-btn">🚪 Cerrar Sesión</button>
                  </div>
                </div>
              `
            : html`
                <a href="/" @click=${this._navigate} class="user-button">Iniciar Sesión</a>
              `}
        </div>
      </header>
    `;
  }
}

customElements.define('app-header', AppHeader);
