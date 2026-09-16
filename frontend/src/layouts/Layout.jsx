import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const navigation = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/jobs', 'Jobs'],
  ['/pdfs', 'Learning PDFs'],
  ['/interview', 'Interview Questions'],
  ['/explore', 'Explore'],
  ['/contact', 'Contact'],
]

export default function Layout({ children }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const signedIn = Boolean(localStorage.getItem('skillbloom_access_token'))

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return undefined
    const closeOnEscape = (event) => { if (event.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', closeOnEscape)
    document.body.classList.add('menu-open')
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.classList.remove('menu-open')
    }
  }, [menuOpen])

  const authPath = signedIn ? '/account' : `/login?next=${encodeURIComponent(location.pathname)}`

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" className="brand" aria-label="SkillBloom home">
            <span className="brand-mark" aria-hidden="true" />
            <span>Skill<span className="brand-accent">Bloom</span></span>
          </Link>
          <nav className="nav" aria-label="Main navigation">
            {navigation.map(([path, label]) => <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => isActive ? 'active' : ''}>{label}</NavLink>)}
            <NavLink to={authPath} className={({ isActive }) => isActive ? 'active' : ''}>{signedIn ? 'Account' : 'Sign in'}</NavLink>
          </nav>
          <Link to="/jobs" className="primary-btn topbar-cta">Explore Jobs</Link>
          <button className={`menu-toggle${menuOpen ? ' is-open' : ''}`} type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
        </div>
        <div className={`mobile-backdrop${menuOpen ? ' is-visible' : ''}`} aria-hidden="true" onClick={() => setMenuOpen(false)} />
        <nav id="mobile-navigation" className={`mobile-drawer${menuOpen ? ' is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!menuOpen}>
          <div className="mobile-drawer-header"><span>Explore SkillBloom</span><button type="button" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)}>×</button></div>
          {navigation.map(([path, label]) => <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => isActive ? 'active' : ''}>{label}</NavLink>)}
          <NavLink to={authPath} className={({ isActive }) => `mobile-auth-link${isActive ? ' active' : ''}`}>{signedIn ? 'Account' : 'Sign in'}</NavLink>
          <Link to="/jobs" className="primary-btn mobile-drawer-cta">Explore Jobs</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="brand"><span className="brand-mark" aria-hidden="true" /> Skill<span className="brand-accent">Bloom</span></div>
            <p>SkillBloom helps you prepare for success with access to jobs, interview questions, downloadable PDFs, and career support.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <p><Link to="/">Home</Link></p>
            <p><Link to="/jobs">Jobs</Link></p>
            <p><Link to="/pdfs">PDF Library</Link></p>
            <p><Link to="/interview">Interview Prep</Link></p>
          </div>
          <div>
            <h4>Company</h4>
            <p><Link to="/about">About</Link></p>
            <p><Link to="/privacy-policy">Privacy Policy</Link></p>
            <p><Link to="/contact">Contact</Link></p>
            <p><Link to="/disclaimer">Disclaimer</Link></p>
          </div>
          <div>
            <h4>Community</h4>
            <p><a href="https://t.me/ytsmart1437" target="_blank" rel="noreferrer">Telegram</a></p>
            <p><a href="https://youtube.com/@ytsmart143?si=RArtu08pGPesGzmW" target="_blank" rel="noreferrer">YouTube</a></p>
            <p><a href="https://whatsapp.com/channel/0029VarQwSyLo4hciv8S3t04" target="_blank" rel="noreferrer">WhatsApp</a></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
