import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { requestJson } from '../api/client'
import './auth.css'

export default function AccountPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    requestJson('/auth/me/').then(setUser).catch(() => { setError('Your session has expired.'); navigate('/login?next=/account', { replace: true }) })
  }, [navigate])

  function logout() {
    localStorage.removeItem('skillbloom_access_token')
    localStorage.removeItem('skillbloom_refresh_token')
    navigate('/', { replace: true })
  }

  if (error || !user) return <main className="auth-page"><section className="auth-card"><p>{error || 'Loading account...'}</p></section></main>
  return <main className="auth-page"><section className="auth-card"><p className="auth-kicker">Your account</p><h1>Welcome, {user.username || user.email}</h1><p className="auth-intro">You are signed in. Public content remains available to everyone, with account-only tools protected behind this session.</p><div className="account-details"><span>Email</span><strong>{user.email}</strong><span>Account type</span><strong>{user.is_staff ? 'Staff account' : 'Member account'}</strong></div>{user.is_staff && <Link className="auth-submit auth-secondary-link" to="/admin-panel/explore">Open Explore CMS</Link>}<button className="auth-submit" type="button" onClick={logout}>Log out</button></section></main>
}
