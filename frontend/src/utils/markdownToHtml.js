function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[character]))
}

function formatInline(value) {
  const tokens = []
  let formatted = escapeHtml(value).replace(/`([^`]+)`/g, (_, code) => {
    tokens.push(`<code>${code}</code>`)
    return `\u0000${tokens.length - 1}\u0000`
  })

  formatted = formatted.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, text, url) => {
    tokens.push(`<a href="${url}">${text}</a>`)
    return `\u0000${tokens.length - 1}\u0000`
  })
  formatted = formatted
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/(^|[^_])_([^_\n]+)_(?!_)/g, '$1<em>$2</em>')

  return formatted.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)])
}

export function looksLikeMarkdown(value) {
  return /(\*\*|__|(^|[\s(])\*[^*\n]+\*(?=$|[\s).,!?:;])|(^|[\s(])_[^_\n]+_(?=$|[\s).,!?:;])|`[^`]+`|^\s{0,3}#{1,6}\s|^\s*[-*+]\s|^\s*\d+[.)]\s|^\s*>\s|^\s*```)/m.test(value)
}

export function markdownToHtml(value) {
  const lines = String(value || '').replace(/\r\n?/g, '\n').split('\n')
  const output = []
  let paragraph = []
  let listType = ''
  let quote = []
  let code = []

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
    if (code.length) output.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`)
    code = []
  }

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      flushParagraph()
      closeList()
      flushQuote()
      if (code.length || code.active) {
        flushCode()
        code.active = false
      } else {
        code.active = true
      }
      continue
    }
    if (code.active) {
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
  flushCode()
  return output.join('')
}
