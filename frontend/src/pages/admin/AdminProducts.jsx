import { useState, useEffect } from 'react'
import { productApi, publicApi } from '../../services/api'
import { Plus, Edit, Trash2, X, Package } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { name: '', description: '', price: '', discountPrice: '', stockQuantity: '',
                imageUrl: '', sku: '', categoryId: '', active: true }

export default function AdminProducts() {
  const [products,    setProducts]    = useState([])
  const [categories,  setCategories]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [modal,       setModal]       = useState(false)
  const [editing,     setEditing]     = useState(null)
  const [form,        setForm]        = useState(EMPTY)
  const [saving,      setSaving]      = useState(false)
  const [page,        setPage]        = useState(0)
  const [totalPages,  setTotalPages]  = useState(0)

  const load = () => {
    setLoading(true)
    productApi.getAll({ page, size: 10 }).then(r => {
      const d = r.data.data
      setProducts(d.content)
      setTotalPages(d.totalPages)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])
  useEffect(() => { publicApi.getCategories().then(r => setCategories(r.data.data)) }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (p) => {
    setEditing(p)
    setForm({
      name: p.name, description: p.description || '', price: String(p.price),
      discountPrice: p.discountPrice ? String(p.discountPrice) : '',
      stockQuantity: String(p.stockQuantity), imageUrl: p.imageUrl || '',
      sku: p.sku || '', categoryId: String(p.categoryId), active: p.active
    })
    setModal(true)
  }
  const closeModal = () => { setModal(false); setEditing(null) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      price: parseFloat(form.price),
      discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
      stockQuantity: parseInt(form.stockQuantity),
      categoryId: parseInt(form.categoryId),
    }
    try {
      if (editing) {
        await productApi.update(editing.id, payload)
        toast.success('Product updated')
      } else {
        await productApi.create(payload)
        toast.success('Product created')
      }
      closeModal(); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try { await productApi.delete(id); toast.success('Product deleted'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete') }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1 className="page-title">Products</h1>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Product</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={p.imageUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80'}
                          alt="" style={{ width: 40, height: 40, objectFit: 'cover',
                          borderRadius: 6, background: 'var(--bg3)' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>#{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text2)' }}>{p.sku || '—'}</td>
                    <td><span className="badge badge-info">{p.categoryName}</span></td>
                    <td>
                      <div style={{ fontWeight: 700 }}>₹{p.price.toFixed(2)}</div>
                      {p.discountPrice && <div style={{ fontSize: 12, color: 'var(--accent2)' }}>₹{p.discountPrice.toFixed(2)}</div>}
                    </td>
                    <td>
                      <span className={`badge badge-${p.stockQuantity === 0 ? 'danger' : p.stockQuantity < 10 ? 'warning' : 'success'}`}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${p.active ? 'success' : 'danger'}`}>
                        {p.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}><Edit size={13} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}><Trash2 size={13} /></button>
                      </div>
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

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button style={{ background: 'none', color: 'var(--text2)' }} onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input value={form.name} onChange={set('name')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea value={form.description} rows={3} onChange={set('description')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <input type="number" step="0.01" min="0.01" value={form.price} onChange={set('price')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Price</label>
                  <input type="number" step="0.01" min="0.01" value={form.discountPrice} onChange={set('discountPrice')} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Stock Qty *</label>
                  <input type="number" min="0" value={form.stockQuantity} onChange={set('stockQuantity')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input value={form.sku} onChange={set('sku')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select value={form.categoryId} onChange={set('categoryId')} required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="pactive" checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} style={{ width: 'auto' }} />
                <label htmlFor="pactive" style={{ fontSize: 14, cursor: 'pointer' }}>Active</label>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : (editing ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
