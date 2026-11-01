import { describe, expect, it } from 'vitest'
import { isSafeLinkUrl, looksLikeMarkdown, markdownToHtml } from './markdownToHtml'

describe('markdownToHtml', () => {
  it('formats bold and italic text in paragraphs', () => {
    expect(markdownToHtml('**VCDP – Virtual Corporate Deployment Pool**\n\nThe *exact process* and _duration_ may vary.'))
      .toBe('<p><strong>VCDP – Virtual Corporate Deployment Pool</strong></p><p>The <em>exact process</em> and <em>duration</em> may vary.</p>')
  })

  it('converts headings, lists, and links', () => {
    expect(markdownToHtml('## Preparation\n\n- Review **skills**\n- [Official site](https://example.com)'))
      .toBe('<h2>Preparation</h2><ul><li>Review <strong>skills</strong></li><li><a href="https://example.com" target="_blank" rel="noopener noreferrer">Official site</a></li></ul>')
  })

  it('converts the provided hiring report markdown without leaving syntax behind', () => {
    const html = markdownToHtml(`# India IT Hiring Report 2026
**Updated: 1 November 2026**

## 1. Tata Consultancy Services (TCS)

- Q2 net employee additions: **4,258**
- Freshers onboarded: **24,000**

## 2. Infosys

- FY27 fresher hiring target: **20,000 graduates**
Official website: [https://www.infosys.com](https://www.infosys.com/)`)

    expect(html).toContain('<h1>India IT Hiring Report 2026</h1>')
    expect(html).toContain('<strong>Updated: 1 November 2026</strong>')
    expect(html).toContain('<h2>1. Tata Consultancy Services (TCS)</h2>')
    expect(html).toContain('<ul><li>Q2 net employee additions: <strong>4,258</strong></li><li>Freshers onboarded: <strong>24,000</strong></li></ul>')
    expect(html).toContain('<a href="https://www.infosys.com/" target="_blank" rel="noopener noreferrer">https://www.infosys.com</a>')
    expect(html).not.toMatch(/(?:^|\W)(?:#{1,6}\s|\*\*|~~)/)
  })

  it('formats strikethrough, code blocks, quotes, and horizontal rules', () => {
    expect(markdownToHtml('~~deprecated~~\n\n> Keep this safe.\n\n---\n\n```js\nalert("safe")\n```'))
      .toContain('<p><s>deprecated</s></p><blockquote><p>Keep this safe.</p></blockquote><hr><pre><code>alert(&quot;safe&quot;)</code></pre>')
  })

  it('auto-links safe URLs and leaves unsafe protocols as text', () => {
    expect(markdownToHtml('Visit https://www.tcs.com and javascript:alert(1)'))
      .toContain('<a href="https://www.tcs.com" target="_blank" rel="noopener noreferrer">https://www.tcs.com</a>')
    expect(markdownToHtml('[unsafe](javascript:alert(1))')).not.toContain('<a ')
    expect(isSafeLinkUrl('https://www.infosys.com/careers')).toBe(true)
    expect(isSafeLinkUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeLinkUrl('data:text/html,unsafe')).toBe(false)
  })

  it('escapes HTML while preserving markdown formatting', () => {
    expect(markdownToHtml('<script>alert(1)</script>\n\n**Safe**'))
      .toBe('<p>&lt;script&gt;alert(1)&lt;/script&gt;</p><p><strong>Safe</strong></p>')
  })

  it('detects markdown markers in plain pasted text', () => {
    expect(looksLikeMarkdown('**Bold heading**')).toBe(true)
    expect(looksLikeMarkdown('*Italic text*')).toBe(true)
    expect(looksLikeMarkdown('~~Removed text~~')).toBe(true)
    expect(looksLikeMarkdown('https://www.tcs.com')).toBe(true)
    expect(looksLikeMarkdown('Plain paragraph text')).toBe(false)
  })
})
