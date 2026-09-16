import './about.css'

export default function AboutPage() {
  return (
    <div className="section__container content-page about-page">
      <h2 className="section__header"><span>About</span> SkillBloom</h2>
      <div className="content-panel">
        <p><strong>SkillBloom</strong> was created with a simple mission — to empower students, job seekers, and professionals with curated resources that simplify job preparation and accelerate career growth.</p>
        <h3>🌱 Our Journey</h3>
        <p>What started as a small initiative to share interview questions has now grown into a complete platform offering job listings, educational PDFs, coding practice, hiring process details, mentorship programs, placement guidance, and more.</p>
        <h3>🚀 What We Offer</h3>
        <div className="meta-list">
          <span className="meta-pill">PDF Library</span>
          <span className="meta-pill">Interview Questions</span>
          <span className="meta-pill">Job Opportunities</span>
          <span className="meta-pill">Career Roadmaps</span>
          <span className="meta-pill">Hiring Patterns</span>
          <span className="meta-pill">Free Courses</span>
          <span className="meta-pill">Mentorship</span>
          <span className="meta-pill">Coding Practice</span>
          <span className="meta-pill">Community Support</span>
        </div>
        <h3>📚 Our Learning Philosophy</h3>
        <p>We believe that every learner deserves high-quality, accessible, and practical content. That’s why we provide well-organized resources that are easy to follow.</p>
        <h3>🎯 Why Choose Us?</h3>
        <p>We don’t just share PDFs — we provide structured content for self-paced preparation. Whether you’re preparing for Cognizant, Infosys, Wipro, or Google interviews, our content is practical and industry-relevant.</p>
      </div>
    </div>
  )
}
