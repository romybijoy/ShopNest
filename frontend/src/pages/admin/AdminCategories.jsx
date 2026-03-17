import { useState, useEffect } from 'react'
import { categoryApi } from '../../services/api'
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { name: '', description: '', imageUrl: '', active: true }

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState(EMPTY)
  const [saving,     setSaving]     = useState(false)

  const load = () => categoryApi.getAll().then(r => setCategories(r.data.data)).finally(() => setLoading(false))
  useEffect(load, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit   = (c)  => { setEditing(c); setForm({ name: c.name, description: c.description || '', imageUrl: c.imageUrl || '', active: c.active }); setModal(true) }
  const closeModal = ()   => { setModal(false); setEditing(null) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await categoryApi.update(editing.id, form)
        toast.success('Category updated')
      } else {
        await categoryApi.create(form)
        toast.success('Category created')
      }
      closeModal(); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      await categoryApi.delete(id)
      toast.success('Category deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  const handleToggle = async (id) => {
    try {
      await categoryApi.toggleStatus(id)
      load()
    } catch (err) {
      toast.error('Failed to toggle status')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1 className="page-title">Categories</h1>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Description</th><th>Products</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--text3)', fontSize: 13 }}>#{c.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {c.imageUrl && (
                        <img src={c.imageUrl} alt="" style={{ width: 36, height: 36,
                          borderRadius: 6, objectFit: 'cover', background: 'var(--bg3)' }} />
                      )}
                      <span style={{ fontWeight: 600 }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text2)', fontSize: 13, maxWidth: 240 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.description || '—'}
                    </div>
                  </td>
                  <td><span className="badge badge-secondary">{c.productCount}</span></td>
                  <td>
                    <span className={`badge badge-${c.active ? 'success' : 'danger'}`}>
                      {c.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>
                        <Edit size={13} />
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleToggle(c.id)}
                        title={c.active ? 'Deactivate' : 'Activate'}>
                        {c.active ? <ToggleRight size={13} color="var(--success)" /> : <ToggleLeft size={13} />}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 className="modal-title" style={{ margin: 0 }}>{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button style={{ background: 'none', color: 'var(--text2)' }} onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea value={form.description} rows={3}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..." />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={form.active} id="active"
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  style={{ width: 'auto' }} />
                <label htmlFor="active" style={{ fontSize: 14, cursor: 'pointer' }}>Active</label>
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
