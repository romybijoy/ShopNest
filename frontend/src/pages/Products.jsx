import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { publicApi } from '../services/api'
import ProductCard from '../components/ProductCard'
import { Search } from 'lucide-react'

export default function Products() {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchParams, setSearchParams] = useSearchParams()

  const page     = parseInt(searchParams.get('page') || '0')
  const category = searchParams.get('category') || ''
  const search   = searchParams.get('q') || ''
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    publicApi.getCategories().then(r => setCategories(r.data.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, size: 12 }

    const req = search
      ? publicApi.searchProducts(search, params)
      : category
        ? publicApi.getProductsByCategory(category, params)
        : publicApi.getProducts(params)

    req.then(r => {
      const d = r.data.data
      setProducts(d.content)
      setTotal(d.totalElements)
      setTotalPages(d.totalPages)
    }).finally(() => setLoading(false))
  }, [page, category, search])

  const goToPage = (p) => {
    const np = new URLSearchParams(searchParams)
    np.set('page', p)
    setSearchParams(np)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const np = new URLSearchParams()
    if (searchInput) np.set('q', searchInput)
    np.set('page', '0')
    setSearchParams(np)
  }

  const handleCategory = (catId) => {
    const np = new URLSearchParams()
    if (catId) np.set('category', catId)
    np.set('page', '0')
    setSearchParams(np)
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{total} products found</p>
        </div>

        {/* Search & filter bar */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%',
                                        transform: 'translateY(-50%)', color: 'var(--text3)' }} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search products..."
              style={{ paddingLeft: 38 }}
            />
          </form>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${!category ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleCategory('')}
            >All</button>
            {categories.map(c => (
              <button
                key={c.id}
                className={`btn btn-sm ${category === String(c.id) ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleCategory(c.id)}
              >{c.name}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div className="spinner" style={{ width: 48, height: 48 }} />
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="products-grid fade-in">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => goToPage(page - 1)} disabled={page === 0}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={`page-btn ${i === page ? 'active' : ''}`} onClick={() => goToPage(i)}>
                {i + 1}
              </button>
            ))}
            <button className="page-btn" onClick={() => goToPage(page + 1)} disabled={page >= totalPages - 1}>›</button>
          </div>
        )}
      </div>
    </div>
  )
}
