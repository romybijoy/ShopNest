import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import AdminDashboard, { AdminLayout } from './pages/admin/AdminDashboard'
import AdminCategories from './pages/admin/AdminCategories'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminPayments from './pages/admin/AdminPayments'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/"          element={<Home />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />
            <Route path="/products"  element={<Products />} />
            <Route path="/cart"      element={<Cart />} />

            {/* Protected — any authenticated user */}
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders"   element={<ProtectedRoute><Orders /></ProtectedRoute>} />

            {/* Protected — ADMIN only */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
              <Route index                   element={<AdminDashboard />} />
              <Route path="categories"       element={<AdminCategories />} />
              <Route path="products"         element={<AdminProducts />} />
              <Route path="orders"           element={<AdminOrders />} />
              <Route path="payments"         element={<AdminPayments />} />
            </Route>

            {/* 404 fallback */}
            <Route path="*" element={
              <div className="page">
                <div className="container">
                  <div className="empty-state">
                    <h3>404 — Page Not Found</h3>
                    <a href="/" className="btn btn-primary" style={{ marginTop: 16 }}>Go Home</a>
                  </div>
                </div>
              </div>
            } />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'var(--bg2)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
              },
              success: { iconTheme: { primary: 'var(--success)', secondary: 'transparent' } },
              error:   { iconTheme: { primary: 'var(--danger)',  secondary: 'transparent' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
