import './ai.css'

const aiPosts = [
  { title: 'Latest AI News', tag: 'news', summary: 'Stay updated on the newest AI developments and breakthrough research.' },
  { title: 'AI Tools', tag: 'tool', summary: 'Discover productivity AI tools and developer-focused automation platforms.' },
  { title: 'Weekly AI Roundup', tag: 'weekly', summary: 'A concise roundup of AI product launches, industry shifts, and trends.' },
  { title: 'Developer News', tag: 'developer', summary: 'Learn about new frameworks, tools, and engineering updates from the AI ecosystem.' },
  { title: 'Career & Industry Trends', tag: 'career', summary: 'Understand how AI is reshaping roles, hiring, and career opportunities.' },
  { title: 'Technology Explained', tag: 'explained', summary: 'Deep-dive explainers on fast-moving technology topics and breakthroughs.' },
]

export default function AIPage() {
  return (
    <div className="section__container resource-page ai-page">
      <h2 className="section__header"><span>AI &amp; Tech</span> Updates</h2>
      <p className="section__description">Read the latest AI news, developer updates, company shifts, tools, and industry trends curated in one place.</p>

      <div className="explore__grid">
        {aiPosts.map((post) => (
          <div key={post.title} className="explore__card">
            <span>🧠</span>
            <h4>{post.title}</h4>
            <p>{post.tag}</p>
            <p>{post.summary}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
