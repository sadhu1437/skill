import { fetchJson } from '../api/client'

const SETTINGS_CACHE_MS = 30_000
const listeners = new Set()
let cachedSettings
let cachedAt = 0
let settingsRequest

export function loadAdSettings() {
  if (cachedSettings && Date.now() - cachedAt < SETTINGS_CACHE_MS) {
    return Promise.resolve(cachedSettings)
  }
  if (!settingsRequest) {
    settingsRequest = fetchJson('/core/adsense/')
      .then((settings) => {
        cachedSettings = settings
        cachedAt = Date.now()
        return settings
      })
      .finally(() => {
        settingsRequest = null
      })
  }
  return settingsRequest
}

export function updateAdSettings(settings) {
  cachedSettings = settings
  cachedAt = Date.now()
  listeners.forEach((listener) => listener(settings))
}

export function subscribeToAdSettings(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
