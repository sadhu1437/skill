import { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { requestJson, uploadFile } from '../api/client'
import './explore-admin.css'

const emptyArticle = { title: '', category_id: '', tag_names: '', short_description: '', content: '', video_url: '', reading_time: 3, status: 'published', is_featured: false, comments_enabled: true, scheduled_at: '', seo_title: '', seo_description: '', cover_image: null }
const listData = (data) => Array.isArray(data) ? data : data?.results || []

function CopyPasteEditor({ value, onChange }) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkMessage, setLinkMessage] = useState('')
  const selectedRange = useRef(null)
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true })],
    content: value || '<p></p>',
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  })

  if (!editor) return <div className="explore-rich-editor-loading">Loading editor...</div>

  function openLinkDialog(event) {
    event.preventDefault()
    const { from, to } = editor.state.selection
    if (from === to) {
      setLinkMessage('Select the text you want to link first.')
      return
    }
    selectedRange.current = editor.state.selection
    setLinkMessage('')
    setLinkUrl('')
    setLinkDialogOpen(true)
  }

  function applyLink(event) {
    event.preventDefault()
    if (!linkUrl.trim()) return
    const selection = selectedRange.current
    if (selection) editor.view.dispatch(editor.state.tr.setSelection(selection))
    editor.chain().focus().setLink({ href: linkUrl.trim(), target: '_blank' }).run()
    setLinkDialogOpen(false)
    setLinkUrl('')
    selectedRange.current = null
  }

  function handleLinkKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      applyLink(event)
    }
  }

  return (
    <div className="wysiwyg-shell simple-editor">
      <div className="wysiwyg-toolbar" role="toolbar" aria-label="Article link tools">
        <button type="button" onMouseDown={openLinkDialog}>Link</button>
        <button type="button" onClick={() => editor.chain().focus().unsetLink().run()}>Remove link</button>
        <span className="editor-help">Select text, click Link, then enter its URL.</span>
      </div>
      {linkMessage && <p className="editor-link-message" role="status">{linkMessage}</p>}
      <EditorContent editor={editor} className="explore-rich-editor" />
      {linkDialogOpen && <div className="link-dialog" role="dialog" aria-modal="true" aria-label="Add link" onClick={(event) => event.stopPropagation()}>
        <div className="link-dialog-fields">
          <label>Link URL<input autoFocus type="url" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} onKeyDown={handleLinkKeyDown} placeholder="https://example.com" required /></label>
          <div><button type="button" onClick={() => setLinkDialogOpen(false)}>Cancel</button><button type="button" onClick={applyLink}>Apply link</button></div>
        </div>
      </div>}
    </div>
  )
}

export default function ExploreAdminPage() {
  const [categories, setCategories] = useState([])
  const [articles, setArticles] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [article, setArticle] = useState(emptyArticle)
  const [editingSlug, setEditingSlug] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [adsenseEnabled, setAdsenseEnabled] = useState(false)
  const [adsensePublisherId, setAdsensePublisherId] = useState('')
  const [adsenseContentSlot, setAdsenseContentSlot] = useState('')

  function loadAll() {
    Promise.all([requestJson('/explore/categories/'), requestJson('/explore/manage/'), requestJson('/explore/manage/analytics/'), requestJson('/core/adsense/')]).then(([categoryData, articleData, analyticsData, adsenseData]) => {
      setCategories(listData(categoryData)); setArticles(listData(articleData)); setAnalytics(analyticsData); setAdsenseEnabled(adsenseData.enabled || false); setAdsensePublisherId(adsenseData.publisher_id || ''); setAdsenseContentSlot(adsenseData.content_slot || '')
    }).catch((loadError) => setError(loadError.message || 'Explore management data could not be loaded.'))
  }

  useEffect(() => { loadAll() }, [])
  function updateArticle(event) { const { name, value, type, checked, files } = event.target; setArticle((current) => ({ ...current, [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value })) }
  function startEdit(item) { setEditingSlug(item.slug); setArticle({ ...item, category_id: item.category?.id || '', tag_names: item.tags?.map((tag) => tag.name).join(', ') || '', scheduled_at: item.scheduled_at ? item.scheduled_at.slice(0, 16) : '', cover_image: null }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function resetArticle() { setEditingSlug(''); setArticle(emptyArticle) }

  async function saveArticle(event) {
    event.preventDefault(); setMessage(''); setError('')
    const tags = typeof article.tag_names === 'string' ? article.tag_names.split(',').map((tag) => tag.trim()).filter(Boolean) : []
    const payload = { ...article, category_id: article.category_id || null, tag_names: tags, scheduled_at: article.scheduled_at || null }
    const endpoint = editingSlug ? `/explore/manage/${editingSlug}/` : '/explore/manage/'
    const method = editingSlug ? 'PATCH' : 'POST'
    try {
      if (article.cover_image) {
        const formData = new FormData()
        Object.entries(payload).forEach(([key, value]) => { if (key !== 'cover_image') formData.append(key, Array.isArray(value) ? JSON.stringify(value) : value ?? '') })
        formData.append('cover_image', article.cover_image)
        await uploadFile(endpoint, formData, method)
      } else {
        delete payload.cover_image
        await requestJson(endpoint, { method, body: JSON.stringify(payload) })
      }
      setMessage(editingSlug ? 'Article updated.' : 'Article saved.'); resetArticle(); loadAll()
    } catch (saveError) { setError(saveError.message || 'Could not save article.') }
  }

  async function removeArticle(slug) { if (!window.confirm('Delete this article permanently?')) return; try { await requestJson(`/explore/manage/${slug}/`, { method: 'DELETE' }); localStorage.setItem('skillbloom_explore_revision', String(Date.now())); setMessage('Article deleted.'); loadAll() } catch (deleteError) { setError(deleteError.message || 'Could not delete article.') } }
  async function addCategory(event) { event.preventDefault(); try { await requestJson('/explore/categories/', { method: 'POST', body: JSON.stringify({ name: categoryName, description: categoryDescription }) }); setCategoryName(''); setCategoryDescription(''); setMessage('Category created.'); loadAll() } catch (categoryError) { setError(categoryError.message || 'Could not create category.') } }
  async function removeCategory(slug) { if (!window.confirm('Delete this category?')) return; try { await requestJson(`/explore/categories/${slug}/`, { method: 'DELETE' }); setMessage('Category deleted.'); loadAll() } catch (categoryError) { setError(categoryError.message || 'Could not delete category.') } }
  async function saveAdsense(event) { event.preventDefault(); try { await requestJson('/core/adsense/', { method: 'PATCH', body: JSON.stringify({ enabled: adsenseEnabled, publisher_id: adsensePublisherId, content_slot: adsenseContentSlot }) }); setMessage('AdSense settings saved.'); loadAll() } catch (adsenseError) { setError(adsenseError.message || 'Could not save AdSense settings.') } }

  return <main className="explore-admin-page">
    <header className="explore-admin-header"><div><p className="explore-kicker">Content management</p><h1>Explore studio</h1><p>Create dynamic articles, categories, tags, and insights without changing frontend code.</p></div></header>
    {message && <p className="explore-admin-success">{message}</p>}{error && <p className="explore-admin-error">{error}</p>}
    {analytics && <section className="analytics-grid">{[['Articles', analytics.total_articles], ['Published', analytics.published_articles], ['Drafts', analytics.drafts], ['Scheduled', analytics.scheduled], ['Views', analytics.total_views], ['Likes', analytics.total_likes]].map(([label, value]) => <div className="analytics-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>}
    <section className="explore-admin-layout"><form className="explore-editor-panel" onSubmit={saveArticle}>
      <div className="explore-admin-section-heading"><div><p className="explore-kicker">{editingSlug ? 'Edit article' : 'New article'}</p><h2>{editingSlug ? 'Update article' : 'Write something worth exploring'}</h2></div>{editingSlug && <button className="secondary-action" type="button" onClick={resetArticle}>Cancel edit</button>}</div>
      <div className="explore-admin-grid"><label>Title<input name="title" value={article.title} onChange={updateArticle} required /></label><label>Category<select name="category_id" value={article.category_id} onChange={updateArticle}><option value="">Uncategorized</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><label>Tags<input name="tag_names" value={article.tag_names} onChange={updateArticle} placeholder="AI, productivity, careers" /></label><label>Reading time (minutes)<input name="reading_time" type="number" min="1" value={article.reading_time} onChange={updateArticle} /></label></div>
      <label>Short description<textarea name="short_description" value={article.short_description} onChange={updateArticle} rows="3" /></label>
      <div className="rich-content-field"><span className="field-label">Rich content</span><CopyPasteEditor key={editingSlug || 'new'} value={article.content} onChange={(content) => setArticle((current) => ({ ...current, content }))} /></div>
      <div className="explore-admin-grid"><label>Status<select name="status" value={article.status} onChange={updateArticle}><option value="published">Published - visible on Explore</option><option value="draft">Draft - private</option><option value="scheduled">Scheduled</option></select></label><label>Schedule date<input name="scheduled_at" type="datetime-local" value={article.scheduled_at} onChange={updateArticle} /></label><label>Cover image<input name="cover_image" type="file" accept="image/*" onChange={updateArticle} /></label><label>YouTube/video URL<input name="video_url" type="url" value={article.video_url} onChange={updateArticle} /></label></div>
      <label>SEO title<input name="seo_title" value={article.seo_title} onChange={updateArticle} /></label><label>SEO description<textarea name="seo_description" value={article.seo_description} onChange={updateArticle} rows="3" /></label><div className="explore-admin-options"><label><input name="is_featured" type="checkbox" checked={article.is_featured} onChange={updateArticle} /> Featured</label><label><input name="comments_enabled" type="checkbox" checked={article.comments_enabled} onChange={updateArticle} /> Comments enabled</label></div><button className="admin-submit" type="submit">{editingSlug ? 'Update article' : 'Save article'}</button>
    </form><aside className="explore-admin-sidebar"><form className="category-form" onSubmit={saveAdsense}><p className="explore-kicker">Monetization</p><h2>AdSense</h2><label><input type="checkbox" checked={adsenseEnabled} onChange={(event) => setAdsenseEnabled(event.target.checked)} /> Enabled</label><label>Publisher ID<input type="text" value={adsensePublisherId} onChange={(event) => setAdsensePublisherId(event.target.value)} placeholder="ca-pub-xxxxxxxxxxxxxxxx" /></label><label>Content Slot ID<input type="text" value={adsenseContentSlot} onChange={(event) => setAdsenseContentSlot(event.target.value)} placeholder="1234567890" /></label><button className="secondary-action" type="submit">Save AdSense</button></form><form className="category-form" onSubmit={addCategory}><p className="explore-kicker">Taxonomy</p><h2>Categories</h2><input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="New category name" required /><textarea value={categoryDescription} onChange={(event) => setCategoryDescription(event.target.value)} placeholder="What belongs here?" rows="3" /><button className="secondary-action" type="submit">Add category</button></form><div className="category-list">{categories.map((category) => <div key={category.id}><span>{category.name}</span><button type="button" onClick={() => removeCategory(category.slug)} aria-label={`Delete ${category.name}`}>×</button></div>)}</div></aside></section>
    <section className="explore-admin-list"><div className="explore-admin-section-heading"><div><p className="explore-kicker">Content library</p><h2>All articles</h2></div></div>{articles.length ? articles.map((item) => <div className="managed-article" key={item.id}><div><strong>{item.title}</strong><span>{item.status} · {item.views} views · {item.likes} likes</span></div><div className="managed-actions"><button className="secondary-action" type="button" onClick={() => startEdit(item)}>Edit</button><button className="danger-action" type="button" onClick={() => removeArticle(item.slug)}>Delete</button></div></div>) : <p className="explore-admin-empty">No articles created yet.</p>}</section>
  </main>
}
