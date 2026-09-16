export function setSeo({ title, description, path = window.location.pathname }) {
  document.title = title

  let descriptionTag = document.querySelector('meta[name="description"]')
  if (!descriptionTag) {
    descriptionTag = document.createElement('meta')
    descriptionTag.name = 'description'
    document.head.appendChild(descriptionTag)
  }
  descriptionTag.content = description

  let canonical = document.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = `${window.location.origin}${path}`
}
