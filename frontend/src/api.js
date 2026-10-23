// appels a l'API Strapi

// adresse par defaut (fichier .env), modifiable dans l'app depuis l'ecran de login
let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:1337'
let token = null

export function setApiUrl(url) {
  apiUrl = url.replace(/\/$/, '')
}

export function getApiUrl() {
  return apiUrl
}

export function setToken(newToken) {
  token = newToken
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers.Authorization = 'Bearer ' + token
  }

  let res
  try {
    res = await fetch(apiUrl + '/api' + path, { ...options, headers })
  } catch (e) {
    throw new Error('Impossible de joindre le serveur')
  }

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(json.error ? json.error.message : 'Erreur ' + res.status)
    error.status = res.status
    throw error
  }
  return json
}

export default {
  login(email, password) {
    return request('/auth/local', {
      method: 'POST',
      body: JSON.stringify({ identifier: email, password }),
    })
  },
  me() {
    return request('/me')
  },
  getTags() {
    return request('/tags?sort=order:asc')
  },
  getTodayMood() {
    return request('/moods/today')
  },
  saveTodayMood(score, tags) {
    return request('/moods/today', {
      method: 'PUT',
      body: JSON.stringify({ data: { score, tags } }),
    })
  },
  getHistory(days = 7) {
    return request('/moods/history?days=' + days)
  },
  getTeamStats(days = 30) {
    return request('/moods/team-stats?days=' + days)
  },
}
