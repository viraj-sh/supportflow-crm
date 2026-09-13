export function getApiBaseUrl() {

  const envBaseUrl = import.meta.env.BASE_URL_CUSTOM || import.meta.env.BASE_URL;

  let baseUrl = '';
  if (typeof window !== 'undefined') {
  }


  const configured = import.meta.env.VITE_BASE_URL || window.__ENV_BASE_URL__;
  if (configured) {
    baseUrl = configured;
  } else {
    // Fallback to browser origin
    baseUrl = window.location.origin;
  }

  // no trailing slash
  baseUrl = baseUrl.replace(/\/+$/, '');

  // append /api
  if (!baseUrl.endsWith('/api')) {
    baseUrl += '/api';
  }

  return baseUrl;
}
