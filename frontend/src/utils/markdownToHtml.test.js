import { describe, expect, it } from 'vitest'
import { looksLikeMarkdown, markdownToHtml } from './markdownToHtml'

describe('markdownToHtml', () => {
  it('formats bold and italic text in paragraphs', () => {
    expect(markdownToHtml('**VCDP – Virtual Corporate Deployment Pool**\n\nThe *exact process* and _duration_ may vary.'))
      .toBe('<p><strong>VCDP – Virtual Corporate Deployment Pool</strong></p><p>The <em>exact process</em> and <em>duration</em> may vary.</p>')
  })

  it('converts headings, lists, and links', () => {
    expect(markdownToHtml('## Preparation\n\n- Review **skills**\n- [Official site](https://example.com)'))
      .toBe('<h2>Preparation</h2><ul><li>Review <strong>skills</strong></li><li><a href="https://example.com">Official site</a></li></ul>')
  })

  it('escapes HTML while preserving markdown formatting', () => {
    expect(markdownToHtml('<script>alert(1)</script>\n\n**Safe**'))
      .toBe('<p>&lt;script&gt;alert(1)&lt;/script&gt;</p><p><strong>Safe</strong></p>')
  })

  it('detects markdown markers in plain pasted text', () => {
    expect(looksLikeMarkdown('**Bold heading**')).toBe(true)
    expect(looksLikeMarkdown('*Italic text*')).toBe(true)
    expect(looksLikeMarkdown('Plain paragraph text')).toBe(false)
  })
})
