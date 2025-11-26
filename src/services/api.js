export async function apiFetch(path, options = {}) {
  const base = window.__NVSP_API_BASE__ || 'http://localhost:4000';
  const token = localStorage.getItem('nvsp_token');
  const headers = Object.assign({}, options.headers || {}, {
    'Content-Type': 'application/json',
  });
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(base + path, Object.assign({}, options, { headers }));
  const text = await res.text();
  // try parse JSON, but handle non-JSON (HTML error pages) gracefully
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (parseErr) {
    // Not JSON. Keep raw text in data for debugging
    data = null;
    console.warn('apiFetch: response is not JSON for', path, 'status', res.status, 'parseErr', parseErr);
  }

  if (!res.ok) {
    // Extract server message if available, otherwise use status text or raw text
    const serverMessage = data && data.message ? data.message : res.statusText || text || `HTTP ${res.status}`;
    const error = new Error(serverMessage);
    error.status = res.status;
    error.body = data || text;
    throw error;
  }

  return data;
}
