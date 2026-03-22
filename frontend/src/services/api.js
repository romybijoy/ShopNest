import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach Bearer token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — clear session and redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login:    data => api.post('/auth/login', data),
  register: data => api.post('/auth/register', data),
  refresh:  token => api.post('/auth/refresh', {}, { headers: { 'X-Refresh-Token': token } }),
}

// ── Public (no auth) ────────────────────────────────────────────────────────
export const publicApi = {
  getProducts:          (params)      => api.get('/public/products', { params }),
  getProduct:           id            => api.get(`/public/products/${id}`),
  searchProducts:       (q, params)   => api.get('/public/products/search', { params: { q, ...params } }),
  getProductsByCategory:(catId, params)=> api.get(`/public/products/category/${catId}`, { params }),
  getCategories:        ()            => api.get('/public/categories'),
  getCategory:          id            => api.get(`/public/categories/${id}`),
}

// ── Categories (admin) ──────────────────────────────────────────────────────
export const categoryApi = {
  getAll:       ()       => api.get('/categories'),
  getById:      id       => api.get(`/categories/${id}`),
  create:       data     => api.post('/categories', data),
  update:       (id,data)=> api.put(`/categories/${id}`, data),
  delete:       id       => api.delete(`/categories/${id}`),
  toggleStatus: id       => api.patch(`/categories/${id}/toggle`),
}

// ── Products (admin) ────────────────────────────────────────────────────────
export const productApi = {
  getAll:      params     => api.get('/products', { params }),
  getById:     id         => api.get(`/products/${id}`),
  create:      data       => api.post('/products', data),
  update:      (id, data) => api.put(`/products/${id}`, data),
  delete:      id         => api.delete(`/products/${id}`),
  updateStock: (id, qty)  => api.patch(`/products/${id}/stock`, null, { params: { quantity: qty } }),
  getStats:    ()         => api.get('/products/stats'),
}

// ── Orders ──────────────────────────────────────────────────────────────────
export const orderApi = {
  create:       data     => api.post('/orders', data),
  getMyOrders:  params   => api.get('/orders/my', { params }),
  getById:      id       => api.get(`/orders/${id}`),
  getAll:       params   => api.get('/orders', { params }),
  updateStatus: (id,data)=> api.patch(`/orders/${id}/status`, data),
  cancel:       id       => api.patch(`/orders/${id}/cancel`),
  getStats:     ()       => api.get('/orders/stats'),
}

// ── Payments ────────────────────────────────────────────────────────────────
export const paymentApi = {
  process:       data   => api.post('/payments/process', data),
  getAll:        params => api.get('/payments', { params }),
  getById:       id     => api.get(`/payments/${id}`),
  getByOrderId:  orderId=> api.get(`/payments/order/${orderId}`),
  getStats:      ()     => api.get('/payments/stats'),
}

export default api
