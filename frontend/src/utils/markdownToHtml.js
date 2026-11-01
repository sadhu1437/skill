function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[character]))
}

export function isSafeLinkUrl(value) {
  const url = String(value || '').trim()
  if (!url || /[\u0000-\u001f\u007f]/.test(url)) return false
  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url)
      return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.hostname)
    } catch {
      return false
    }
  }
  return !/^[a-z][a-z\d+.-]*:/i.test(url) && !url.startsWith('//')
}

function formatInline(value) {
  const tokens = []
  const addToken = (html) => {
    tokens.push(html)
    return `\u0000${tokens.length - 1}\u0000`
  }
  let formatted = escapeHtml(value).replace(/`([^`]+)`/g, (_, code) => addToken(`<code>${code}</code>`))

  formatted = formatted.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, text, url) => (
    isSafeLinkUrl(url)
      ? addToken(`<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`)
      : match
  ))
  formatted = formatted.replace(/https?:\/\/[^\s<>"']+/gi, (match) => {
    const url = match.replace(/[.,!?;:]+$/, '')
    const trailing = match.slice(url.length)
    const balancedUrl = url.endsWith(')') && (url.match(/\(/g) || []).length < (url.match(/\)/g) || []).length
      ? url.slice(0, -1)
      : url
    const balancedTrailing = url.slice(balancedUrl.length) + trailing
    return isSafeLinkUrl(balancedUrl)
      ? `${addToken(`<a href="${balancedUrl}" target="_blank" rel="noopener noreferrer">${balancedUrl}</a>`)}${balancedTrailing}`
      : match
  })

  formatted = formatted
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/(^|[^_])_([^_\n]+)_(?!_)/g, '$1<em>$2</em>')

  return formatted.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)])
}

export function looksLikeMarkdown(value) {
  return /(?:\*\*|__|~~|(^|[\s(])\*[^*\n]+\*(?=$|[\s).,!?:;])|(^|[\s(])_[^_\n]+_(?=$|[\s).,!?:;])|`[^`]+`|^\s{0,3}#{1,6}\s|^\s*[-*+]\s|^\s*\d+[.)]\s|^\s*>\s|^\s*(?:---+|___+|\*\*\*+)\s*$|^\s*```|https?:\/\/[^\s<>"']+)/m.test(value)
}

export function markdownToHtml(value) {
  const lines = String(value || '').replace(/\r\n?/g, '\n').split('\n')
  const output = []
  let paragraph = []
  let listType = ''
  let quote = []
  let code = []
  let codeActive = false

  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${paragraph.map(formatInline).join('<br>')}</p>`)
    paragraph = []
  }
  const closeList = () => {
    if (listType) output.push(`</${listType}>`)
    listType = ''
  }
  const flushQuote = () => {
    if (quote.length) output.push(`<blockquote><p>${quote.map(formatInline).join('<br>')}</p></blockquote>`)
    quote = []
  }
  const flushCode = () => {
    output.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`)
    code = []
  }

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      flushParagraph()
      closeList()
      flushQuote()
      if (codeActive) flushCode()
      codeActive = !codeActive
      continue
    }
    if (codeActive) {
      code.push(line)
      continue
    }

    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/)
    const unordered = line.match(/^\s*[-*+]\s+(.+)$/)
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/)
    const quoted = line.match(/^\s*>\s?(.*)$/)

    if (!line.trim()) {
      flushParagraph()
      closeList()
      flushQuote()
      continue
    }
    if (heading) {
      flushParagraph()
      closeList()
      flushQuote()
      output.push(`<h${heading[1].length}>${formatInline(heading[2])}</h${heading[1].length}>`)
      continue
    }
    if (/^\s*(?:---+|___+|\*\*\*+)\s*$/.test(line)) {
      flushParagraph()
      closeList()
      flushQuote()
      output.push('<hr>')
      continue
    }
    if (unordered || ordered) {
      flushParagraph()
      flushQuote()
      const nextListType = unordered ? 'ul' : 'ol'
      if (listType !== nextListType) {
        closeList()
        output.push(`<${nextListType}>`)
        listType = nextListType
      }
      output.push(`<li>${formatInline((unordered || ordered)[1])}</li>`)
      continue
    }
    if (quoted) {
      flushParagraph()
      closeList()
      quote.push(quoted[1])
      continue
    }
    closeList()
    flushQuote()
    paragraph.push(line)
  }

  flushParagraph()
  closeList()
  flushQuote()
  if (codeActive || code.length) flushCode()
  return output.join('')
}
