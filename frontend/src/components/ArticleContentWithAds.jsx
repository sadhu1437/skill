import { sanitizeHtml } from '../security/sanitizeHtml'
import {
  meetsArticleAdContentThresholds,
  MINIMUM_SUBSTANTIAL_PARAGRAPHS_AFTER_AD,
  MINIMUM_SUBSTANTIAL_PARAGRAPH_WORDS,
} from '../utils/articleAdEligibility'
import GoogleAdUnit from './GoogleAdUnit'

const MINIMUM_WORDS_BEFORE_AD = 350
const MINIMUM_WORDS_AFTER_AD = 250

function countWords(value) {
  return (value.match(/\S+/g) || []).length
}

export function splitContentForAds(content) {
  if (typeof document === 'undefined' || !content) return [content || '']

  const safeContent = sanitizeHtml(content)
  const template = document.createElement('template')
  template.innerHTML = safeContent
  const blocks = Array.from(template.content.childNodes)
  const wordCounts = blocks.map((block) => countWords(block.textContent || ''))
  const totalWords = wordCounts.reduce((total, count) => total + count, 0)

  const paragraphIndexes = blocks
    .map((block, index) => (block.nodeType === 1 && block.tagName === 'P' ? index : -1))
    .filter((index) => index >= 0)
  const paragraphWordCounts = new Map(
    paragraphIndexes.map((index) => [index, countWords(blocks[index].textContent || '')]),
  )
  if (!meetsArticleAdContentThresholds(totalWords, [...paragraphWordCounts.values()])) return [safeContent]

  const substantialParagraphs = paragraphIndexes.filter((index) => (
    paragraphWordCounts.get(index) >= MINIMUM_SUBSTANTIAL_PARAGRAPH_WORDS
  ))

  const nextContentIndex = (index) => {
    for (let nextIndex = index + 1; nextIndex < blocks.length; nextIndex += 1) {
      if (blocks[nextIndex].nodeType === Node.TEXT_NODE && !blocks[nextIndex].textContent.trim()) continue
      return nextIndex
    }
    return -1
  }

  let insertionIndex = -1
  for (let paragraphNumber = 0; paragraphNumber < substantialParagraphs.length; paragraphNumber += 1) {
    const paragraphIndex = substantialParagraphs[paragraphNumber]
    const nextIndex = nextContentIndex(paragraphIndex)
    const adjacentParagraphsContainLinks = blocks[paragraphIndex].querySelector('a[href]')
      || blocks[nextIndex]?.querySelector?.('a[href]')
    const wordsBeforeAd = [...paragraphWordCounts.entries()]
      .filter(([index]) => index <= paragraphIndex)
      .reduce((total, [, count]) => total + count, 0)
    const paragraphWordsAfter = [...paragraphWordCounts.entries()]
      .filter(([index]) => index > paragraphIndex)
      .reduce((total, [, count]) => total + count, 0)
    const substantialAfter = substantialParagraphs.length - paragraphNumber - 1
    if (
      paragraphNumber >= 2
      && blocks[nextIndex]?.nodeType === 1
      && blocks[nextIndex]?.tagName === 'P'
      && !adjacentParagraphsContainLinks
      && wordsBeforeAd >= MINIMUM_WORDS_BEFORE_AD
      && paragraphWordsAfter >= MINIMUM_WORDS_AFTER_AD
      && substantialAfter >= MINIMUM_SUBSTANTIAL_PARAGRAPHS_AFTER_AD
    ) {
      insertionIndex = paragraphIndex + 1
      break
    }
  }

  if (insertionIndex < 0) return [safeContent]
  return [
    blocks.slice(0, insertionIndex).map((block) => block.outerHTML ?? block.textContent).join(''),
    blocks.slice(insertionIndex).map((block) => block.outerHTML ?? block.textContent).join(''),
  ]
}

export default function ArticleContentWithAds({
  content,
  className = '',
  surface = 'explore_article',
  contentEligible = false,
}) {
  const chunks = contentEligible ? splitContentForAds(content) : [sanitizeHtml(content)]

  return (
    <>
      {chunks.map((chunk, index) => (
        <div className={`article-content-segment ${className}`.trim()} key={index}>
          <div dangerouslySetInnerHTML={{ __html: chunk }} />
          {contentEligible && index < chunks.length - 1 && (
            <GoogleAdUnit
              surface={surface}
              position="in_article"
            />
          )}
        </div>
      ))}
    </>
  )
}
