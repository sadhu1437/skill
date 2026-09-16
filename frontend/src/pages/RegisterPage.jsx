import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { requestJson } from '../api/client'
import './auth.css'

export default function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const next = new URLSearchParams(location.search).get('next') || '/account'
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await requestJson('/auth/register/', { method: 'POST', body: JSON.stringify(form) })
      navigate(`/login?next=${encodeURIComponent(next)}&registered=1`, { replace: true })
    } catch (registerError) {
      setError(Object.values(registerError).flat?.().join(' ') || registerError.message || 'Unable to create your account.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="auth-page"><section className="auth-card"><p className="auth-kicker">Start your journey</p><h1>Create your SkillBloom account</h1><p className="auth-intro">An account is optional. Public jobs, PDFs, and interview content remain available without signing in.</p><form onSubmit={submit}><label>Username<input name="username" value={form.username} onChange={update} autoComplete="username" required /></label><label>Email address<input name="email" type="email" value={form.email} onChange={update} autoComplete="email" required /></label><label>Password<input name="password" type="password" value={form.password} onChange={update} autoComplete="new-password" minLength="8" required /></label><button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button></form>{error && <p className="auth-error">{error}</p>}<p className="auth-switch">Already have an account? <Link to={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link></p></section></main>
}
