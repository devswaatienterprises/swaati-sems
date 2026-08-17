const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function apiRequest(endpoint, method = 'GET', data = null, customHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const options = {
    method,
    headers,
    credentials: 'include',
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn(`[API Call Fallback to local state]: ${endpoint}`, err);
    return null;
  }
}
