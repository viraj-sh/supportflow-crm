import { getApiBaseUrl } from '../utils/config.js';

let isBackendHealthy = true;
let healthCheckListeners = [];

export function subscribeHealth(listener) {
  healthCheckListeners.push(listener);
  return () => {
    healthCheckListeners = healthCheckListeners.filter(l => l !== listener);
  };
}

function notifyHealth(status) {
  isBackendHealthy = status;
  healthCheckListeners.forEach(l => l(status));
}

export async function checkHealth() {
  const baseUrl = getApiBaseUrl();
  // Strip /api if present to check root /api/health correctly
  const rootUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
  try {
    const response = await fetch(`${rootUrl}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) {
      notifyHealth(false);
      return false;
    }
    const data = await response.json();
    const healthy = data && data.status === 'healthy';
    notifyHealth(healthy);
    return healthy;
  } catch {
    notifyHealth(false);
    return false;
  }
}

async function request(endpoint, options = {}) {
  // Perform health check first (except for health check itself)
  if (!endpoint.includes('/health')) {
    const healthy = await checkHealth();
    if (!healthy) {
      throw new Error('BACKEND_UNAVAILABLE');
    }
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.detail || data.message || `HTTP error ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.message === 'BACKEND_UNAVAILABLE') {
      throw error;
    }
    // Check if network error
    if (error.name === 'TypeError' || error.name === 'AbortError') {
      notifyHealth(false);
      const err = new Error('BACKEND_UNAVAILABLE');
      throw err;
    }
    throw error;
  }
}

export async function getTickets(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.priority) query.append('priority', params.priority);
  if (params.search) query.append('search', params.search);
  if (params.limit !== undefined) query.append('limit', params.limit);
  else query.append('limit', 20);
  if (params.offset !== undefined) query.append('offset', params.offset);

  const queryString = query.toString();
  const endpoint = `/tickets${queryString ? `?${queryString}` : ''}`;
  return request(endpoint);
}

export async function getTicketStats() {
  return request('/tickets/stats');
}

export async function getTicket(ticketId) {
  return request(`/tickets/${encodeURIComponent(ticketId)}`);
}

export async function createTicket(ticketData) {
  return request('/tickets', {
    method: 'POST',
    body: JSON.stringify(ticketData),
  });
}

export async function updateTicket(ticketId, status, noteText) {
  const query = new URLSearchParams();
  if (status) query.append('status', status);
  const endpoint = `/tickets/${encodeURIComponent(ticketId)}?${query.toString()}`;
  return request(endpoint, {
    method: 'PUT',
    body: JSON.stringify({ note_text: noteText }),
  });
}
