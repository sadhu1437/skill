const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const API_BASE = import.meta.env.VITE_API_BASE_URL || (isLocalDevelopment ? 'http://127.0.0.1:8001/api' : 'https://skillbloom.ashokworld.in/api')

function clearAuth() {
  localStorage.removeItem('skillbloom_access_token')
  localStorage.removeItem('skillbloom_refresh_token')
}

function formatApiError(data, fallback) {
  if (!data) return fallback
  if (typeof data === 'string') return data
  if (Array.isArray(data)) return data.map((item) => formatApiError(item, '')).filter(Boolean).join(' ')
  if (typeof data === 'object') {
    return Object.entries(data).map(([field, value]) => {
      const message = formatApiError(value, '')
      return message ? `${field}: ${message}` : ''
    }).filter(Boolean).join(' ')
  }
  return String(data)
}

async function refreshAccessToken() {
  const refresh = localStorage.getItem('skillbloom_refresh_token')
  if (!refresh) return null
  const response = await fetch(`${API_BASE}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.access) {
    clearAuth()
    return null
  }
  localStorage.setItem('skillbloom_access_token', data.access)
  if (data.refresh) localStorage.setItem('skillbloom_refresh_token', data.refresh)
  return data.access
}

export async function fetchJson(url) {
  const response = await fetch(`${API_BASE}${url}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response.json();
}

export async function requestJson(url, options = {}) {
  const isAuthRequest = url === '/auth/login/' || url === '/auth/token/refresh/'
  const token = isAuthRequest ? null : localStorage.getItem('skillbloom_access_token')
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`

  let response = await fetch(`${API_BASE}${url}`, { ...options, headers })
  if (response.status === 401 && !isAuthRequest) {
    const refreshedToken = await refreshAccessToken()
    if (refreshedToken) {
      response = await fetch(`${API_BASE}${url}`, { ...options, headers: { ...headers, Authorization: `Bearer ${refreshedToken}` } })
    }
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 401) clearAuth()
    const message = formatApiError(data.detail || data, `Request failed: ${response.status}`)
    throw new Error(message)
  }
  return data
}

export async function uploadFile(url, formData, method = 'POST') {
  let token = localStorage.getItem('skillbloom_access_token')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  let response = await fetch(`${API_BASE}${url}`, { method, headers, body: formData })
  if (response.status === 401) {
    token = await refreshAccessToken()
    if (token) response = await fetch(`${API_BASE}${url}`, { method, headers: { Authorization: `Bearer ${token}` }, body: formData })
  }
  const data = await response.json().catch(() => ({}))
  if (response.status === 401) clearAuth()
  if (!response.ok) throw new Error(formatApiError(data, `Upload failed: ${response.status}`))
  return data
}
