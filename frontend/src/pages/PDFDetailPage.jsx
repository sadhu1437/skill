import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchJson } from '../api/client'
import AdSlot from '../components/AdSlot'
import { sanitizeHtml } from '../security/sanitizeHtml'
import './pdfs.css'

export default function PDFDetailPage() {
  const { slug } = useParams()
  const [resource, setResource] = useState(null)
  const [state, setState] = useState('loading')

  useEffect(() => {
    fetchJson(`/resources/${slug}/`)
      .then((data) => { setResource(data); setState('ready') })
      .catch(() => setState('error'))
  }, [slug])

  if (state === 'loading') return <main className="section__container pdf-detail-page"><p className="pdf-state">Loading course content...</p></main>
  if (state === 'error' || !resource) return <main className="section__container pdf-detail-page"><p className="pdf-state pdf-error">This PDF resource could not be loaded.</p><Link className="resource-link" to="/pdfs">Back to Learning PDFs</Link></main>

  return <main className="section__container pdf-detail-page">
    <Link className="pdf-back-link" to="/pdfs">← Back to Learning PDFs</Link>
    <header className="pdf-detail-header"><span className="interview-kicker">SkillBloom Learning Resource</span><h1>{resource.title}</h1><div className="pdf-detail-meta"><span>{resource.category}</span>{resource.author && <span>By {resource.author}</span>}</div></header>
    <AdSlot slot="content_slot" className="pdf-detail-ad-slot" />
    <article className="pdf-content-panel">
      <h2>Course Content</h2>
      <p className="pdf-description">{resource.description || 'Open this learning resource to study the complete course material.'}</p>
      {resource.content && <div className="pdf-course-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(resource.content) }} />}
      {resource.tags && <p className="pdf-tags">Topics: {resource.tags}</p>}
      <div className="pdf-preview"><iframe src={resource.pdf} title={`${resource.title} preview`} /></div>
      <div className="pdf-download-area"><p>Finished reviewing the content?</p><a className="primary-btn pdf-download-button" href={resource.pdf} target="_blank" rel="noreferrer" download>Download PDF</a></div>
    </article>
  </main>
}
