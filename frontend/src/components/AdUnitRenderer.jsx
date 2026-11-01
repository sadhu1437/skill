function DisplayAdUnit({ adRef, publisherId, slotId }) {
  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={publisherId}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}

function InArticleAdUnit({ adRef, publisherId, slotId }) {
  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{ display: 'block', textAlign: 'center' }}
      data-ad-layout="in-article"
      data-ad-format="fluid"
      data-ad-client={publisherId}
      data-ad-slot={slotId}
    />
  )
}

const RENDERERS = {
  display: DisplayAdUnit,
  in_article: InArticleAdUnit,
}

export default function AdUnitRenderer({ placement, publisherId, adRef }) {
  const Renderer = RENDERERS[placement.ad_type]
  if (!Renderer) return null
  return <Renderer adRef={adRef} publisherId={publisherId} slotId={placement.slot_id} />
}
