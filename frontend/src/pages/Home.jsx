import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { publicApi } from '../services/api'
import ProductCard from '../components/ProductCard'
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Zap } from 'lucide-react'

export default function Home() {
  const [products, setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      publicApi.getProducts({ page: 0, size: 8, sortBy: 'createdAt', direction: 'desc' }),
      publicApi.getCategories(),
    ]).then(([pRes, cRes]) => {
      setProducts(pRes.data.data.content)
      setCategories(cRes.data.data)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(108,99,255,0.25) 0%, transparent 70%), var(--bg)',
        padding: '100px 0 80px', textAlign: 'center',
      }}>
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.3)',
                        borderRadius: 20, padding: '6px 14px', marginBottom: 24 }}>
            <Zap size={13} color="var(--accent)" fill="var(--accent)" />
            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>Powered by Spring Boot + React</span>
          </div>
          <h1 style={{ fontSize: 'clamp(40px,6vw,80px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}>
            Shop Smarter,<br />
            <span style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2))',
                           WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Live Better
            </span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text2)', maxWidth: 520, margin: '0 auto 40px' }}>
            Discover curated products across electronics, fashion, books and more — all with encrypted, secure checkout.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/products" className="btn btn-primary btn-lg">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">Create Account</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24 }}>
            {[
              { icon: <ShieldCheck size={28} color="var(--accent)" />, title: 'Encrypted Payments', desc: 'AES-256 encrypted card data at rest' },
              { icon: <Truck size={28} color="var(--accent2)" />, title: 'Free Shipping', desc: 'On orders over ₹50 — always' },
              { icon: <RefreshCw size={28} color="var(--success)" />, title: '30-Day Returns', desc: 'Hassle-free return policy' },
              { icon: <Zap size={28} color="var(--warning)" />, title: 'OAuth2 Security', desc: 'JWT token-based authentication' },
            ].map(f => (
              <div key={f.title} className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text2)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section style={{ padding: '60px 0' }}>
          <div className="container">
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Shop by Category</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
              {categories.map(cat => (
                <Link key={cat.id} to={`/products?category=${cat.id}`} style={{
                  position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden',
                  height: 140, display: 'block',
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  transition: 'transform 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}
                >
                  {cat.imageUrl && (
                    <img src={cat.imageUrl} alt={cat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                  )}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16 }}>{cat.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{cat.productCount} items</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800 }}>Featured Products</h2>
            <Link to="/products" className="btn btn-secondary btn-sm">View All <ArrowRight size={14} /></Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" />
            </div>
          ) : (
            <div className="products-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
