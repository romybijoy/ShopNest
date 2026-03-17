import { useState, useEffect } from 'react'
import { orderApi } from '../../services/api'
import toast from 'react-hot-toast'

const STATUSES   = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED']
const STATUS_CLR = { PENDING:'warning',CONFIRMED:'info',PROCESSING:'info',
                     SHIPPED:'info',DELIVERED:'success',CANCELLED:'danger',REFUNDED:'secondary' }

export default function AdminOrders() {
  const [orders,     setOrders]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [expanded,   setExpanded]   = useState(null)

  const load = () => {
    setLoading(true)
    orderApi.getAll({ page, size: 15 }).then(r => {
      const d = r.data.data
      setOrders(d.content)
      setTotalPages(d.totalPages)
    }).finally(() => setLoading(false))
  }

  useEffect(load, [page])

  const handleStatus = async (id, status) => {
    try {
      await orderApi.updateStatus(id, { status })
      toast.success(`Order status → ${status}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <h1 className="page-title">Orders</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <>
                    <tr key={o.id} style={{ cursor: 'pointer' }}
                      onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{o.orderNumber}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>#{o.id}</div>
                      </td>
                      <td style={{ fontSize: 14 }}>{o.customerName}</td>
                      <td><span className="badge badge-secondary">{o.orderItems.length}</span></td>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-head)' }}>${o.totalAmount.toFixed(2)}</td>
                      <td><span className={`badge badge-${STATUS_CLR[o.status]||'secondary'}`}>{o.status}</span></td>
                      <td style={{ fontSize: 13, color: 'var(--text2)' }}>
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <select
                          value={o.status}
                          onChange={e => handleStatus(o.id, e.target.value)}
                          style={{ fontSize: 12, padding: '4px 8px', width: 'auto' }}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                    {expanded === o.id && (
                      <tr key={`${o.id}-detail`}>
                        <td colSpan={7} style={{ padding: 0 }}>
                          <div style={{ padding: '12px 16px', background: 'rgba(108,99,255,0.04)',
                                         borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
                              <div>
                                <strong style={{ color: 'var(--text2)' }}>Items:</strong>
                                {o.orderItems.map(i => (
                                  <div key={i.id} style={{ padding: '4px 0' }}>
                                    {i.productName} ×{i.quantity} — ${i.totalPrice.toFixed(2)}
                                  </div>
                                ))}
                              </div>
                              <div style={{ color: 'var(--text2)', lineHeight: 1.8 }}>
                                <div><strong>Ship to:</strong> {o.shippingAddressLine1}, {o.shippingCity}, {o.shippingState}</div>
                                <div><strong>Subtotal:</strong> ${o.subtotal.toFixed(2)}</div>
                                <div><strong>Tax:</strong> ${o.tax.toFixed(2)}</div>
                                <div><strong>Shipping:</strong> ${o.shippingCost.toFixed(2)}</div>
                                {o.payment && (
                                  <div><strong>Payment:</strong> {o.payment.status} · {o.payment.maskedCardNumber}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 0}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={`page-btn ${i === page ? 'active' : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>›</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
