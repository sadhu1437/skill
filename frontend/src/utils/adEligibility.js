const SURFACE_ROUTES = {
  home: /^\/$/,
  jobs_listing: /^\/jobs\/?$/,
  job_article: /^\/jobs\/[^/]+\/?$/,
  explore_listing: /^\/explore\/?$/,
  explore_article: /^\/explore\/[^/]+\/?$/,
  interview_index: /^\/interview\/?$/,
  interview_question: /^\/interview\/[^/]+\/[^/]+\/?$/,
}

export function isAdEligiblePath(pathname, surface) {
  if (typeof pathname !== 'string') return false
  const path = pathname.split(/[?#]/, 1)[0]
  if (!path) return false
  if (surface) return Boolean(SURFACE_ROUTES[surface]?.test(path))
  return Object.values(SURFACE_ROUTES).some((route) => route.test(path))
}
