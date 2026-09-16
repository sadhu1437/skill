import { useState } from 'react'
import hljs from 'highlight.js/lib/common'

export default function InterviewCodeBlock({ example }) {
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    await navigator.clipboard?.writeText(example.code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const language = example.language === 'csharp' ? 'csharp' : example.language === 'cpp' ? 'cpp' : example.language
  const highlightedCode = hljs.getLanguage(language)
    ? hljs.highlight(example.code, { language }).value
    : hljs.highlightAuto(example.code).value

  return <div className="interview-code-block"><div className="interview-code-header"><span>{example.language}</span><button type="button" onClick={copyCode}>{copied ? 'Copied' : 'Copy code'}</button></div><pre><code className={`hljs language-${example.language}`} dangerouslySetInnerHTML={{ __html: highlightedCode }} /></pre></div>
}
