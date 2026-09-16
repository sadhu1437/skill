import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchJson } from '../api/client'
import AdSlot from '../components/AdSlot'
import InterviewBreadcrumbs from '../components/InterviewBreadcrumbs'
import './interview.css'

export default function InterviewTopicPage() {
  const { topicSlug } = useParams()
  const [topic, setTopic] = useState(null)
  const [questions, setQuestions] = useState([])
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [state, setState] = useState('loading')

  useEffect(() => {
    setState('loading')
    Promise.all([fetchJson(`/interview/topics/${topicSlug}/`), fetchJson(`/interview/questions/?topic=${topicSlug}`)])
      .then(([topicData, questionData]) => { setTopic(topicData); setQuestions(questionData.results || questionData); setState('ready') })
      .catch(() => setState('error'))
  }, [topicSlug])

  const filteredQuestions = questions.filter((item) => (!difficulty || item.difficulty === difficulty) && (!search || `${item.title} ${item.question} ${item.tags}`.toLowerCase().includes(search.toLowerCase())))

  if (state === 'loading') return <main className="section__container interview-shell"><p className="interview-state">Loading questions...</p></main>
  if (state === 'error' || !topic) return <main className="section__container interview-shell"><p className="interview-state interview-error">This interview topic could not be loaded.</p></main>

  return <main className="section__container interview-shell"><InterviewBreadcrumbs topic={topic} /><header className="interview-topic-header"><p className="interview-kicker">Topic library</p><h1>{topic.name} Interview Questions</h1><p>{topic.description}</p></header><AdSlot slot="interview_slot" className="interview-ad-slot" /><div className="interview-filters"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this topic" aria-label="Search questions" /><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} aria-label="Filter by difficulty"><option value="">All difficulty levels</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>{!filteredQuestions.length && <p className="interview-state">No matching questions found.</p>}<div className="interview-question-list">{filteredQuestions.map((item, index) => <Link className="interview-question-card" to={`/interview/${topic.slug}/${item.slug}`} key={item.id}><span className="interview-question-number">{String(index + 1).padStart(2, '0')}</span><div><div className="interview-question-meta"><span>{item.question_type}</span><span>{item.difficulty}</span></div><h2>{item.title}</h2><p>{item.preview}</p></div><span className="interview-question-arrow">→</span></Link>)}</div></main>
}
