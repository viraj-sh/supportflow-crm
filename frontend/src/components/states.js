export function renderBackendUnavailableState(onRetry) {
  const container = document.createElement('div');
  container.className = 'min-h-[80vh] flex items-center justify-center px-4 py-12';
  container.innerHTML = `
    <div class="max-w-md w-full bg-white border border-slate-200 rounded-lg p-8 text-center shadow-sm">
      <div class="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 font-bold text-lg">!</div>
      <h2 class="text-base font-semibold text-slate-900 mb-1">Backend Unavailable</h2>
      <p class="text-xs text-slate-500 mb-6 leading-relaxed">
        SupportFlow CRM cannot connect to the backend server. Please verify the service is running and try again.
      </p>
      <button id="retry-btn" class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors">
        Retry Connection
      </button>
    </div>
  `;

  container.querySelector('#retry-btn').addEventListener('click', async () => {
    const btn = container.querySelector('#retry-btn');
    btn.disabled = true;
    btn.textContent = 'Connecting...';
    if (onRetry) {
      await onRetry();
    }
  });

  return container;
}

export function renderLoadingState(message = 'Loading...') {
  const container = document.createElement('div');
  container.className = 'py-16 flex flex-col items-center justify-center text-slate-500 text-xs';
  container.innerHTML = `
    <div class="inline-block animate-spin rounded-full h-5 w-5 border-2 border-slate-200 border-t-slate-900 mb-2.5"></div>
    <p>${message}</p>
  `;
  return container;
}

export function renderErrorState(message = 'Unable to load data.', onRetry) {
  const container = document.createElement('div');
  container.className = 'py-12 flex flex-col items-center justify-center text-center px-4';
  container.innerHTML = `
    <p class="text-xs text-rose-600 mb-3">${message}</p>
    ${onRetry ? '<button id="error-retry-btn" class="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm">Try again</button>' : ''}
  `;
  if (onRetry && container.querySelector('#error-retry-btn')) {
    container.querySelector('#error-retry-btn').addEventListener('click', onRetry);
  }
  return container;
}

export function renderEmptyState(title = 'No tickets found.', description = 'Get started by creating a new support ticket.', actionText = 'Create Ticket', onAction) {
  const container = document.createElement('div');
  container.className = 'py-16 flex flex-col items-center justify-center text-center px-4 border border-dashed border-slate-200 rounded-lg bg-white my-6';
  container.innerHTML = `
    <h3 class="text-xs font-medium text-slate-900 mb-1">${title}</h3>
    <p class="text-xs text-slate-500 mb-4 max-w-sm">${description}</p>
    ${onAction && actionText ? `<button id="empty-action-btn" class="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors">${actionText}</button>` : ''}
  `;
  if (onAction && container.querySelector('#empty-action-btn')) {
    container.querySelector('#empty-action-btn').addEventListener('click', onAction);
  }
  return container;
}
