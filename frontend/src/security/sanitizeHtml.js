import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
  'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr',
]

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'width', 'height', 'target', 'rel']

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]))
}

export function sanitizeHtml(value) {
  const content = String(value || '')
  const hasMarkup = /<\/?[a-z][\s\S]*>/i.test(content)
  const normalizedContent = hasMarkup
    ? content
    : content.split(/\n\s*\n/).filter(Boolean).map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\r?\n/g, '<br>')}</p>`).join('')

  return DOMPurify.sanitize(normalizedContent, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['iframe', 'object', 'embed', 'form', 'input', 'textarea', 'button'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-]|$))/i,
  })
}
