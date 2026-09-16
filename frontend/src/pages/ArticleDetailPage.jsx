import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchJson, requestJson } from '../api/client'
import AdSlot from '../components/AdSlot'
import { sanitizeHtml } from '../security/sanitizeHtml'
import './explore.css'

function getTokenUserId(token) {
  if (!token) return null
  try {
    return JSON.parse(atob(token.split('.')[1])).user_id
  } catch {
    return null
  }
}

export default function ArticleDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [comments, setComments] = useState([])
  const [commentBody, setCommentBody] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const accessToken = localStorage.getItem('skillbloom_access_token')
  const currentUserId = getTokenUserId(accessToken)

  useEffect(() => {
    setArticle(null)
    fetchJson(`/explore/${slug}/`)
      .then((data) => setArticle({ ...data, content: sanitizeHtml(data.content) }))
      .catch(() => setError('This article could not be found.'))
    fetchJson(`/explore/${slug}/comments/`)
      .then((data) => setComments(data.results || data))
      .catch(() => {})
  }, [slug])

  async function action(name) {
    try {
      const data = await requestJson(`/explore/${slug}/action/${name}/`, { method: 'POST', body: JSON.stringify({}) })
      if (name === 'like') setArticle((current) => ({ ...current, likes: data.likes, is_liked: data.liked }))
      if (name === 'bookmark') setArticle((current) => ({ ...current, is_bookmarked: data.bookmarked }))
      setNotice(name === 'share' ? 'Thanks for sharing this article.' : 'Your preference was saved.')
    } catch (actionError) {
      if (actionError.message.includes('401') || actionError.message.toLowerCase().includes('sign in')) navigate(`/login?next=${encodeURIComponent(`/explore/${slug}`)}`)
      else setNotice(actionError.message)
    }
  }

  async function share() {
    if (navigator.share) {
      await navigator.share({ title: article.title, text: article.short_description, url: window.location.href })
      action('share')
      return
    }
    await navigator.clipboard?.writeText(window.location.href)
    action('share')
  }

  async function submitComment(event) {
    event.preventDefault()
    if (!accessToken) {
      navigate(`/login?next=${encodeURIComponent(`/explore/${slug}`)}`)
      return
    }
    try {
      if (editingCommentId) {
        const updated = await requestJson(`/explore/${slug}/comments/${editingCommentId}/`, { method: 'PATCH', body: JSON.stringify({ body: commentBody }) })
        setComments((current) => current.map((comment) => comment.id === editingCommentId ? updated : comment))
        setNotice('Comment updated.')
      } else {
        const comment = await requestJson(`/explore/${slug}/comments/`, { method: 'POST', body: JSON.stringify({ body: commentBody }) })
        setComments((current) => [comment, ...current])
        setNotice('Comment added.')
      }
      setCommentBody('')
      setEditingCommentId(null)
    } catch (commentError) {
      setNotice(commentError.message || 'Could not save your comment.')
    }
  }

  function startCommentEdit(comment) {
    setEditingCommentId(comment.id)
    setCommentBody(comment.body)
    setNotice('')
  }

  async function deleteComment(commentId) {
    if (!window.confirm('Delete this comment?')) return
    try {
      await requestJson(`/explore/${slug}/comments/${commentId}/`, { method: 'DELETE' })
      setComments((current) => current.filter((comment) => comment.id !== commentId))
      if (editingCommentId === commentId) {
        setEditingCommentId(null)
        setCommentBody('')
      }
      setNotice('Comment deleted.')
    } catch (commentError) {
      setNotice(commentError.message || 'Could not delete the comment.')
    }
  }

  if (error) return <main className="article-page"><div className="explore-state explore-error">{error}</div></main>
  if (!article) return <main className="article-page"><div className="article-loading"><div /><div /><div /></div></main>

  return (
    <main className="article-page">
      <article className="article-reading">
        <div className="article-reading-header">
          <Link className="article-back" to="/explore">← Back to Explore</Link>
          <div className="article-meta"><span>{article.category?.name || 'Explore'}</span><span>{article.reading_time} min read</span><span>{article.views} views</span></div>
          <h1>{article.title}</h1>
          <p className="article-lede">{article.short_description}</p>
          <div className="article-byline"><span>By {article.author?.username || 'SkillBloom'}</span><span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Recently published'}</span></div>
        </div>
        <AdSlot slot="content_slot" className="article-ad-slot" />
        {article.cover_image ? <img className="article-cover" src={article.cover_image} alt="" /> : <div className="article-cover article-cover-fallback"><span>{article.category?.name || 'SkillBloom'}</span></div>}
        <div className="article-actions"><button type="button" onClick={() => action('like')}>♥ {article.likes || 0}</button><button type="button" onClick={() => action('bookmark')}>{article.is_bookmarked ? '★ Saved' : '☆ Save'}</button><button type="button" onClick={share}>↗ Share</button></div>
        {notice && <p className="article-notice">{notice}</p>}
        <div className="article-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }} />
        {article.video_url && <div className="article-video"><a href={article.video_url} target="_blank" rel="noreferrer">Watch the related video</a></div>}
        <div className="article-tags">{article.tags?.map((tag) => <span key={tag.id}>#{tag.name}</span>)}</div>
        {article.comments_enabled && <section className="article-comments">
          <h2>Comments</h2>
          <form onSubmit={submitComment}>
            <textarea value={commentBody} onChange={(event) => setCommentBody(event.target.value)} placeholder="Share your thoughts" rows="3" required />
            <button className="primary-btn" type="submit">{editingCommentId ? 'Update comment' : 'Post comment'}</button>
            {editingCommentId && <button type="button" onClick={() => { setEditingCommentId(null); setCommentBody('') }}>Cancel edit</button>}
          </form>
          {comments.map((comment) => {
            const isOwner = currentUserId && comment.user?.id === currentUserId
            return <div className="article-comment" key={comment.id}>
              <div className="article-comment-header"><div className="article-comment-author"><strong>{comment.user?.username || 'User'}</strong>{comment.is_edited && <span className="comment-edited-badge">Edited</span>}</div>{isOwner && <div className="comment-actions"><button className="comment-edit-button" type="button" onClick={() => startCommentEdit(comment)} aria-label="Edit your comment">Edit</button><button className="comment-delete-button" type="button" onClick={() => deleteComment(comment.id)} aria-label="Delete your comment">Delete</button></div>}</div>
              <p>{comment.body}</p>
            </div>
          })}
        </section>}
      </article>
    </main>
  )
}
