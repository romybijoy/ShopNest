import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Tag, Package, ShoppingBag, CreditCard, TrendingUp } from 'lucide-react'
import { orderApi, productApi, paymentApi } from '../../services/api'

const NAV = [
  { to: '/admin',          label: 'Dashboard', icon: <LayoutDashboard size={16} />, exact: true },
  { to: '/admin/categories', label: 'Categories', icon: <Tag size={16} /> },
  { to: '/admin/products',   label: 'Products',   icon: <Package size={16} /> },
  { to: '/admin/orders',     label: 'Orders',     icon: <ShoppingBag size={16} /> },
  { to: '/admin/payments',   label: 'Payments',   icon: <CreditCard size={16} /> },
]

export function AdminLayout() {
  const loc = useLocation()
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ padding: '0 20px 16px', marginBottom: 8, borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase',
                        letterSpacing: '0.08em', fontWeight: 600 }}>
            Admin Panel
          </div>
        </div>
        {NAV.map(l => {
          const active = l.exact ? loc.pathname === l.to : loc.pathname.startsWith(l.to)
          return (
            <Link key={l.to} to={l.to}
              className={`sidebar-link ${active ? 'active' : ''}`}
              style={{ borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent' }}>
              {l.icon} {l.label}
            </Link>
          )
        })}
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}

export default function AdminDashboard() {
  const [orderStats,   setOrderStats]   = useState(null)
  const [productStats, setProductStats] = useState(null)
  const [payStats,     setPayStats]     = useState(null)
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    Promise.all([orderApi.getStats(), productApi.getStats(), paymentApi.getStats()])
      .then(([o, p, pay]) => {
        setOrderStats(o.data.data)
        setProductStats(p.data.data)
        setPayStats(pay.data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n) => n != null ? (typeof n === 'number' && n > 99 ? n.toLocaleString() : String(n)) : '—'
  const fmtMoney = (n) => n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, Admin</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total Orders',     value: fmt(orderStats?.totalOrders),          color: 'var(--accent)' },
              { label: 'Revenue',          value: fmtMoney(orderStats?.totalRevenue),    color: 'var(--success)' },
              { label: 'Avg Order Value',  value: fmtMoney(orderStats?.averageOrderValue), color: 'var(--accent2)' },
              { label: 'Total Products',   value: fmt(productStats?.totalProducts),      color: 'var(--warning)' },
              { label: 'Active Products',  value: fmt(productStats?.activeProducts),     color: 'var(--accent)' },
              { label: 'Payments Collected', value: fmtMoney(payStats?.totalCollected), color: 'var(--success)' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-value" style={{ color: s.color, fontSize: 26 }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tables row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Orders by status */}
            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: 16 }}>Orders by Status</h3>
              {orderStats?.ordersByStatus && Object.entries(orderStats.ordersByStatus).map(([status, count]) => (
                <div key={status} style={{ display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center', padding: '8px 0',
                                            borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <span style={{ color: 'var(--text2)' }}>{status}</span>
                  <span style={{ fontWeight: 700 }}>{count}</span>
                </div>
              ))}
            </div>

            {/* Products by category */}
            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: 16 }}>Products by Category</h3>
              {productStats?.productsByCategory && Object.entries(productStats.productsByCategory).map(([cat, count]) => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between',
                                          alignItems: 'center', padding: '8px 0',
                                          borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <span style={{ color: 'var(--text2)' }}>{cat}</span>
                  <span style={{ fontWeight: 700 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
