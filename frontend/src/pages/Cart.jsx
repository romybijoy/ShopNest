import { useCart } from '../context/CartContext'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'

export default function Cart() {
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCart()
  const navigate = useNavigate()

  const shipping = totalAmount >= 50 ? 0 : 5.99
  const tax      = totalAmount * 0.08
  const total    = totalAmount + shipping + tax

  if (items.length === 0) return (
    <div className="page">
      <div className="container">
        <div className="empty-state">
          <ShoppingBag size={64} />
          <h3>Your cart is empty</h3>
          <p style={{ marginBottom: 20 }}>Browse our products and add something you love!</p>
          <Link to="/products" className="btn btn-primary">Shop Now</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Shopping Cart</h1>
          <p className="page-subtitle">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map(({ product, quantity }) => {
              const price = product.discountPrice ?? product.price
              return (
                <div key={product.id} className="card fade-in"
                  style={{ display: 'flex', gap: 16, padding: 16, alignItems: 'center' }}>
                  <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200'}
                    alt={product.name}
                    style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 8, background: 'var(--bg3)', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2,
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>{product.categoryName}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
                      ${(price * quantity).toFixed(2)}
                      <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 400, marginLeft: 6 }}>
                        (${price.toFixed(2)} each)
                      </span>
                    </div>
                  </div>

                  {/* Quantity control */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0,
                                  background: 'var(--bg3)', borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--border)', overflow: 'hidden' }}>
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        style={{ background: 'none', color: 'var(--text)', padding: '8px 12px',
                                  borderRight: '1px solid var(--border)' }}>
                        <Minus size={14} />
                      </button>
                      <span style={{ padding: '8px 14px', fontSize: 14, fontWeight: 600, minWidth: 40, textAlign: 'center' }}>
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stockQuantity}
                        style={{ background: 'none', color: 'var(--text)', padding: '8px 12px',
                                  borderLeft: '1px solid var(--border)' }}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      style={{ background: 'none', color: 'var(--danger)', padding: 4 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}

            <button className="btn btn-secondary btn-sm" onClick={clearCart}
              style={{ alignSelf: 'flex-start', marginTop: 4 }}>
              <Trash2 size={14} /> Clear Cart
            </button>
          </div>

          {/* Summary */}
          <div className="card" style={{ position: 'sticky', top: 90 }}>
            <h3 style={{ marginBottom: 20, fontSize: 18 }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {[
                ['Subtotal', `$${totalAmount.toFixed(2)}`],
                ['Shipping', shipping === 0 ? <span style={{ color: 'var(--success)' }}>Free</span> : `$${shipping.toFixed(2)}`],
                ['Tax (8%)', `$${tax.toFixed(2)}`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between',
                                          color: 'var(--text2)', fontSize: 14 }}>
                  <span>{label}</span><span>{value}</span>
                </div>
              ))}
              {totalAmount < 50 && (
                <div style={{ fontSize: 12, color: 'var(--text3)', background: 'var(--bg3)',
                               borderRadius: 6, padding: '8px 10px' }}>
                  Add ${(50 - totalAmount).toFixed(2)} more for free shipping
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14,
                             display: 'flex', justifyContent: 'space-between',
                             fontWeight: 800, fontSize: 20, fontFamily: 'var(--font-head)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent)' }}>${total.toFixed(2)}</span>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '14px 0', fontSize: 15 }}
              onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
            <Link to="/products">
              <button className="btn btn-secondary" style={{ width: '100%', padding: '10px 0', marginTop: 10 }}>
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
