import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchJson } from '../api/client'
import AdSlot from '../components/AdSlot'
import './explore.css'

function listData(data) { return Array.isArray(data) ? data : data?.results || [] }

function ArticleCard({ article, featured = false }) {
  return <article className={`explore-card${featured ? ' featured-card' : ''}`}>
    {article.cover_image ? <img className="explore-card-image" src={article.cover_image} alt="" loading="lazy" /> : <div className="explore-card-fallback" aria-hidden="true"><span>{article.category?.name?.slice(0, 1) || 'S'}</span></div>}
    <div className="explore-card-body"><div className="article-meta"><span>{article.category?.name || 'Explore'}</span><span>{article.reading_time} min read</span></div><h3>{article.title}</h3><p>{article.short_description || 'Discover the latest ideas, tools, and insights from SkillBloom.'}</p><div className="article-card-footer"><span>{article.views} views</span><Link to={`/explore/${article.slug}`}>Read article</Link></div></div>
  </article>
}

export default function ExplorePage() {
  const [categories, setCategories] = useState([])
  const [articles, setArticles] = useState([])
  const [featured, setFeatured] = useState([])
  const [trending, setTrending] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [ordering, setOrdering] = useState('latest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([fetchJson('/explore/categories/'), fetchJson('/explore/featured/'), fetchJson('/explore/trending/')]).then(([categoryData, featuredData, trendingData]) => { setCategories(listData(categoryData)); setFeatured(listData(featuredData)); setTrending(listData(trendingData)) }).catch(() => setError('Explore content could not be loaded right now.')).finally(() => setLoading(false))
    function refreshAfterAdminChange(event) { if (event.key === 'skillbloom_explore_revision') window.location.reload() }
    window.addEventListener('storage', refreshAfterAdminChange)
    return () => window.removeEventListener('storage', refreshAfterAdminChange)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams({ ordering })
    if (activeCategory) params.set('category', activeCategory)
    if (search.trim()) params.set('search', search.trim())
    setLoading(true)
    fetchJson(`/explore/?${params.toString()}`).then((data) => setArticles(listData(data))).catch(() => setError('Articles could not be loaded right now.')).finally(() => setLoading(false))
  }, [activeCategory, ordering])

  function submitSearch(event) { event.preventDefault(); setActiveCategory(activeCategory); const params = new URLSearchParams({ ordering }); if (activeCategory) params.set('category', activeCategory); if (search.trim()) params.set('search', search.trim()); setLoading(true); fetchJson(`/explore/?${params.toString()}`).then((data) => setArticles(listData(data))).catch(() => setError('Articles could not be loaded right now.')).finally(() => setLoading(false)) }

  return <main className="explore-page"><section className="explore-hero"><p className="explore-kicker">Ideas worth exploring</p><h1>AI, technology, and the future in one place.</h1><p>Find useful ideas, practical tools, surprising facts, and the trends shaping how we learn and work.</p><form className="explore-search" onSubmit={submitSearch}><label htmlFor="explore-search-input">Search Explore</label><input id="explore-search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search articles, topics, and ideas" /><button className="explore-search-button" type="submit">Search</button></form></section>
    <AdSlot slot="content_slot" className="explore-ad-slot" />
    <section className="explore-content"><div className="explore-toolbar"><div className="category-scroller" aria-label="Explore categories"><button className={!activeCategory ? 'active' : ''} type="button" onClick={() => setActiveCategory('')}>All</button>{categories.map((category) => <button className={activeCategory === category.slug ? 'active' : ''} type="button" key={category.id} onClick={() => setActiveCategory(category.slug)}>{category.name}</button>)}</div><select aria-label="Sort articles" value={ordering} onChange={(event) => setOrdering(event.target.value)}><option value="latest">Latest</option><option value="trending">Trending</option></select></div>{error && <div className="explore-state explore-error">{error}</div>}{loading && <div className="explore-grid">{[1, 2, 3].map((item) => <div className="explore-skeleton" key={item} />)}</div>}{!loading && !error && articles.length === 0 && <div className="explore-state"><h2>No articles yet</h2><p>New ideas will appear here as they are published.</p></div>}{!loading && !error && articles.length > 0 && <><div className="explore-section-heading"><div><p className="explore-kicker">{activeCategory ? 'Category feed' : 'Latest from SkillBloom'}</p><h2>{activeCategory ? categories.find((category) => category.slug === activeCategory)?.name : 'Explore the latest ideas'}</h2></div><span>{articles.length} articles</span></div><div className="explore-grid">{articles.map((article) => <ArticleCard article={article} key={article.id} />)}</div></>}{!activeCategory && !search && featured.length > 0 && <section className="explore-secondary"><div className="explore-section-heading"><div><p className="explore-kicker">Editor picks</p><h2>Featured articles</h2></div></div><div className="explore-grid featured-grid">{featured.map((article) => <ArticleCard article={article} featured key={article.id} />)}</div></section>}{!activeCategory && !search && trending.length > 0 && <section className="explore-secondary"><div className="explore-section-heading"><div><p className="explore-kicker">What people are reading</p><h2>Trending now</h2></div></div><div className="explore-grid">{trending.slice(0, 3).map((article) => <ArticleCard article={article} key={article.id} />)}</div></section>}</section>
  </main>
}
