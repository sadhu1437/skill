import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { sanitizeHtml } from '../security/sanitizeHtml'
import { fetchJson } from '../api/client'
import AdSlot from '../components/AdSlot'
import { setSeo } from '../utils/seo'
import './home.css'

const exploreCards = [
  { title: 'Education PDFs', description: 'Download curated PDFs for aptitude, programming, and more', icon: '📄' },
  { title: 'Hiring Patterns', description: 'Company-wise hiring rounds, formats, and latest insights', icon: '🏢' },
  { title: 'Interview Questions', description: 'HR & Technical questions with explanations and PDFs', icon: '💬' },
  { title: 'Coding Practice', description: 'Challenge yourself with top coding problems & solutions', icon: '💻' },
  { title: 'Preparation Books', description: 'Best books for placements, aptitude, and technical skills', icon: '📚' },
  { title: 'Career Roadmaps', description: 'Step-by-step paths for Developers, Analysts & more', icon: '🧭' },
  { title: 'Job Opportunities', description: 'Find the latest jobs in top MNCs & startups', icon: '📊' },
  { title: 'Opportunities Hub', description: 'Internships, contests, off-campus drives & events', icon: '🚀' },
]

export default function HomePage() {
  const [jobs, setJobs] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)

  useEffect(() => {
    setSeo({ title: 'SkillBloom | Jobs, Interview Questions & Learning PDFs', description: 'Find the latest jobs, interview questions, learning PDFs, and practical career preparation resources on SkillBloom.', path: '/' })
    fetchJson('/core/home/')
      .then((data) => setJobs(data.jobs || []))
      .catch(() => setJobs([]))
      .finally(() => setLoadingJobs(false))
  }, [])

  return (
    <div className="home-page">
      <header className="section__container header__container" id="home">
        <h2>No.1 Career Developer</h2>
        <h1>
          Access Jobs, PDFs &<br />
          Crack Your <span>Next Interview</span>
        </h1>
        <p>
          Start your career with SkillBloom — your one-stop platform to explore top job openings,
          download essential PDFs, prepare with expert interview questions, and access resources that
          guide you toward your dream job.
        </p>
        <div className="header__btns">
          <Link to="/jobs" className="btn">Browse Jobs</Link>
          <a href="https://youtube.com/@ytsmart143?si=RArtu08pGPesGzmW" target="_blank" rel="noreferrer">
            <span>▶</span>
            Youtube
          </a>
        </div>
      </header>

      <AdSlot slot="home_slot" className="home-ad-slot" />

      <section className="section__container explore__container" id="about">
        <h2 className="section__header">
          <span>Explore Everything You Need</span> to Get Job-Ready &amp; Stand Out
        </h2>
        <p className="section__description">
          Access categorized resources like PDFs, interview questions, hiring process patterns, and coding practice to launch your career with confidence.
        </p>

        <div className="explore__grid">
          {exploreCards.map((card) => (
            <div key={card.title} className="explore__card">
              <span>{card.icon}</span>
              <h4>{card.title}</h4>
              <p>{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <AdSlot slot="home_slot" className="home-ad-slot" />

      <section className="section__container job__container" id="job">
        <h2 className="section__header"><span>Latest &amp; Top</span> Job Openings</h2>
        <p className="section__description">
          Discover exciting new opportunities and high-demand positions available now in top industries and companies.
        </p>

        <div className="job__grid">
          {loadingJobs && <p className="job-status">Loading published jobs...</p>}
          {!loadingJobs && jobs.length === 0 && <p className="job-status">No published jobs yet.</p>}
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
      </section>

      <div className="explore__btn1" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Link to="/jobs" className="btn">View All Jobs</Link>
      </div>

      <AdSlot slot="home_slot" className="home-ad-slot" />
    </div>
  )
}
