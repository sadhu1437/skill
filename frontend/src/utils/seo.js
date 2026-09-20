const SITE_NAME = 'SkillBloom Education'
const DEFAULT_IMAGE = 'https://www.ascentrasolutions.in/assets/images/aseducation_logo.webp'

function setMeta(attribute, key, content) {
  let tag = document.querySelector(`meta[${attribute}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.appendChild(tag)
  }
  tag.content = content
}

export function setSeo({ title, description, keywords = '', path = window.location.pathname, type = 'website', structuredData }) {
  document.title = title

  setMeta('name', 'description', description)
  setMeta('name', 'keywords', keywords)
  setMeta('name', 'robots', 'index, follow, max-image-preview:large')

  let canonical = document.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = `${window.location.origin}${path}`

  setMeta('property', 'og:type', type)
  setMeta('property', 'og:site_name', SITE_NAME)
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:url', canonical.href)
  setMeta('property', 'og:image', DEFAULT_IMAGE)
  setMeta('name', 'twitter:card', 'summary_large_image')
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', description)
  setMeta('name', 'twitter:image', DEFAULT_IMAGE)

  let schema = document.querySelector('script[data-seo-schema]')
  if (!schema) {
    schema = document.createElement('script')
    schema.type = 'application/ld+json'
    schema.dataset.seoSchema = 'true'
    document.head.appendChild(schema)
  }
  schema.textContent = JSON.stringify(structuredData || {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: canonical.href,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: window.location.origin },
  })
}
