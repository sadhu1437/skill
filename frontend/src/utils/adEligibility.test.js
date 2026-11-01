import { describe, expect, it } from 'vitest'
import { isAdEligiblePath } from './adEligibility'

describe('isAdEligiblePath', () => {
  it.each([
    ['/', 'home'],
    ['/jobs', 'jobs_listing'],
    ['/jobs/', 'jobs_listing'],
    ['/jobs/java-developer', 'job_article'],
    ['/jobs/java-developer/', 'job_article'],
    ['/jobs/graduate-engineer', 'job_article'],
    ['/jobs/graduate-engineer/', 'job_article'],
    ['/jobs/graduate-engineer?ref=home#details', 'job_article'],
    ['/explore', 'explore_listing'],
    ['/explore/', 'explore_listing'],
    ['/explore/python', 'explore_article'],
    ['/explore/hiring-report-2026', 'explore_article'],
    ['/explore/python?source=nav#section', 'explore_article'],
    ['/interview', 'interview_index'],
    ['/interview/', 'interview_index'],
    ['/interview/java/oops', 'interview_question'],
    ['/interview/python/lists', 'interview_question'],
    ['/interview/java/oops#answer', 'interview_question'],
  ])('allows %s for %s', (pathname, surface) => {
    expect(isAdEligiblePath(pathname, surface)).toBe(true)
  })

  it.each([
    '/',
    '/jobs',
    '/jobs/graduate-engineer',
    '/explore',
    '/explore/hiring-report-2026',
    '/interview',
    '/interview/python/lists',
  ])('recognizes an eligible route family at %s', (pathname) => {
    expect(isAdEligiblePath(pathname)).toBe(true)
  })

  it.each([
    ['/about', 'home'],
    ['/jobs', 'job_article'],
    ['/jobs/graduate-engineer', 'jobs_listing'],
    ['/explore', 'explore_article'],
    ['/explore/hiring-report-2026', 'explore_listing'],
    ['/interview/python/lists', 'interview_index'],
    ['/interview/python', 'interview_question'],
    ['/jobs/java-developer/apply', 'job_article'],
    ['/jobs/java-developer/apply', undefined],
    ['/interview/topic/question', 'interview_index'],
    '/explore/search/results',
    '/admin-panel',
    '/admin-panel/explore',
    '/login',
    '/register',
    '/account',
    '/account/settings',
    '/pdfs',
    '/pdfs/learning-resource',
    '/pdfs/sample.pdf',
    '/privacy-policy',
    '/ai-tech',
    '/contact',
    '/disclaimer',
    '/unknown-route',
    '/jobs/graduate-engineer//',
  ])('does not allow excluded path %s', (input) => {
    const [pathname, surface] = Array.isArray(input) ? input : [input, undefined]
    expect(isAdEligiblePath(pathname, surface)).toBe(false)
  })

  it.each([
    ['/jobs?ref=home#top', 'jobs_listing'],
    ['/explore/python?ref=home#top', 'explore_article'],
    ['/interview/java/oops?ref=home#answer', 'interview_question'],
  ])('strips query strings and fragments before matching %s', (pathname, surface) => {
    expect(isAdEligiblePath(pathname, surface)).toBe(true)
  })

  it.each([undefined, null, '', '?ref=home', '/jobs//', '/interview/java/oops/extra'])(
    'rejects malformed or missing paths %s',
    (pathname) => {
      expect(isAdEligiblePath(pathname)).toBe(false)
    },
  )

  it('rejects unknown surfaces', () => {
    expect(isAdEligiblePath('/jobs', 'unknown_surface')).toBe(false)
  })
})
