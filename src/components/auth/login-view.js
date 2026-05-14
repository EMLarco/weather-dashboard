import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import { login } from '../../services/auth-service.js';

class LoginView extends LitElement {
  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
      overflow: hidden;
    }
    .login-card {
      background: rgba(20, 30, 40, 0.8);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 24px;
      padding: 3rem 2.5rem;
      width: 380px;
      box-shadow: 0 30px 50px rgba(0,0,0,0.6);
      color: white;
      text-align: center;
      animation: floatIn 0.8s ease-out;
    }
    @keyframes floatIn {
      0% { transform: translateY(40px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    .logo {
      display: block;
      height: 60px;
      width: auto;
      max-width: 100%;
      margin: 0 auto 1rem;
      object-fit: contain;
      filter: drop-shadow(0 0 10px rgba(255,154,86,0.5));
    }
    h1 {
      margin: 0 0 2rem;
      font-weight: 300;
      font-size: 2rem;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .input-group {
      margin-bottom: 1.5rem;
      text-align: left;
    }
    label {
      display: block;
      margin-bottom: 0.4rem;
      font-size: 0.9rem;
      color: rgba(255,255,255,0.7);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    input {
      width: 100%;
      padding: 0.9rem 1rem;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 12px;
      color: white;
      font-size: 1rem;
      outline: none;
      transition: all 0.3s;
      box-sizing: border-box;
    }
    input:focus {
      border-color: #ff9a56;
      box-shadow: 0 0 15px rgba(255,154,86,0.2);
      background: rgba(255,255,255,0.12);
    }
    button {
      width: 100%;
      padding: 0.9rem;
      background: linear-gradient(135deg, #ff9a56, #ff4d6a);
      border: none;
      border-radius: 12px;
      color: white;
      font-weight: bold;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      margin-top: 1rem;
    }
    button:hover {
      transform: scale(1.02);
      box-shadow: 0 10px 20px rgba(255,77,106,0.4);
    }
    .error {
      color: #ff4d6a;
      margin-top: 0.8rem;
      font-size: 0.9rem;
    }
    a {
      color: #ffd966;
      text-decoration: none;
      font-size: 0.9rem;
      margin-top: 1.5rem;
      display: inline-block;
      transition: color 0.2s;
    }
    a:hover {
      color: #ff9a56;
    }
    .footer-text {
      margin-top: 2rem;
      font-size: 0.8rem;
      opacity: 0.5;
    }
  `;

  static properties = {
    error: { type: String },
  };

  constructor() {
    super();
    this.error = '';
  }

  render() {
    return html`
      <div class="login-card">
        <img class="logo" src="/logo.png" alt="Logo" />
        <h1>Weather Center</h1>
        <form @submit=${this._handleSubmit}>
          <div class="input-group">
            <label for="email">Correo electrónico</label>
            <input type="email" id="email" name="email" required autocomplete="email" />
          </div>
          <div class="input-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" name="password" required minlength="4" autocomplete="current-password" />
          </div>
          <button type="submit">Iniciar Sesión</button>
          ${this.error ? html`<p class="error">${this.error}</p>` : ''}
        </form>
        <a href="/register" @click=${this._navigate}>¿No tienes cuenta? Regístrate</a>
        <div class="footer-text">Weather Dashboard © 2026</div>
      </div>
    `;
  }

  async _handleSubmit(e) {
    e.preventDefault();
    this.error = '';
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
      await login(email, password);
      Router.go('/dashboard');
    } catch (err) {
      this.error = err.message;
    }
  }

  _navigate(e) {
    e.preventDefault();
    Router.go(e.target.getAttribute('href'));
  }
}

customElements.define('login-view', LoginView);
