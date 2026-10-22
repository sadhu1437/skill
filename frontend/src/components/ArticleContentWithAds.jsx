import AdSlot from './AdSlot'

export function splitContentForAds(content, {
  wordsPerAd = 600,
  minimumWordsAfterAd = 350,
  maximumAds = 2,
} = {}) {
  if (typeof document === 'undefined' || !content) return [content || '']

  const template = document.createElement('template')
  template.innerHTML = content
  const blocks = Array.from(template.content.childNodes)
  const wordCounts = blocks.map((block) => (block.textContent.match(/\S+/g) || []).length)
  const totalWords = wordCounts.reduce((total, count) => total + count, 0)

  if (totalWords < wordsPerAd + minimumWordsAfterAd) return [content]

  const chunks = []
  let currentChunk = []
  let wordsSinceAd = 0
  let wordsRemaining = totalWords
  let adsInserted = 0

  blocks.forEach((block, index) => {
    currentChunk.push(block.nodeType === Node.ELEMENT_NODE ? block.outerHTML : block.textContent)
    wordsSinceAd += wordCounts[index]
    wordsRemaining -= wordCounts[index]

    const canInsertAfter = block.nodeType !== Node.ELEMENT_NODE
      || block.tagName.toLowerCase() === 'p'
    const shouldInsertAd = canInsertAfter
      && wordsSinceAd >= wordsPerAd
      && wordsRemaining >= minimumWordsAfterAd
      && adsInserted < maximumAds

    if (shouldInsertAd) {
      chunks.push(currentChunk.join(''))
      currentChunk = []
      wordsSinceAd = 0
      adsInserted += 1
    }
  })

  if (!adsInserted) return [content]
  chunks.push(currentChunk.join(''))
  return chunks
}

export default function ArticleContentWithAds({ content }) {
  const chunks = splitContentForAds(content)

  return (
    <>
      {chunks.map((chunk, index) => (
        <div className="article-content-segment" key={index}>
          <div dangerouslySetInnerHTML={{ __html: chunk }} />
          {index < chunks.length - 1 && <AdSlot slot="content_slot" className="article-inline-ad-slot" />}
        </div>
      ))}
    </>
  )
}
