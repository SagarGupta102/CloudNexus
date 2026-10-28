const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('cloudnexus_token')
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.success === false) throw new Error(data.message || 'Request failed.')
  return data
}

export function saveSession(data) {
  localStorage.setItem('cloudnexus_token', data.token)
  localStorage.setItem('cloudnexus_user', JSON.stringify(data.user))
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem('cloudnexus_user') || 'null')
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem('cloudnexus_token')
  localStorage.removeItem('cloudnexus_user')
}
