import { useEffect, useState } from 'react'
import { requestJson } from '../api/client'
import { loadAdSettings, updateAdSettings } from '../utils/adsenseSettings'
import './adsense-settings.css'

const EMPTY_SETTINGS = {
  enabled: false,
  publisher_id: '',
  placements: [],
}

const SURFACES = [
  { value: 'home', label: 'Home page', positions: ['page_top', 'page_bottom'] },
  { value: 'jobs_listing', label: 'Jobs listing', positions: ['page_top', 'page_bottom'] },
  { value: 'job_article', label: 'Job article', positions: ['in_article', 'page_bottom'] },
  { value: 'explore_listing', label: 'Explore listing', positions: ['page_top', 'page_bottom'] },
  { value: 'explore_article', label: 'Explore article', positions: ['in_article'] },
  { value: 'interview_index', label: 'Interview questions index', positions: ['page_top', 'page_bottom'] },
  { value: 'interview_question', label: 'Interview answer', positions: ['in_article'] },
]

const MANAGED_SURFACES = {
  main: ['home', 'jobs_listing', 'job_article', 'interview_index', 'interview_question'],
  explore: ['explore_listing', 'explore_article'],
}

const POSITION_LABELS = {
  page_top: 'After page introduction',
  page_bottom: 'After page content',
  in_article: 'Between qualifying article paragraphs',
}

function nextAvailablePosition(placements, surface, availableSurfaces = SURFACES) {
  const definition = availableSurfaces.find((item) => item.value === surface)
  return definition?.positions.find((position) => (
    !placements.some((item) => item.surface === surface && item.position === position)
  ))
}

function newPlacement(placements, availableSurfaces) {
  const surface = availableSurfaces.find((item) => (
    nextAvailablePosition(placements, item.value, availableSurfaces)
  ))
  if (!surface) return null
  const id = `placement-${crypto.randomUUID()}`
  const position = nextAvailablePosition(placements, surface.value, availableSurfaces)
  return {
    id,
    name: `New placement ${placements.length + 1}`,
    surface: surface.value,
    position,
    slot_id: '',
    ad_type: position === 'in_article' ? 'in_article' : 'display',
  }
}

export default function AdSenseSettingsForm({ section = 'main', onSaved }) {
  const [settings, setSettings] = useState(EMPTY_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [removedPlacementIds, setRemovedPlacementIds] = useState([])
  const managedSurfaceValues = MANAGED_SURFACES[section] || MANAGED_SURFACES.main
  const availableSurfaces = SURFACES.filter((surface) => managedSurfaceValues.includes(surface.value))
  const visiblePlacements = settings.placements.filter((placement) => (
    managedSurfaceValues.includes(placement.surface)
  ))

  useEffect(() => {
    let active = true
    loadAdSettings()
      .then((data) => {
        if (active) setSettings({ ...EMPTY_SETTINGS, ...data, placements: data.placements || [] })
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Could not load AdSense settings.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  function updateField(event) {
    const { name, value, checked, type } = event.target
    setSettings((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  function updatePlacement(placementId, field, value) {
    setSettings((current) => ({
      ...current,
      placements: current.placements.map((placement) => {
        if (placement.id !== placementId) return placement
        const otherPlacements = current.placements.filter((item) => item.id !== placementId)
        const nextPosition = field === 'surface'
          ? nextAvailablePosition(otherPlacements, value, availableSurfaces)
            || availableSurfaces.find((item) => item.value === value).positions[0]
          : field === 'position' ? value : placement.position
        const jobArticleTarget = (
          field === 'position' && placement.surface === 'job_article'
        ) || (
          field === 'surface' && value === 'job_article'
        )
        return {
          ...placement,
          [field]: value,
          ...(field === 'surface' ? { position: nextPosition } : {}),
          ...(jobArticleTarget
            ? { ad_type: nextPosition === 'in_article' ? 'in_article' : 'display' }
            : {}),
        }
      }),
    }))
  }

  function addPlacement() {
    const placement = newPlacement(settings.placements, availableSurfaces)
    if (placement) setSettings((current) => ({ ...current, placements: [...current.placements, placement] }))
  }

  function removePlacement(placementId) {
    setSettings((current) => ({
      ...current,
      placements: current.placements.filter((placement) => placement.id !== placementId),
    }))
    setRemovedPlacementIds((current) => [...new Set([...current, placementId])])
  }

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    const payload = {
      enabled: settings.enabled,
      publisher_id: settings.publisher_id.trim(),
      placements: visiblePlacements.map((placement) => ({
        ...placement,
        name: placement.name.trim(),
        slot_id: placement.slot_id.trim(),
      })),
      remove_placement_ids: removedPlacementIds,
    }
    try {
      const saved = await requestJson('/core/adsense/', { method: 'PATCH', body: JSON.stringify(payload) })
      setSettings((current) => ({ ...current, ...saved, placements: saved.placements || [] }))
      setRemovedPlacementIds([])
      updateAdSettings(saved)
      setNotice('AdSense settings saved.')
      onSaved?.()
    } catch (saveError) {
      setError(saveError.message || 'Could not save AdSense settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={`adsense-settings-form adsense-settings-${section}`} onSubmit={save}>
      <div className="adsense-settings-heading">
        <div><p className="adsense-settings-kicker">Monetization</p><h2>AdSense configuration</h2></div>
        <label className="adsense-enabled-control">
          <input type="checkbox" name="enabled" checked={settings.enabled} onChange={updateField} disabled={loading || saving} />
          Enable AdSense
        </label>
      </div>
      <label className="adsense-publisher-field">
        Publisher ID
        <input
          type="text"
          name="publisher_id"
          value={settings.publisher_id}
          onChange={updateField}
          placeholder="ca-pub-8687126461256058"
          pattern="ca-pub-[0-9]{16}"
          title="Enter ca-pub- followed by 16 digits."
          autoComplete="off"
          disabled={loading || saving}
        />
      </label>
      <div className="adsense-placement-grid">
        {visiblePlacements.map((placement) => {
          const definition = availableSurfaces.find((surface) => surface.value === placement.surface)
          const otherPlacements = settings.placements.filter((item) => item.id !== placement.id)
          return (
          <fieldset className="adsense-placement" key={placement.id} disabled={loading || saving}>
            <legend>{placement.name || 'Ad placement'}</legend>
            <label>
              Placement name
              <input
                type="text"
                maxLength="80"
                value={placement.name}
                onChange={(event) => updatePlacement(placement.id, 'name', event.target.value)}
                required
              />
            </label>
            <label>
              Public page
              <select
                value={placement.surface}
                onChange={(event) => updatePlacement(placement.id, 'surface', event.target.value)}
              >
                {availableSurfaces.map((surface) => (
                  <option
                    value={surface.value}
                    key={surface.value}
                    disabled={surface.value !== placement.surface && !nextAvailablePosition(otherPlacements, surface.value, availableSurfaces)}
                  >{surface.label}</option>
                ))}
              </select>
            </label>
            <label>
              Position
              <select
                value={placement.position}
                onChange={(event) => updatePlacement(placement.id, 'position', event.target.value)}
              >
                {definition?.positions.map((position) => (
                  <option
                    value={position}
                    key={position}
                    disabled={otherPlacements.some((item) => item.surface === placement.surface && item.position === position)}
                  >{POSITION_LABELS[position]}</option>
                ))}
              </select>
            </label>
            <label>
              Ad Slot ID
              <input
                type="text"
                value={placement.slot_id}
                onChange={(event) => updatePlacement(placement.id, 'slot_id', event.target.value)}
                inputMode="numeric"
                pattern="[0-9]{1,20}"
                title="Enter the numeric Ad Slot ID from Google AdSense."
                placeholder={placement.ad_type === 'in_article' ? '5865653813' : '8098220433'}
                autoComplete="off"
                required
              />
            </label>
            <label>
              Ad unit type
              <select
                value={placement.ad_type}
                onChange={(event) => updatePlacement(placement.id, 'ad_type', event.target.value)}
                disabled={placement.surface === 'job_article'}
              >
                <option value="display">Display</option>
                <option value="in_article">In-article</option>
              </select>
            </label>
            <button type="button" className="adsense-placement-remove" onClick={() => removePlacement(placement.id)}>Remove placement</button>
          </fieldset>
        )})}
      </div>
      <button type="button" className="adsense-placement-add" onClick={addPlacement} disabled={loading || saving || !availableSurfaces.some((surface) => nextAvailablePosition(settings.placements, surface.value, availableSurfaces))}>
        Add placement
      </button>
      {error && <p className="adsense-settings-error" role="alert">{error}</p>}
      {notice && <p className="adsense-settings-success" role="status">{notice}</p>}
      <button className="adsense-settings-submit" type="submit" disabled={loading || saving}>
        {saving ? 'Saving…' : loading ? 'Loading…' : 'Save AdSense settings'}
      </button>
    </form>
  )
}
