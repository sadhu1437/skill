import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchJson } from '../api/client'
import AdSlot from '../components/AdSlot'
import InterviewBreadcrumbs from '../components/InterviewBreadcrumbs'
import InterviewCodeBlock from '../components/InterviewCodeBlock'
import './interview.css'

function Section({ title, value }) {
  if (!value) return null
  return <section className="interview-answer-section"><h2>{title}</h2><div className="interview-prose">{value}</div></section>
}

export default function InterviewQuestionPage() {
  const { topicSlug, questionSlug } = useParams()
  const [question, setQuestion] = useState(null)
  const [related, setRelated] = useState([])
  const [state, setState] = useState('loading')

  useEffect(() => {
    Promise.all([fetchJson(`/interview/questions/${questionSlug}/`), fetchJson(`/interview/questions/?topic=${topicSlug}`)])
      .then(([questionData, questionList]) => { setQuestion(questionData); setRelated((questionList.results || questionList).filter((item) => item.slug !== questionSlug).slice(0, 3)); setState('ready') })
      .catch(() => setState('error'))
  }, [topicSlug, questionSlug])

  if (state === 'loading') return <main className="section__container interview-shell"><p className="interview-state">Loading answer...</p></main>
  if (state === 'error' || !question) return <main className="section__container interview-shell"><p className="interview-state interview-error">This interview question could not be loaded.</p></main>

  return <main className="section__container interview-shell"><InterviewBreadcrumbs topic={question.topic} question={question} /><AdSlot slot="interview_slot" className="interview-ad-slot" /><article className="interview-question-detail"><header><div className="interview-question-meta"><span>{question.question_type}</span><span>{question.difficulty}</span></div><h1>{question.title}</h1><p className="interview-question-lead">{question.question}</p></header><Section title="Answer" value={question.answer} /><Section title="Explanation" value={question.explanation} />{question.question_type === 'coding' && <><Section title="Problem" value={question.problem_statement || question.question} /><Section title="Input" value={question.input_format} /><Section title="Output" value={question.output_format} /><Section title="Constraints" value={question.constraints} /></>}{question.example && <Section title="Example" value={question.example} />}{question.key_points && <Section title="Key Points" value={question.key_points} />}{question.code_examples?.map((example) => <InterviewCodeBlock key={example.id} example={example} />)}{related.length > 0 && <section className="interview-related"><h2>Related Questions</h2><div>{related.map((item) => <Link to={`/interview/${topicSlug}/${item.slug}`} key={item.id}>{item.title} <span>→</span></Link>)}</div></section>}</article></main>
}
