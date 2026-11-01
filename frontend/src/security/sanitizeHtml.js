import DOMPurify from 'dompurify'
import { looksLikeMarkdown, markdownToHtml } from '../utils/markdownToHtml'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'del', 'strike', 'a', 'ul', 'ol', 'li',
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
    : looksLikeMarkdown(content)
      ? markdownToHtml(content)
      : content.split(/\n\s*\n/).filter(Boolean).map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\r?\n/g, '<br>')}</p>`).join('')

  const sanitized = DOMPurify.sanitize(normalizedContent, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['iframe', 'object', 'embed', 'form', 'input', 'textarea', 'button'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?):|\/(?!\/)|#|\?|\.\.?\/|[a-z0-9._~-]+(?:\/|$))/i,
  })

  const template = document.createElement('template')
  template.innerHTML = sanitized
  template.content.querySelectorAll('a[href]').forEach((link) => {
    let url
    try {
      url = new URL(link.getAttribute('href'), window.location.origin)
    } catch {
      link.removeAttribute('href')
      return
    }

    if (!['http:', 'https:'].includes(url.protocol)) {
      link.removeAttribute('href')
      link.removeAttribute('target')
      link.removeAttribute('rel')
      return
    }
    if ((url.protocol === 'http:' || url.protocol === 'https:') && url.origin !== window.location.origin) {
      link.setAttribute('target', '_blank')
      link.setAttribute('rel', 'noopener noreferrer')
    } else {
      link.removeAttribute('target')
      link.removeAttribute('rel')
    }
  })
  return template.innerHTML
}
