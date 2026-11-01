import { describe, expect, it } from 'vitest'
import { meetsArticleAdContentThresholds } from '../utils/articleAdEligibility'

describe('in-article content eligibility thresholds', () => {
  it('rejects empty and insufficient article content', () => {
    expect(meetsArticleAdContentThresholds(0, [])).toBe(false)
    expect(meetsArticleAdContentThresholds(699, [140, 140, 140, 140, 139])).toBe(false)
    expect(meetsArticleAdContentThresholds(800, [200, 200, 200, 200, 0, 0])).toBe(false)
  })

  it('accepts content meeting the existing total-word and paragraph thresholds', () => {
    expect(meetsArticleAdContentThresholds(800, [160, 160, 160, 160, 160])).toBe(true)
  })
})
