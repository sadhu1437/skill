import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchJson } from '../api/client'
import AdSlot from '../components/AdSlot'
import { sanitizeHtml } from '../security/sanitizeHtml'
import { setSeo } from '../utils/seo'
import './detail.css'

const fallbackJobs = {
  amazon: { title: 'Machine Learning Summer School', company: { name: 'Amazon' }, location: 'India', work_mode: 'Hybrid', job_type: 'Intern', experience: 'Students', qualification: 'Students interested in Machine Learning', salary: 'Not disclosed', job_id: 'AMZ-ML', published_at: 'Source listing', deadline: 'Check official listing', official_url: 'https://www.amazon.science/academic-engagements/machine-learning-summer-school', short_description: 'The Amazon ML Summer School provides students with the opportunity to gain Machine Learning skills and build a career in ML.', description: 'This intensive course covers key Machine Learning topics and offers students a chance to learn from Amazon scientists.' },
  'goldman-sachs': { title: 'Associate-Software Engineering', company: { name: 'Goldman Sachs' }, location: 'India', work_mode: 'Hybrid', job_type: 'Intern', experience: 'Entry level', qualification: 'Relevant technical qualification', salary: 'Not disclosed', job_id: 'GS-SE', published_at: 'Source listing', deadline: 'Check official listing', official_url: 'https://www.goldmansachs.com/careers/', short_description: 'Develop mission-critical, high quality software solutions using cutting-edge technology.', description: 'Are you passionate about developing mission-critical, high quality software solutions in a dynamic environment?' },
  jio: { title: 'Graduate Engineer Trainee', company: { name: 'JIO' }, location: 'India', work_mode: 'Full Time', job_type: 'Full Time', experience: 'Fresher', qualification: 'Engineering graduate', salary: 'Not disclosed', job_id: 'JIO-GET', published_at: 'Source listing', deadline: 'Check official listing', official_url: 'https://careers.jio.com/', short_description: 'Design, plan and engineer end to end international networks.', description: 'Coordinate with device and product teams to develop requirements to support 4G, 3G and 2G roaming capability.' },
  google: { title: 'Software Engineer', company: { name: 'Google' }, location: 'India', work_mode: 'Full Time', job_type: 'Full Time', experience: 'Entry level', qualification: 'Technical degree or equivalent experience', salary: 'Not disclosed', job_id: 'GOOG-SE', published_at: 'Source listing', deadline: 'Check official listing', official_url: 'https://careers.google.com/', short_description: 'Work on projects critical to Google’s needs as the business grows and evolves.', description: 'As a software engineer, you will work on a specific project critical to Google’s needs with opportunities to switch teams and projects.' },
  cvent: { title: 'Management Trainee, Associate Product Consultant', company: { name: 'CVENT' }, location: 'India', work_mode: 'Full Time', job_type: 'Full Time', experience: 'Entry level', qualification: 'Relevant technical qualification', salary: 'Not disclosed', job_id: 'CVENT-MT', published_at: 'Source listing', deadline: 'Check official listing', official_url: 'https://careers.cvent.com/', short_description: 'Support clients on Cvent Event Management software through phone and email.', description: 'We are hiring Management Trainees in our Client Services department for Event Management software products.' },
  wipro: { title: 'Trainee', company: { name: 'WIPRO' }, location: 'India', work_mode: 'Full Time', job_type: 'Full Time', experience: 'Fresher', qualification: 'Relevant technical qualification', salary: 'Not disclosed', job_id: 'WIPRO-TR', published_at: 'Source listing', deadline: 'Check official listing', official_url: 'https://careers.wipro.com/', short_description: 'Join Wipro, a leading technology services and consulting company.', description: 'Wipro builds innovative solutions that address clients’ most complex digital transformation needs.' },
  amdocs: { title: 'System Analyst', company: { name: 'Amdocs' }, location: 'India', work_mode: 'Full Time', job_type: 'Full Time', experience: 'Entry level', qualification: 'Relevant technical qualification', salary: 'Not disclosed', job_id: 'AMD-SYS', published_at: 'Source listing', deadline: 'Check official listing', official_url: 'https://www.amdocs.com/careers', short_description: 'Amdocs helps those who build the future to make it amazing.', description: 'With a market-leading portfolio of software products and services, Amdocs unlocks customers’ innovative potential.' },
  payu: { title: 'Associate Software Engineer', company: { name: 'PayU' }, location: 'India', work_mode: 'Full Time', job_type: 'Full Time', experience: 'Entry level', qualification: 'Relevant technical qualification', salary: 'Not disclosed', job_id: 'PAYU-ASE', published_at: 'Source listing', deadline: 'Check official listing', official_url: 'https://payu.in/careers', short_description: 'Join a dynamic engineering team working in the cutting-edge world of technology.', description: 'We are seeking a talented and curious Associate Software Engineer eager to join our engineering team.' },
}

export default function JobDetailPage() {
  const { slug } = useParams()
  const [job, setJob] = useState(fallbackJobs[slug] || null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetchJson(`/jobs/${slug}/`)
      .then((data) => setJob(data))
      .catch(() => setNotFound(!fallbackJobs[slug]))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!job) return
    setSeo({
      title: job.seo_title || `${job.title} at ${job.company?.name || 'SkillBloom'} | Job Details`,
      description: job.seo_description || job.short_description || job.description || `Explore ${job.title} at ${job.company?.name || 'SkillBloom'} with eligibility, location, and official application details.`,
      path: `/jobs/${slug}`,
    })
  }, [job, slug])

  if (loading && !job) return <div className="container detail-page"><h1>Loading job...</h1></div>
  if (notFound || !job) return <div className="container detail-page"><h1>Job not found</h1><p>This opportunity is no longer available.</p></div>

  const detailSections = [
    ['responsibilities', 'Responsibilities'],
    ['eligibility', 'Eligibility'],
    ['required_skills', 'Required Skills'],
    ['preferred_skills', 'Preferred Skills'],
    ['selection_process', 'Selection Process'],
    ['application_process', 'Application Process'],
    ['interview_preparation', 'Interview Preparation'],
    ['fraud_alert', 'Fraud Alert'],
  ].filter(([key]) => job?.[key])

  return (
    <div className="container detail-page">
      <div className="job-detail-header">
        <div className="card detail-card">
          <div className="company-badge" style={{ width: 72, height: 72 }}>{job.company?.name?.slice(0, 2).toUpperCase() || 'SB'}</div>
          <h1>{job.title}</h1>
          <p>{job.company?.name}</p>
          <div className="meta-list">
            <span className="meta-pill">{job.location}</span>
            <span className="meta-pill">{job.work_mode}</span>
            <span className="meta-pill">{job.job_type}</span>
            <span className="meta-pill">{job.experience}</span>
          </div>
          {job.official_url && <a href={job.official_url} target="_blank" rel="noopener noreferrer" className="primary-btn job-apply-button">Apply on Official Company Website</a>}
        </div>
        <div className="card detail-card">
          <div className="detail-list">
            <div className="detail-item"><strong>Location</strong><span>{job.location}</span></div>
            <div className="detail-item"><strong>Work Mode</strong><span>{job.work_mode}</span></div>
            <div className="detail-item"><strong>Experience</strong><span>{job.experience}</span></div>
            <div className="detail-item"><strong>Qualification</strong><span>{job.qualification}</span></div>
            <div className="detail-item"><strong>Salary</strong><span>{job.salary}</span></div>
            <div className="detail-item"><strong>Job ID</strong><span>{job.job_id}</span></div>
            <div className="detail-item"><strong>Posted</strong><span>{job.published_at}</span></div>
            <div className="detail-item"><strong>Deadline</strong><span>{job.deadline}</span></div>
          </div>
        </div>
      </div>
      <AdSlot className="job-ad-slot" />
      <div className="detail-card job-overview">
        <h3>Job Overview</h3>
        {job.short_description && <p style={{ whiteSpace: 'pre-wrap' }}>{job.short_description}</p>}
        {job.description && <div className="job-rich-description" dangerouslySetInnerHTML={{ __html: sanitizeHtml(job.description) }} />}
        {detailSections.map(([key, label]) => (
          <div key={key} style={{ marginTop: '1.25rem' }}>
            <h3>{label}</h3>
            <div className="job-rich-description" dangerouslySetInnerHTML={{ __html: sanitizeHtml(job[key]) }} />
          </div>
        ))}
      </div>
    </div>
  )
}
