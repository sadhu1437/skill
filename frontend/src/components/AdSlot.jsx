import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { fetchJson } from '../api/client'

let cachedSettings
let settingsRequest
let adsenseScriptRequest

function loadAdSettings() {
  if (cachedSettings) return Promise.resolve(cachedSettings)
  if (!settingsRequest) {
    settingsRequest = fetchJson('/core/adsense/').then((settings) => {
      cachedSettings = settings
      return settings
    }).finally(() => {
      settingsRequest = null
    })
  }
  return settingsRequest
}

function loadAdsenseScript(publisherId) {
  if (window.adsbygoogle?.loaded) return Promise.resolve()
  if (adsenseScriptRequest) return adsenseScriptRequest

  adsenseScriptRequest = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`
    script.crossOrigin = 'anonymous'
    script.dataset.skillbloomAdsense = 'true'
    script.onload = resolve
    script.onerror = () => reject(new Error('Google AdSense could not be loaded.'))
    document.head.appendChild(script)
  }).catch((error) => {
    adsenseScriptRequest = null
    throw error
  })

  return adsenseScriptRequest
}

export default function AdSlot({ slot = 'job_slot', className = '' }) {
  const [settings, setSettings] = useState(null)
  const adRef = useRef(null)
  const { pathname, search } = useLocation()
  const isAdminRoute = pathname.startsWith('/admin-panel')
    || (pathname === '/login' && new URLSearchParams(search).get('next')?.startsWith('/admin-panel'))

  useEffect(() => {
    if (isAdminRoute) return
    let cancelled = false
    loadAdSettings()
      .then((data) => { if (!cancelled) setSettings(data) })
      .catch((error) => console.error('Ad settings could not be loaded.', error))
    return () => { cancelled = true }
  }, [isAdminRoute])

  useEffect(() => {
    if (isAdminRoute || !settings?.enabled || !settings.publisher_id || !settings[slot] || !adRef.current) return
    let cancelled = false
    loadAdsenseScript(settings.publisher_id)
      .then(() => {
        const ad = adRef.current
        if (cancelled || !ad || ad.dataset.adRequested) return
        window.adsbygoogle = window.adsbygoogle || []
        window.adsbygoogle.push({})
        ad.dataset.adRequested = 'true'
      })
      .catch((error) => console.error('Ad could not be initialized.', error))
    return () => { cancelled = true }
  }, [isAdminRoute, settings, slot])

  if (isAdminRoute || !settings?.enabled || !settings.publisher_id || !settings[slot]) return null

  const slotId = settings[slot]

  return (
    <aside className={`ad-slot ${className}`.trim()} aria-label="Advertisement">
      <span className="ad-slot-label">Advertisement</span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={settings.publisher_id}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  )
}
