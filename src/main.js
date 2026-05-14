import { Router } from '@vaadin/router';
import { routes } from './routes.js';

// Importar componentes globales para registrarlos como custom elements
import './components/app/app-header.js';
import './components/app/app-footer.js';

const outlet = document.getElementById('outlet');
const router = new Router(outlet);
router.setRoutes(routes);