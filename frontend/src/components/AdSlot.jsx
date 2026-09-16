import { useEffect, useState } from 'react'
import { fetchJson } from '../api/client'

export default function AdSlot({ slot = 'job_slot', className = '' }) {
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetchJson('/core/adsense/').then(setSettings).catch(() => setSettings({ enabled: false }))
  }, [])

  useEffect(() => {
    if (!settings?.enabled || !settings.publisher_id) return
    if (!document.querySelector('script[data-skillbloom-adsense]')) {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.publisher_id}`
      script.crossOrigin = 'anonymous'
      script.dataset.skillbloomAdsense = 'true'
      script.onload = () => {
        window.adsbygoogle = window.adsbygoogle || []
        window.adsbygoogle.push({})
      }
      document.head.appendChild(script)
    } else if (window.adsbygoogle) {
      try {
        window.adsbygoogle.push({})
      } catch {
        // AdSense may be unavailable during local development.
      }
    }
  }, [settings])

  if (!settings?.enabled || !settings.publisher_id || !settings[slot]) return null

  const slotId = settings[slot]

  return (
    <div className={`ad-slot ${className}`} aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px' }}
        data-ad-client={settings.publisher_id}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
