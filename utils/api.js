const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function apiRequest(endpoint, method = 'GET', data = null, customHeaders = {}) {
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
    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const json = await res.json();
    return json;
  } catch (err) {
    console.error(`[API Call Error]: ${endpoint}`, err);
    return { success: false, message: err.message || 'Network error occurred' };
  }
}
