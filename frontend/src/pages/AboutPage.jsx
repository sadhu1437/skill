import './about.css'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { setSeo } from '../utils/seo'

export default function AboutPage() {
  useEffect(() => {
    setSeo({ title: 'About SkillBloom Education | Career Learning Platform', description: 'Discover how SkillBloom helps students, fresh graduates, and job seekers prepare for their next career step with learning resources, interview preparation, and job opportunities.', keywords: 'about SkillBloom, education platform, career learning, student resources, placement preparation', path: '/about' })
  }, [])

  return (
    <div className="section__container content-page about-page">
      <h2 className="section__header"><span>About</span> SkillBloom Education</h2>
      <p className="section__description about-intro">
        Practical resources to help you learn with purpose, prepare with confidence, and take your next step.
      </p>

      <div className="content-panel">
        <section className="about-section">
          <h3>Our Mission</h3>
          <p>
            <strong>SkillBloom Education</strong> brings useful career and learning resources together in one place.
            Preparing for a first job can mean juggling interview practice, new skills, and searching for suitable
            openings. We make those next steps easier to explore with organized content designed for self-paced learning.
          </p>
          <p>
            Our goal is to make career preparation feel more approachable: start with what you need, build a steady
            learning routine, and use the resources that fit your goals.
          </p>
        </section>

        <section className="about-section">
          <h3>Who We’re Here For</h3>
          <div className="about-card-grid">
            <article className="about-card">
              <h4>Students</h4>
              <p>Explore study material, practice questions, and career paths while building a foundation for your first role.</p>
            </article>
            <article className="about-card">
              <h4>Fresh graduates</h4>
              <p>Prepare for placement and entry-level opportunities with interview topics, coding practice, and job listings.</p>
            </article>
            <article className="about-card">
              <h4>Job seekers</h4>
              <p>Refresh your skills, learn about hiring processes, and keep an eye on opportunities that match your interests.</p>
            </article>
          </div>
        </section>

        <section className="about-section">
          <h3>Explore the Platform</h3>
          <p>Choose a resource based on the step you’re working on today:</p>
          <div className="about-card-grid">
            <article className="about-card">
              <h4><Link to="/jobs">Job opportunities</Link></h4>
              <p>Browse published openings and review the role details and application information.</p>
            </article>
            <article className="about-card">
              <h4><Link to="/pdfs">Learning PDFs</Link></h4>
              <p>Find organized study material to support your learning and preparation.</p>
            </article>
            <article className="about-card">
              <h4><Link to="/interview">Interview preparation</Link></h4>
              <p>Review topic-based questions and explanations to practise communicating what you know.</p>
            </article>
            <article className="about-card">
              <h4><Link to="/ai-tech">AI &amp; technology</Link></h4>
              <p>Explore technology-focused content and keep learning about a changing industry.</p>
            </article>
            <article className="about-card">
              <h4><Link to="/explore">Explore articles</Link></h4>
              <p>Read articles on technology, careers, tools, and learning.</p>
            </article>
            <article className="about-card">
              <h4>Career preparation</h4>
              <p>Use coding practice, roadmaps, and hiring insights to guide your independent preparation.</p>
            </article>
          </div>
        </section>

        <section className="about-section">
          <h3>A Practical Approach to Learning</h3>
          <ol className="about-steps">
            <li><strong>Choose a goal.</strong> Decide what you want to work on, such as a technical topic, an interview, or finding an opportunity.</li>
            <li><strong>Find a useful resource.</strong> Browse the relevant section and pick material that matches your current level and needs.</li>
            <li><strong>Practise consistently.</strong> Set aside focused time to read, solve problems, and explain concepts in your own words.</li>
            <li><strong>Take your next step.</strong> Keep building your skills and check role details carefully when you apply for a job.</li>
          </ol>
        </section>

        <section className="about-section">
          <h3>What We Value</h3>
          <ul className="about-values">
            <li><strong>Useful learning:</strong> Resources should help you take a practical next step.</li>
            <li><strong>Accessible guidance:</strong> Clear organization makes it easier to find a place to begin.</li>
            <li><strong>Independent growth:</strong> Learn at your own pace and revisit topics as your goals evolve.</li>
            <li><strong>Informed choices:</strong> Review the details of each opportunity and use official application sources where provided.</li>
          </ul>
        </section>

        <section className="about-section about-note">
          <h3>A Note About Opportunities</h3>
          <p>
            SkillBloom is a learning and information platform. Job availability, eligibility, deadlines, and selection
            processes can change, so always confirm the latest details with the hiring organization before applying.
            Using the resources here can support your preparation, but no resource or listing can guarantee an interview,
            selection, or job offer.
          </p>
        </section>

        <section className="about-section">
          <h3>Frequently Asked Questions</h3>
          <div className="about-faq">
            <article>
              <h4>Where should I start?</h4>
              <p>Start with the area closest to your current goal: browse <Link to="/jobs">jobs</Link>, explore <Link to="/pdfs">learning PDFs</Link>, or begin with <Link to="/interview">interview topics</Link>.</p>
            </article>
            <article>
              <h4>Can I learn at my own pace?</h4>
              <p>Yes. Explore the available resources in the order that works for you, and return to topics whenever you want to practise again.</p>
            </article>
            <article>
              <h4>How can I ask a question or share feedback?</h4>
              <p>We welcome questions, suggestions, and feedback through our <Link to="/contact">Contact page</Link>.</p>
            </article>
          </div>
        </section>

        <section className="about-section about-cta">
          <h3>Ready to take your next step?</h3>
          <p>Explore the resources and opportunities that best fit your learning and career goals.</p>
          <div className="about-actions">
            <Link to="/jobs" className="btn">Browse Jobs</Link>
            <Link to="/interview" className="btn about-secondary-btn">Prepare for Interviews</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
