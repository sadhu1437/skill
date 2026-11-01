import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import {
  hasValidAdConfiguration,
  initializeAdUnit,
  isEnabledAdPlacement,
} from './adsenseUnits'

const publisherId = 'ca-pub-8687126461256058'
const placement = {
  id: 'jobs-display',
  name: 'Jobs display',
  surface: 'jobs_listing',
  position: 'page_top',
  slot_id: '8098220433',
  ad_type: 'display',
}

describe('AdSense unit validation', () => {
  it('accepts a valid publisher, numeric slot, and supported unit type', () => {
    expect(hasValidAdConfiguration(publisherId, placement)).toBe(true)
    expect(hasValidAdConfiguration(publisherId, { ...placement, ad_type: 'in_article' })).toBe(true)
  })

  it.each([
    ['', placement],
    ['ca-pub-123', placement],
    ['ca-pub-86871264612560580', placement],
    [publisherId, { ...placement, slot_id: '' }],
    [publisherId, { ...placement, slot_id: '123abc' }],
    [publisherId, { ...placement, slot_id: 8098220433 }],
    [publisherId, { ...placement, ad_type: 'responsive' }],
    [publisherId, { ...placement, ad_type: '' }],
  ])('rejects invalid publisher or placement configuration', (candidatePublisher, candidatePlacement) => {
    expect(hasValidAdConfiguration(candidatePublisher, candidatePlacement)).toBe(false)
  })

  it('requires enabled settings and an exact surface and position match', () => {
    const settings = { enabled: true, publisher_id: publisherId }
    expect(isEnabledAdPlacement(settings, placement, 'jobs_listing', 'page_top')).toBe(true)
    expect(isEnabledAdPlacement({ ...settings, enabled: false }, placement, 'jobs_listing', 'page_top')).toBe(false)
    expect(isEnabledAdPlacement(settings, placement, 'explore_listing', 'page_top')).toBe(false)
    expect(isEnabledAdPlacement(settings, placement, 'jobs_listing', 'page_bottom')).toBe(false)
  })
})

describe('manual ad initialization', () => {
  function makeAdElement() {
    return { dataset: {} }
  }

  it('queues an ad at most once per actual element', () => {
    const adElement = makeAdElement()
    const adsbygoogle = { push: vi.fn() }
    const browserWindow = { adsbygoogle }

    expect(initializeAdUnit(adElement, browserWindow)).toBe(true)
    expect(initializeAdUnit(adElement, browserWindow)).toBe(false)
    expect(adsbygoogle.push).toHaveBeenCalledTimes(1)
  })

  it('does not retry after initialization throws', () => {
    const adElement = makeAdElement()
    const adsbygoogle = { push: vi.fn(() => { throw new Error('test failure') }) }
    const browserWindow = { adsbygoogle }
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(initializeAdUnit(adElement, browserWindow)).toBe(false)
    expect(initializeAdUnit(adElement, browserWindow)).toBe(false)
    expect(adElement.dataset.adInitializationError).toBe('true')
    expect(adsbygoogle.push).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledTimes(1)
    errorSpy.mockRestore()
  })
})

describe('global AdSense loader', () => {
  it('exists once in the public HTML head and is asynchronous', () => {
    const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
    const loaderTag = html.match(/<script\b(?=[^>]*adsbygoogle\.js)[^>]*>/gi) || []

    expect(loaderTag).toHaveLength(1)
    expect(loaderTag[0]).toMatch(/\basync\b/)
    expect(loaderTag[0]).toContain('client=ca-pub-8687126461256058')
  })
})
