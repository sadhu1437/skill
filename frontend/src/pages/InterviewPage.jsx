import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchJson } from '../api/client'
import AdSlot from '../components/AdSlot'
import './interview.css'

export default function InterviewPage() {
  const [topics, setTopics] = useState([])
  const [state, setState] = useState('loading')

  useEffect(() => {
    fetchJson('/interview/topics/')
      .then((data) => { setTopics(data.results || data); setState('ready') })
      .catch(() => setState('error'))
  }, [])

  return <div className="section__container resource-page interview-page">
    <div className="interview-hero"><p className="interview-kicker">SkillBloom Interview Lab</p><h1>Interview Questions <span>&amp; Answers</span></h1><p>Learn the reasoning behind strong answers, practice coding patterns, and prepare by topic.</p></div><AdSlot slot="interview_slot" className="interview-ad-slot" />
    {state === 'loading' && <p className="interview-state">Loading interview topics...</p>}
    {state === 'error' && <p className="interview-state interview-error">Interview topics could not be loaded.</p>}
    {state === 'ready' && !topics.length && <p className="interview-state">No published topics yet.</p>}
    <div className="explore__grid interview-topic-grid">{topics.map((topic) => <Link to={`/interview/${topic.slug}`} className="explore__card interview-topic-card" key={topic.id}><span className="interview-topic-icon">{topic.icon === 'database' ? '◈' : '✦'}</span><h2>{topic.name}</h2><p>{topic.description || `Explore ${topic.name} interview questions and answers.`}</p><span className="interview-topic-count">{topic.question_count || 0} questions →</span></Link>)}</div>
  </div>
}
