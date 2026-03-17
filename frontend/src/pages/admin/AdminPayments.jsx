import { useState, useEffect } from 'react'
import { paymentApi } from '../../services/api'
import { ShieldCheck } from 'lucide-react'

const STATUS_CLR = { COMPLETED: 'success', PENDING: 'warning', FAILED: 'danger', REFUNDED: 'secondary' }

export default function AdminPayments() {
  const [payments,   setPayments]   = useState([])
  const [stats,      setStats]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    paymentApi.getStats().then(r => setStats(r.data.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    paymentApi.getAll({ page, size: 15 }).then(r => {
      const d = r.data.data
      setPayments(d.content)
      setTotalPages(d.totalPages)
    }).finally(() => setLoading(false))
  }, [page])

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <h1 className="page-title">Payments</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <ShieldCheck size={14} color="var(--success)" />
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>
            Card numbers are AES-256 encrypted at rest — only last 4 digits shown
          </span>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total Payments', value: stats.totalPayments },
            { label: 'Collected',      value: `$${Number(stats.totalCollected).toFixed(2)}` },
            { label: 'Failure Rate',   value: `${stats.failureRatePercent}%` },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ padding: '16px 20px' }}>
              <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
          {stats.paymentsByStatus && Object.entries(stats.paymentsByStatus).map(([status, count]) => (
            <div key={status} className="stat-card" style={{ padding: '16px 20px' }}>
              <div className="stat-value" style={{ fontSize: 22 }}>{count}</div>
              <div className="stat-label">{status}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th><th>Order</th><th>Card Holder</th>
                  <th>Card (masked)</th><th>Method</th><th>Amount</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.transactionId}</td>
                    <td style={{ fontSize: 13, color: 'var(--text2)' }}>#{p.orderId}</td>
                    <td style={{ fontSize: 14 }}>{p.cardHolderName}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text2)' }}>
                      {p.maskedCardNumber}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      <span className="badge badge-secondary">{p.paymentMethod?.replace('_',' ')}</span>
                    </td>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-head)' }}>${p.amount.toFixed(2)}</td>
                    <td>
                      <span className={`badge badge-${STATUS_CLR[p.status] || 'secondary'}`}>{p.status}</span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text2)' }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
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
