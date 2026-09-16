import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { requestJson, uploadFile } from '../api/client'
import './admin.css'

const initialJob = { company_name: '', title: '', location: '', work_mode: '', job_type: '', experience: '', qualification: '', eligible_batch: '', salary: '', job_id: '', short_description: '', description: '', responsibilities: '', eligibility: '', required_skills: '', preferred_skills: '', selection_process: '', application_process: '', interview_preparation: '', fraud_alert: '', official_url: '', deadline: '', seo_title: '', seo_description: '', is_published: true, is_featured: false, priority: 0 }
const jobFields = [['company_name', 'Company name'], ['title', 'Job title'], ['location', 'Location'], ['work_mode', 'Work mode'], ['job_type', 'Job type'], ['experience', 'Experience'], ['qualification', 'Qualification'], ['eligible_batch', 'Eligible batch'], ['salary', 'Salary / CTC'], ['job_id', 'Job ID'], ['responsibilities', 'Responsibilities'], ['eligibility', 'Eligibility'], ['required_skills', 'Required skills'], ['preferred_skills', 'Preferred skills'], ['selection_process', 'Selection process'], ['application_process', 'Application process'], ['interview_preparation', 'Interview preparation'], ['fraud_alert', 'Fraud alert']]
const initialContent = { title: '', description: '', category: 'Programming', tags: '', author: '', is_published: true, is_featured: false, pdf: null, thumbnail: null }
const initialTopic = { name: '', description: '', icon: 'code', display_order: 0, is_published: true, seo_title: '', seo_description: '' }
const initialQuestion = { topic_id: '', title: '', question: '', answer: '', explanation: '', example: '', key_points: '', problem_statement: '', input_format: '', output_format: '', constraints: '', tags: '', question_type: 'conceptual', difficulty: 'medium', display_order: 0, is_published: true, code_examples: [] }
const initialAdsense = { enabled: false, publisher_id: '', home_slot: '', job_slot: '', content_slot: '', interview_slot: '' }

export default function AdminPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem('skillbloom_access_token')))
  const [authorized, setAuthorized] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [job, setJob] = useState(initialJob)
  const [content, setContent] = useState(initialContent)
  const [question, setQuestion] = useState(initialQuestion)
  const [topic, setTopic] = useState(initialTopic)
  const [interviewTopics, setInterviewTopics] = useState([])
  const [adsense, setAdsense] = useState(initialAdsense)
  const [jobs, setJobs] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const editor = useRef(null)

  useEffect(() => {
    if (!localStorage.getItem('skillbloom_access_token')) return setAuthChecked(true)
    requestJson('/auth/me/').then((user) => { setAuthorized(Boolean(user.is_staff)); setLoggedIn(Boolean(user.is_staff)) }).catch(() => logout()).finally(() => setAuthChecked(true))
  }, [])

  useEffect(() => {
    if (!authorized) return
    requestJson('/jobs/').then((data) => setJobs(Array.isArray(data) ? data : data.results || [])).catch(() => setJobs([]))
    requestJson('/core/adsense/').then(setAdsense).catch(() => {})
    requestJson('/interview/topics/').then((data) => setInterviewTopics(data.results || data)).catch(() => setInterviewTopics([]))
  }, [authorized, message])

  function logout() {
    localStorage.removeItem('skillbloom_access_token')
    localStorage.removeItem('skillbloom_refresh_token')
    setLoggedIn(false)
    setAuthorized(false)
  }

  async function login(event) {
    event.preventDefault(); setError('')
    try {
      const data = await requestJson('/auth/login/', { method: 'POST', body: JSON.stringify({ email, password }) })
      localStorage.setItem('skillbloom_access_token', data.access)
      if (data.refresh) localStorage.setItem('skillbloom_refresh_token', data.refresh)
      const user = await requestJson('/auth/me/')
      if (!user.is_staff) throw new Error('This account is not authorized to access the admin panel.')
      setAuthorized(true); setLoggedIn(true)
    } catch (loginError) { setError(loginError.message || 'Login failed.') }
  }

  function updateJob(event) { const { name, value, type, checked } = event.target; setJob((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value })) }
  function updateObject(setter) { return (event) => { const { name, value, type, checked, files } = event.target; setter((current) => ({ ...current, [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value })) } }

  async function publishJob(event) {
    event.preventDefault(); setMessage(''); setError('')
    try { await requestJson('/jobs/create/', { method: 'POST', body: JSON.stringify({ ...job, description: editor.current?.innerHTML || job.description, priority: Number(job.priority) || 0, deadline: job.deadline || null }) }); setJob(initialJob); if (editor.current) editor.current.innerHTML = ''; setMessage('Job published successfully.') } catch (publishError) { setError(publishError.message || 'Could not publish this job.') }
  }

  async function deleteJob(slug) {
    if (!window.confirm('Delete this job permanently?')) return
    try { await requestJson(`/jobs/delete/${slug}/`, { method: 'DELETE' }); setJobs((current) => current.filter((item) => item.slug !== slug)); setMessage('Job deleted successfully.') } catch (deleteError) { setError(deleteError.message || 'Could not delete this job.') }
  }

  function format(command, value = null) { editor.current?.focus(); document.execCommand(command, false, value) }
  function updateDescription() {}
  function pasteDescription(event) {
    const html = event.clipboardData.getData('text/html')
    if (html) return
    const text = event.clipboardData.getData('text/plain')
    if (!text) return
    event.preventDefault()
    document.execCommand('insertHTML', false, text.replace(/\r?\n/g, '<br>'))
  }

  useEffect(() => {
    const node = editor.current
    if (!node) return undefined
    node.addEventListener('paste', pasteDescription)
    return () => node.removeEventListener('paste', pasteDescription)
  }, [])
  async function publishContent(event) {
    event.preventDefault(); const payload = new FormData(); Object.entries(content).forEach(([key, value]) => { if (value !== null && value !== '') payload.append(key, value) })
    try { await uploadFile('/resources/create/', payload); setContent(initialContent); event.target.reset(); setMessage('Learning PDF uploaded successfully.') } catch (uploadError) { setError(uploadError.message || 'Could not upload this PDF.') }
  }
  async function publishTopic(event) { event.preventDefault(); try { const created = await requestJson('/interview/topics/create/', { method: 'POST', body: JSON.stringify(topic) }); setInterviewTopics((current) => [...current, created]); setTopic(initialTopic); setMessage('Interview topic published successfully.') } catch (topicError) { setError(topicError.message || 'Could not publish this topic.') } }
  async function publishQuestion(event) { event.preventDefault(); try { const payload = { ...question, display_order: Number(question.display_order) || 0, code_examples: question.code_examples }; const created = await requestJson('/interview/create/', { method: 'POST', body: JSON.stringify(payload) }); setQuestion(initialQuestion); setMessage(`Interview question “${created.title}” published successfully.`) } catch (questionError) { setError(questionError.message || 'Could not publish this question.') } }
  async function saveAdsense(event) { event.preventDefault(); try { await requestJson('/core/adsense/', { method: 'PATCH', body: JSON.stringify(adsense) }); setMessage('AdSense settings saved.') } catch (settingsError) { setError(settingsError.message || 'Could not save AdSense settings.') } }

  if (!authChecked) return <div className="admin-page admin-login"><div className="admin-login-card"><p>Checking admin access...</p></div></div>
  if (!loggedIn) return <div className="admin-page admin-login"><div className="admin-login-card"><p className="admin-kicker">SkillBloom workspace</p><h1>Admin sign in</h1><p>Use your Django staff account to publish from mobile or laptop.</p><form onSubmit={login}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><button className="admin-submit" type="submit">Sign in</button></form>{error && <p className="admin-error">{error}</p>}</div></div>
  if (!authorized) return <div className="admin-page admin-login"><div className="admin-login-card"><p className="admin-kicker">Restricted area</p><h1>Access denied</h1><p>Only authorized staff can access this panel.</p></div></div>

  return <div className="admin-page"><div className="admin-shell"><header className="admin-header"><div><p className="admin-kicker">SkillBloom workspace</p><h1>Content studio</h1><p>Publish and manage jobs, PDFs, interview questions, and ads.</p></div><div className="admin-header-actions"><Link className="admin-explore-link" to="/admin-panel/explore">Explore CMS</Link><button className="admin-logout" type="button" onClick={logout}>Sign out</button></div></header>{message && <p className="admin-success">{message}</p>}{error && <p className="admin-error">{error}</p>}
    <form className="admin-form" onSubmit={publishJob}><section className="admin-section"><h2>New job</h2><p className="admin-help">All job fields are optional. Fill only what this job provides.</p><div className="admin-grid">{jobFields.map(([name, label]) => <label key={name}>{label}<input name={name} value={job[name]} onChange={updateJob} /></label>)}</div><label>Short description<textarea name="short_description" value={job.short_description} onChange={updateJob} rows="3" /></label><label>Full description<div className="editor-toolbar"><button type="button" onClick={() => format('bold')}><strong>B</strong></button><button type="button" onClick={() => format('italic')}><em>I</em></button><button type="button" onClick={() => format('underline')}><u>U</u></button><button type="button" onClick={() => format('formatBlock', 'h3')}>H</button><button type="button" onClick={() => format('insertUnorderedList')}>• List</button><button type="button" onClick={() => format('insertOrderedList')}>1. List</button></div><div ref={editor} className="rich-editor" contentEditable suppressContentEditableWarning onInput={updateDescription} /></label><div className="admin-grid"><label>Official company URL<input type="url" name="official_url" value={job.official_url} onChange={updateJob} /></label><label>Application deadline<input type="datetime-local" name="deadline" value={job.deadline} onChange={updateJob} /></label></div><label>SEO title<input name="seo_title" value={job.seo_title} onChange={updateJob} maxLength="255" /></label><label>SEO description<textarea name="seo_description" value={job.seo_description} onChange={updateJob} rows="3" maxLength="320" /></label><div className="admin-options"><label><input type="checkbox" name="is_published" checked={job.is_published} onChange={updateJob} /> Publish job</label><label><input type="checkbox" name="is_featured" checked={job.is_featured} onChange={updateJob} /> Feature job</label></div><button className="admin-submit" type="submit">Publish job</button></section></form>
    <section className="admin-form admin-section"><h2>Manage published jobs</h2><div className="jobs-list-table">{jobs.length ? jobs.map((item) => <div className="job-row" key={item.id}><div><strong>{item.title || 'Untitled job'}</strong><p>{item.company?.name || item.company_name || 'SkillBloom'}{item.location ? ` • ${item.location}` : ''}</p></div><button className="admin-delete" type="button" onClick={() => deleteJob(item.slug)}>Delete job</button></div>) : <p className="admin-help">No jobs published yet.</p>}</div></section>
    <form className="admin-form" onSubmit={publishContent}><section className="admin-section"><h2>Learning PDF</h2><div className="admin-grid"><label>Title<input name="title" value={content.title} onChange={updateObject(setContent)} /></label><label>Category<input name="category" value={content.category} onChange={updateObject(setContent)} /></label></div><label>Description<textarea name="description" value={content.description} onChange={updateObject(setContent)} rows="3" /></label><label>PDF file<input type="file" name="pdf" accept="application/pdf" onChange={updateObject(setContent)} /></label><button className="admin-submit" type="submit">Upload PDF</button></section></form>
    <form className="admin-form" onSubmit={publishTopic}><section className="admin-section"><h2>Interview topic</h2><p className="admin-help">Create a published topic first, then attach questions to it.</p><div className="admin-grid"><label>Topic name<input name="name" value={topic.name} onChange={updateObject(setTopic)} required /></label><label>Icon<input name="icon" value={topic.icon} onChange={updateObject(setTopic)} /></label><label>Display order<input name="display_order" type="number" min="0" value={topic.display_order} onChange={updateObject(setTopic)} /></label></div><label>Description<textarea name="description" value={topic.description} onChange={updateObject(setTopic)} rows="3" /></label><label>SEO title<input name="seo_title" value={topic.seo_title} onChange={updateObject(setTopic)} /></label><label>SEO description<textarea name="seo_description" value={topic.seo_description} onChange={updateObject(setTopic)} rows="2" /></label><label><input type="checkbox" name="is_published" checked={topic.is_published} onChange={updateObject(setTopic)} /> Publish topic</label><button className="admin-submit" type="submit">Publish topic</button></section></form>
    <form className="admin-form" onSubmit={publishQuestion}><section className="admin-section"><h2>Interview question</h2><div className="admin-grid"><label>Topic<select name="topic_id" value={question.topic_id} onChange={updateObject(setQuestion)} required><option value="">Select topic</option>{interviewTopics.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Question type<select name="question_type" value={question.question_type} onChange={updateObject(setQuestion)}><option value="conceptual">Conceptual</option><option value="coding">Coding</option><option value="technical">Technical</option><option value="sql">SQL Query</option><option value="scenario">Scenario Based</option><option value="behavioral">Behavioral</option></select></label><label>Difficulty<select name="difficulty" value={question.difficulty} onChange={updateObject(setQuestion)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label><label>Display order<input name="display_order" type="number" min="0" value={question.display_order} onChange={updateObject(setQuestion)} /></label></div><label>Title<input name="title" value={question.title} onChange={updateObject(setQuestion)} required /></label><label>Question<textarea name="question" value={question.question} onChange={updateObject(setQuestion)} rows="4" required /></label><label>Answer<textarea name="answer" value={question.answer} onChange={updateObject(setQuestion)} rows="5" /></label><label>Explanation<textarea name="explanation" value={question.explanation} onChange={updateObject(setQuestion)} rows="4" /></label><label>Example<textarea name="example" value={question.example} onChange={updateObject(setQuestion)} rows="3" /></label><label>Key points<textarea name="key_points" value={question.key_points} onChange={updateObject(setQuestion)} rows="3" /></label><div className="admin-interview-coding"><h3>Coding details</h3><label>Problem<textarea name="problem_statement" value={question.problem_statement} onChange={updateObject(setQuestion)} rows="3" /></label><div className="admin-grid"><label>Input<textarea name="input_format" value={question.input_format} onChange={updateObject(setQuestion)} rows="2" /></label><label>Output<textarea name="output_format" value={question.output_format} onChange={updateObject(setQuestion)} rows="2" /></label></div><label>Constraints<textarea name="constraints" value={question.constraints} onChange={updateObject(setQuestion)} rows="2" /></label><label>Code language<select value={question.code_examples[0]?.language || 'python'} onChange={(event) => setQuestion((current) => ({ ...current, code_examples: [{ language: event.target.value, code: current.code_examples[0]?.code || '', display_order: 0 }] }))}><option value="python">Python</option><option value="java">Java</option><option value="javascript">JavaScript</option><option value="c">C</option><option value="cpp">C++</option><option value="csharp">C#</option><option value="go">Go</option><option value="sql">SQL</option></select></label><label>Solution code<textarea value={question.code_examples[0]?.code || ''} onChange={(event) => setQuestion((current) => ({ ...current, code_examples: [{ language: current.code_examples[0]?.language || 'python', code: event.target.value, display_order: 0 }] }))} rows="8" /></label></div><label>Tags<input name="tags" value={question.tags} onChange={updateObject(setQuestion)} placeholder="lists, loops, python" /></label><label><input type="checkbox" name="is_published" checked={question.is_published} onChange={updateObject(setQuestion)} /> Publish question</label><button className="admin-submit" type="submit">Publish question</button></section></form>
    <form className="admin-form" onSubmit={saveAdsense}><section className="admin-section"><h2>AdSense</h2><label><input type="checkbox" name="enabled" checked={adsense.enabled} onChange={updateObject(setAdsense)} /> Enable AdSense</label><div className="admin-grid"><label>Publisher ID<input name="publisher_id" value={adsense.publisher_id} onChange={updateObject(setAdsense)} /></label><label>Home slot<input name="home_slot" value={adsense.home_slot} onChange={updateObject(setAdsense)} /></label><label>Job slot<input name="job_slot" value={adsense.job_slot} onChange={updateObject(setAdsense)} /></label><label>Content slot<input name="content_slot" value={adsense.content_slot} onChange={updateObject(setAdsense)} /></label><label>Interview slot<input name="interview_slot" value={adsense.interview_slot} onChange={updateObject(setAdsense)} /></label></div><button className="admin-submit" type="submit">Save AdSense</button></section></form>
  </div></div>
}
