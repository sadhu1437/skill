import './pdfs.css'
import AdSlot from '../components/AdSlot'
import { useEffect, useState } from 'react'
import { fetchJson } from '../api/client'
import { Link } from 'react-router-dom'
import { setSeo } from '../utils/seo'

export default function PDFsPage() {
  const [pdfs, setPdfs] = useState([])
  const [state, setState] = useState('loading')

  useEffect(() => {
    setSeo({ title: 'Learning PDFs for Students and Placements | SkillBloom Education', description: 'Download learning PDFs for programming, aptitude, interviews, and placement preparation from SkillBloom Education.', keywords: 'learning PDFs, educational PDFs, aptitude PDF, programming PDF, placement preparation, interview PDF', path: '/pdfs' })
    fetchJson('/resources/')
      .then((data) => { setPdfs(Array.isArray(data) ? data : data.results || []); setState('ready') })
      .catch(() => setState('error'))
  }, [])

  return (
    <div className="section__container resource-page pdf-page">
      <h2 className="section__header"><span>Learning</span> PDFs</h2>
      <p className="section__description">Download curated PDF resources for programming, aptitude, interviews, and placement preparation.</p>

      <AdSlot slot="content_slot" className="pdfs-ad-slot" />

      {state === 'loading' && <p className="pdf-state">Loading published resources...</p>}
      {state === 'error' && <p className="pdf-state pdf-error">Learning resources could not be loaded.</p>}
      {state === 'ready' && !pdfs.length && <p className="pdf-state">No published PDFs available yet. Check back soon.</p>}

      <div className="explore__grid">
        {pdfs.map((pdf) => (
          <div key={pdf.title} className="explore__card">
            {pdf.thumbnail ? <img className="pdf-thumbnail" src={pdf.thumbnail} alt="" loading="lazy" /> : <span>📄</span>}
            <h4>{pdf.title}</h4>
            <span className="resource-category">{pdf.category}</span>
            <p>{pdf.description}</p>
            <Link to={`/pdfs/${pdf.slug}`} className="resource-link">View course content</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
