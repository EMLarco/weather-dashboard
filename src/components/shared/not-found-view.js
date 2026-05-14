import { LitElement, html } from 'lit';

class NotFoundView extends LitElement {
  render() {
    return html`<main><h1>404 - Página no encontrada</h1></main>`;
  }
}

customElements.define('not-found-view', NotFoundView);