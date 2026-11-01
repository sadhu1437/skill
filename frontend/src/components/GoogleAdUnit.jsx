import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { loadAdSettings, subscribeToAdSettings } from '../utils/adsenseSettings'
import { isAdEligiblePath } from '../utils/adEligibility'
import { initializeAdUnit, isEnabledAdPlacement } from '../utils/adsenseUnits'
import AdUnitRenderer from './AdUnitRenderer'
import AdEligibility from './AdEligibility'

function EligibleAdUnit({ settings, placement }) {
  const adRef = useRef(null)

  useEffect(() => {
    if (!settings.enabled || !adRef.current) return undefined
    initializeAdUnit(adRef.current)
    return undefined
  }, [settings, placement])

  if (!isEnabledAdPlacement(settings, placement, placement.surface, placement.position)) return null

  const inArticle = placement.ad_type === 'in_article'
  return (
    <aside className={`ad-slot${inArticle ? ' article-inline-ad-slot' : ' display-ad-slot'}`} aria-label="Advertisements">
      <span className="ad-slot-label">Advertisements</span>
      <AdUnitRenderer adRef={adRef} placement={placement} publisherId={settings.publisher_id} />
    </aside>
  )
}

export default function GoogleAdUnit({ surface, position, contentEligible = true }) {
  const [settings, setSettings] = useState(null)
  const { pathname } = useLocation()
  const eligible = contentEligible && isAdEligiblePath(pathname, surface)

  useEffect(() => {
    if (!eligible) return undefined
    let cancelled = false
    const unsubscribe = subscribeToAdSettings((data) => {
      if (!cancelled) setSettings(data)
    })
    loadAdSettings()
      .then((data) => {
        if (!cancelled) setSettings(data)
      })
      .catch((error) => console.error('Ad settings could not be loaded.', error))
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [eligible])

  return (
    <AdEligibility surface={surface} contentEligible={eligible}>
      {settings?.placements?.filter((placement) => (
        isEnabledAdPlacement(settings, placement, surface, position)
      )).map((placement) => (
        <EligibleAdUnit
          settings={settings}
          placement={placement}
          key={`${placement.id}:${placement.slot_id}:${placement.ad_type}:${settings.publisher_id}`}
        />
      ))}
    </AdEligibility>
  )
}
