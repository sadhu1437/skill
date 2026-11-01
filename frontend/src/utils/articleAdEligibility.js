export const MINIMUM_TOTAL_WORDS = 700
export const MINIMUM_SUBSTANTIAL_PARAGRAPH_WORDS = 40
export const MINIMUM_SUBSTANTIAL_PARAGRAPHS_AFTER_AD = 2

export function meetsArticleAdContentThresholds(totalWords, paragraphWordCounts) {
  return Number.isFinite(totalWords)
    && totalWords >= MINIMUM_TOTAL_WORDS
    && paragraphWordCounts.filter((count) => count >= MINIMUM_SUBSTANTIAL_PARAGRAPH_WORDS).length
      >= MINIMUM_SUBSTANTIAL_PARAGRAPHS_AFTER_AD + 3
}
