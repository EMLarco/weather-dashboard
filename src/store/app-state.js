class AppState {
  constructor() {
    if (AppState.instance) return AppState.instance;
    this._user = null;
    this._listeners = [];
    AppState.instance = this;
  }

  get user() {
    return this._user;
  }

  set user(newUser) {
    this._user = newUser;
    this._emit('user-changed', newUser);
  }

  isLoggedIn() {
    return !!this._user;
  }

  // Método para suscribirse a cambios (para componentes)
  subscribe(callback) {
    this._listeners.push(callback);
    // Llamada inicial con el valor actual
    callback(this._user);
  }

  _emit(event, data) {
    // Emitir un CustomEvent en el document para que otros componentes escuchen
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
    // También llamamos a los listeners directos (por si acaso)
    this._listeners.forEach(cb => cb(data));
  }
}

export const appState = new AppState();