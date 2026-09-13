import './style.css';
import { initRouter, getRouteParams } from './utils/router.js';
import { renderNavbar } from './components/navbar.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderCreateTicket } from './pages/create-ticket.js';
import { renderTicketDetails } from './pages/ticket-details.js';
import { subscribeHealth, checkHealth } from './api/api.js';
import { renderBackendUnavailableState } from './components/states.js';

const appContainer = document.querySelector('#app');

let isHealthy = true;

// Subscribe to backend health changes
subscribeHealth((healthy) => {
  if (isHealthy !== healthy) {
    isHealthy = healthy;
    renderCurrentAppView(window.location.pathname);
  }
});

async function boot() {
  // Perform initial health check before rendering
  const healthy = await checkHealth();
  isHealthy = healthy;

  initRouter((path) => {
    renderCurrentAppView(path);
  });
}

async function renderCurrentAppView(path) {
  appContainer.innerHTML = '';

  if (!isHealthy) {
    // Render backend unavailable state across the app
    appContainer.appendChild(renderBackendUnavailableState(async () => {
      const healthy = await checkHealth();
      if (healthy) {
        isHealthy = true;
        renderCurrentAppView(window.location.pathname);
      }
    }));
    return;
  }

  // Render Navbar
  const navbar = renderNavbar(path);
  appContainer.appendChild(navbar);

  // Main content wrapper
  const mainContent = document.createElement('main');
  mainContent.className = 'flex-1 flex flex-col';
  appContainer.appendChild(mainContent);

  const route = getRouteParams(path);

  try {
    if (route.name === 'dashboard') {
      await renderDashboard(mainContent);
    } else if (route.name === 'ticket-create') {
      await renderCreateTicket(mainContent);
    } else if (route.name === 'ticket-detail') {
      await renderTicketDetails(mainContent, route.ticketId);
    } else {
      mainContent.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
          <p class="text-sm text-gray-500 mb-6">The page you are looking for does not exist.</p>
          <a href="/" data-link class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800">
            Go to Dashboard
          </a>
        </div>
      `;
    }
  } catch (err) {
    if (err.message === 'BACKEND_UNAVAILABLE') {
      isHealthy = false;
      renderCurrentAppView(path);
    } else {
      mainContent.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 class="text-xl font-semibold text-gray-900 mb-2">An error occurred</h2>
          <p class="text-sm text-rose-600 mb-6">${err.message || 'Unexpected application error.'}</p>
          <a href="/" data-link class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800">
            Go to Dashboard
          </a>
        </div>
      `;
    }
  }
}

boot();
