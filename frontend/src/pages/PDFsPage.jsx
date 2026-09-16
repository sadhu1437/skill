import './pdfs.css'
import AdSlot from '../components/AdSlot'

const pdfs = [
  { title: 'Aptitude Practice Set', category: 'Aptitude', description: 'Quantitative aptitude with solutions - Beginner to Advanced', path: '/source-site/assets/pdfs/100_aptitude_trick.pdf' },
  { title: 'C Programming', category: 'C', description: 'A comprehensive C programming guide suitable for beginners, developers, and professionals alike', path: '/source-site/assets/library/c.html' },
  { title: 'Java Programming', category: 'Java', description: 'A comprehensive Java programming guide suitable for beginners, developers, and professionals alike', path: '/source-site/assets/library/java.html' },
  { title: 'Python Programming', category: 'Python', description: 'A comprehensive Python programming guide suitable for beginners, developers, and professionals alike', path: '/source-site/assets/library/python.html' },
  { title: 'C++ Programming', category: 'C++', description: 'A comprehensive C++ programming guide suitable for beginners, developers, and professionals alike', path: '/source-site/assets/library/cpp.html' },
  { title: 'C# Programming', category: 'C#', description: 'A comprehensive C# programming guide suitable for beginners, developers, and professionals alike', path: '/source-site/assets/library/csharp.html' },
  { title: 'Bootstrap Programming', category: 'Bootstrap', description: 'A comprehensive Bootstrap programming guide suitable for beginners, developers, and professionals alike', path: '/source-site/assets/library/bootstrap.html' },
  { title: 'HTML', category: 'HTML', description: 'A comprehensive HTML guide suitable for beginners, developers, and professionals alike', path: '/source-site/assets/library/html.html' },
  { title: 'CSS', category: 'CSS', description: 'A comprehensive CSS guide suitable for beginners, developers, and professionals alike', path: '/source-site/assets/library/css.html' },
  { title: 'JAVASCRIPT', category: 'JavaScript', description: 'A comprehensive JAVASCRIPT guide suitable for beginners, developers, and professionals alike', path: '/source-site/assets/library/javascript.html' },
  { title: 'React JS', category: 'React', description: 'A comprehensive React JS guide suitable for beginners, developers, and professionals alike', path: '/source-site/assets/library/reactjs.html' },
]

export default function PDFsPage() {
  return (
    <div className="section__container resource-page pdf-page">
      <h2 className="section__header"><span>Learning</span> PDFs</h2>
      <p className="section__description">Download curated PDF resources for programming, aptitude, interviews, and placement preparation.</p>

      <AdSlot slot="content_slot" className="pdfs-ad-slot" />

      <div className="explore__grid">
        {pdfs.map((pdf) => (
          <div key={pdf.title} className="explore__card">
            <span>📄</span>
            <h4>{pdf.title}</h4>
            <span className="resource-category">{pdf.category}</span>
            <p>{pdf.description}</p>
            <a href={pdf.path} className="resource-link">Download PDF</a>
          </div>
        ))}
      </div>
    </div>
  )
}
