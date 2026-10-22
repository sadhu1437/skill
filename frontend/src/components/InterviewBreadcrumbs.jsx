import { Link } from 'react-router-dom'

export default function InterviewBreadcrumbs({ topic, question }) {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Interview Questions', href: '/interview' },
  ]
  if (topic) {
    items.push(question
      ? { label: topic.name, href: `/interview/${topic.slug}`, className: 'interview-breadcrumb-topic' }
      : { label: topic.name })
  }
  if (question) items.push({ label: question.title, current: true })

  return (
    <nav className={`interview-breadcrumbs${question ? ' has-question' : ''}`} aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={`${item.href || 'current'}-${item.label}`} className={item.className}>
            {item.href
              ? <Link to={item.href}>{item.label}</Link>
              : <span aria-current={item.current ? 'page' : undefined}>{item.label}</span>}
            {index < items.length - 1 && <span className="interview-breadcrumb-separator" aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
