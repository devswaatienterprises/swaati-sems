export function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  // In production browser environments (Vercel, custom domain), fallback to production backend API URL
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return 'https://api.swaatienterprises.com/api/v1';
    }
  }
  return 'http://localhost:4000/api/v1';
}

export async function apiRequest(endpoint, method = 'GET', data = null, customHeaders = {}) {
  const baseUrl = getApiBaseUrl();
  const token = typeof window !== 'undefined' ? localStorage.getItem('crm_token') : null;

  const headers = {
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
    credentials: 'include',
  };

  if (data) {
    if (data instanceof FormData) {
      // Browser automatically sets multipart/form-data with boundary
      options.body = data;
    } else if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
  }

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, options);
    const json = await res.json();
    return json;
  } catch (err) {
    console.error(`[API Call Error]: ${endpoint}`, err);
    return { success: false, message: err.message || 'Network error occurred' };
  }
}
