import { Link } from 'react-router-dom'

export default function InterviewBreadcrumbs({ topic, question }) {
  return <nav className="interview-breadcrumbs" aria-label="Breadcrumb">
    <Link to="/">Home</Link><span>/</span><Link to="/interview">Interview Questions</Link>
    {topic && <><span>/</span>{question ? <Link to={`/interview/${topic.slug}`}>{topic.name}</Link> : <span aria-current="page">{topic.name}</span>}</>}
    {question && <><span>/</span><span aria-current="page">{question.title}</span></>}
  </nav>
}
