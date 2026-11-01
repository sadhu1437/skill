const PUBLISHER_ID_PATTERN = /^ca-pub-\d{16}$/
const SLOT_ID_PATTERN = /^\d{1,20}$/
const AD_TYPES = new Set(['display', 'in_article'])

export function hasValidAdConfiguration(publisherId, placement) {
  return typeof publisherId === 'string'
    && PUBLISHER_ID_PATTERN.test(publisherId)
    && typeof placement?.slot_id === 'string'
    && SLOT_ID_PATTERN.test(placement.slot_id)
    && AD_TYPES.has(placement.ad_type)
    && typeof placement.name === 'string'
}

export function isEnabledAdPlacement(settings, placement, surface, position) {
  return settings?.enabled === true
    && hasValidAdConfiguration(settings.publisher_id, placement)
    && placement.surface === surface
    && placement.position === position
}

export function initializeAdUnit(adElement, browserWindow = globalThis.window) {
  if (!adElement || !browserWindow || adElement.dataset.adRequested) return false

  adElement.dataset.adRequested = 'true'
  try {
    browserWindow.adsbygoogle = browserWindow.adsbygoogle || []
    browserWindow.adsbygoogle.push({})
    return true
  } catch (error) {
    adElement.dataset.adInitializationError = 'true'
    console.error('Ad could not be initialized.', error)
    return false
  }
}
