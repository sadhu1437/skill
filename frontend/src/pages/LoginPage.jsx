import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { requestJson } from '../api/client'
import './auth.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const next = new URLSearchParams(location.search).get('next') || '/account'
  const [form, setForm] = useState({ email: '', password: '' })
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
      const data = await requestJson('/auth/login/', { method: 'POST', body: JSON.stringify(form) })
      localStorage.setItem('skillbloom_access_token', data.access)
      if (data.refresh) localStorage.setItem('skillbloom_refresh_token', data.refresh)
      navigate(next, { replace: true })
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in with those details.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="auth-page"><section className="auth-card"><p className="auth-kicker">Welcome back</p><h1>Sign in to SkillBloom</h1><p className="auth-intro">Access account features when you need them. You can continue browsing publicly without signing in.</p><form onSubmit={submit}><label>Email address<input name="email" type="email" value={form.email} onChange={update} autoComplete="email" required /></label><label>Password<input name="password" type="password" value={form.password} onChange={update} autoComplete="current-password" required /></label><button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button></form>{error && <p className="auth-error">{error}</p>}<p className="auth-switch">New to SkillBloom? <Link to={`/register?next=${encodeURIComponent(next)}`}>Create an account</Link></p></section></main>
}
