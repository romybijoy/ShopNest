import { ShoppingCart, Star } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addItem } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    addItem(product)
    toast.success(`${product.name} added to cart!`)
  }

  const effectivePrice = product.discountPrice ?? product.price

  return (
    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
      <div className="card fade-in" style={{
        padding: 0, overflow: 'hidden', cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
      >
        {/* Image */}
        <div style={{ position: 'relative', overflow: 'hidden', height: 200, background: 'var(--bg3)' }}>
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = ''}
          />
          {product.discountPrice && (
            <span style={{
              position: 'absolute', top: 10, left: 10,
              background: 'var(--accent2)', color: '#fff',
              padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
            }}>
              {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
            </span>
          )}
          {product.stockQuantity === 0 && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            {product.categoryName}
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8,
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {product.name}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <div>
              <span className="price" style={{ fontSize: 18, color: 'var(--text)' }}>
                ${effectivePrice.toFixed(2)}
              </span>
              {product.discountPrice && (
                <span className="price-original" style={{ marginLeft: 6 }}>
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              style={{ padding: '6px 12px' }}
            >
              <ShoppingCart size={14} />
            </button>
          </div>

          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text3)' }}>
            {product.stockQuantity > 0
              ? `${product.stockQuantity} in stock`
              : 'Out of stock'}
          </div>
        </div>
      </div>
    </Link>
  )
}
