let currentRouteHandler = null;

export function initRouter(onRouteChange) {
  currentRouteHandler = onRouteChange;

  window.addEventListener('popstate', () => {
    handleRoute();
  });

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-link]');
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('href');
      navigateTo(href);
    }
  });

  // Initial route
  handleRoute();
}

export function navigateTo(url) {
  window.history.pushState({}, '', url);
  handleRoute();
}

function handleRoute() {
  const path = window.location.pathname;
  if (currentRouteHandler) {
    currentRouteHandler(path);
  }
}

export function getRouteParams(path) {
  if (path === '/tickets/new') {
    return { name: 'ticket-create' };
  }

  // match /tickets/:ticket_id
  const ticketDetailMatch = path.match(/^\/tickets\/([^/]+)$/);
  if (ticketDetailMatch) {
    return { name: 'ticket-detail', ticketId: decodeURIComponent(ticketDetailMatch[1]) };
  }

  if (path === '/' || path === '') {
    return { name: 'dashboard' };
  }

  return { name: 'not-found' };
}
