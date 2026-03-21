import { useState, useEffect } from 'react'
import { orderApi } from '../services/api'
import { Link } from 'react-router-dom'
import { Package, ChevronDown, ChevronUp, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  PENDING: 'warning', CONFIRMED: 'info', PROCESSING: 'info',
  SHIPPED: 'info', DELIVERED: 'success', CANCELLED: 'danger', REFUNDED: 'secondary'
}

export default function Orders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  const load = () => {
    orderApi.getMyOrders({ page: 0, size: 50 })
      .then(r => setOrders(r.data.data.content))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCancel = async (id) => {
    try {
      await orderApi.cancel(id)
      toast.success('Order cancelled')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order')
    }
  }

  if (loading) return (
    <div className="page">
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div className="spinner" style={{ width: 48, height: 48 }} />
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <Package size={64} />
            <h3>No orders yet</h3>
            <p style={{ marginBottom: 20 }}>Start shopping to see your orders here</p>
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(order => (
              <div key={order.id} className="card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header */}
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                             flexWrap: 'wrap', gap: 12, padding: '16px 20px', cursor: 'pointer' }}
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-head)', fontSize: 15 }}>
                        {order.orderNumber}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </div>
                    </div>
                    <span className={`badge badge-${STATUS_BADGE[order.status] || 'secondary'}`}>
                      {order.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 20,
                                    color: 'var(--accent)' }}>
                      ₹{order.totalAmount.toFixed(2)}
                    </span>
                    {expanded === order.id ? <ChevronUp size={18} color="var(--text2)" /> : <ChevronDown size={18} color="var(--text2)" />}
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded === order.id && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px' }} className="fade-in">
                    {/* Items */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase',
                                     letterSpacing: '0.05em', marginBottom: 10 }}>
                        Items
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {order.orderItems.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between',
                                                       alignItems: 'center', fontSize: 14,
                                                       padding: '8px 12px', background: 'var(--bg3)',
                                                       borderRadius: 'var(--radius-sm)' }}>
                            <span>{item.productName} × {item.quantity}</span>
                            <span style={{ fontWeight: 600 }}>₹{item.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 2 }}>
                        <div>Subtotal: <strong style={{ color: 'var(--text)' }}>₹{order.subtotal.toFixed(2)}</strong></div>
                        <div>Tax: <strong style={{ color: 'var(--text)' }}>₹{order.tax.toFixed(2)}</strong></div>
                        <div>Shipping: <strong style={{ color: 'var(--text)' }}>₹{order.shippingCost.toFixed(2)}</strong></div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 2 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>Ship to:</div>
                        <div>{order.shippingAddressLine1}</div>
                        <div>{order.shippingCity}, {order.shippingState} {order.shippingZip}</div>
                      </div>
                    </div>

                    {/* Payment info */}
                    {order.payment && (
                      <div style={{ padding: 12, background: 'rgba(34,197,94,0.08)',
                                     border: '1px solid rgba(34,197,94,0.2)',
                                     borderRadius: 'var(--radius-sm)', fontSize: 13, marginBottom: 16 }}>
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>Payment </span>
                        <span style={{ color: 'var(--text2)' }}>
                          {order.payment.status} · {order.payment.maskedCardNumber} · TXN: {order.payment.transactionId}
                        </span>
                      </div>
                    )}

                    {/* Cancel */}
                    {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(order.id)}>
                        <XCircle size={14} /> Cancel Order
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
