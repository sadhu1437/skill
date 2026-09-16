import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { sanitizeHtml } from '../security/sanitizeHtml'
import { fetchJson } from '../api/client'
import AdSlot from '../components/AdSlot'
import { setSeo } from '../utils/seo'
import './jobs.css'

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSeo({ title: 'Latest Jobs in India | SkillBloom', description: 'Explore the latest fresher, internship, and experienced job opportunities with eligibility, location, salary, and official apply details.', path: '/jobs' })
    fetchJson('/jobs/')
      .then((data) => setJobs(Array.isArray(data) ? data : data.results || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="section__container job__container jobs-page">
      <h2 className="section__header"><span>Latest &amp; Top</span> Job Openings</h2>
      <p className="section__description">
        Discover exciting new opportunities and high-demand positions available now in top industries and companies.
      </p>

      <AdSlot slot="content_slot" className="jobs-ad-slot" />

      <div className="job__grid">
        {loading && <p className="job-status">Loading published jobs...</p>}
        {!loading && jobs.length === 0 && <p className="job-status">No published jobs yet.</p>}
        {jobs.map((job) => (
          <div key={job.id || job.slug} className="job__card">
            <div className="job__card__header">
              <div>
                <p><strong>Company:</strong> {job.company?.name}</p>
                <p>{job.location}</p>
              </div>
            </div>
            <h4>{job.title}</h4>
            <div className="job-card-description" dangerouslySetInnerHTML={{ __html: sanitizeHtml(job.description || job.short_description) }} />
            <div className="job__card__footer">
              <span>Positions</span>
              <span>{job.job_type}</span>
              <span>CTC/Year</span>
            </div>
            <div className="explore__btn">
              <Link to={`/jobs/${job.slug}`} className="btn">Apply Now</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
