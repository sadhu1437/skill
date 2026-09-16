import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './layouts/Layout'

const HomePage = lazy(() => import('./pages/HomePage'))
const JobsPage = lazy(() => import('./pages/JobsPage'))
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'))
const AIPage = lazy(() => import('./pages/AIPage'))
const PDFsPage = lazy(() => import('./pages/PDFsPage'))
const PDFDetailPage = lazy(() => import('./pages/PDFDetailPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const InterviewPage = lazy(() => import('./pages/InterviewPage'))
const InterviewTopicPage = lazy(() => import('./pages/InterviewTopicPage'))
const InterviewQuestionPage = lazy(() => import('./pages/InterviewQuestionPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const ExplorePage = lazy(() => import('./pages/ExplorePage'))
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'))
const ExploreAdminPage = lazy(() => import('./pages/ExploreAdminPage'))

function ProtectedRoute({ children }) {
  const location = useLocation()
  if (!localStorage.getItem('skillbloom_access_token')) {
    const next = `${location.pathname}${location.search}`
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
  }
  return children
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<main className="page-loading" aria-busy="true" />}>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:slug" element={<JobDetailPage />} />
        <Route path="/ai-tech" element={<AIPage />} />
        <Route path="/pdfs" element={<PDFsPage />} />
        <Route path="/pdfs/:slug" element={<PDFDetailPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/interview/:topicSlug/:questionSlug" element={<InterviewQuestionPage />} />
        <Route path="/interview/:topicSlug" element={<InterviewTopicPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/explore/:slug" element={<ArticleDetailPage />} />
        <Route path="/privacy-policy" element={<PrivacyPage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/admin-panel" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/admin-panel/explore" element={<ProtectedRoute><ExploreAdminPage /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
