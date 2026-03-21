import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { orderApi, paymentApi } from '../services/api'
import toast from 'react-hot-toast'
import { ShieldCheck, ChevronRight, MapPin, CreditCard } from 'lucide-react'

const STEPS = ['Shipping', 'Payment', 'Review']

export default function Checkout() {
  const { items, totalAmount, clearCart } = useCart()
  const navigate = useNavigate()
  const [step, setStep]       = useState(0)
  const [loading, setLoading] = useState(false)

  const [address, setAddress] = useState({
    shippingAddressLine1: '', shippingAddressLine2: '',
    shippingCity: '', shippingState: '', shippingZip: '', shippingCountry: 'US', notes: ''
  })
  const [payment, setPayment] = useState({
    cardHolderName: '', cardNumber: '', cardExpiry: '', cvv: '', paymentMethod: 'CREDIT_CARD'
  })

  const shipping = totalAmount >= 50 ? 0 : 5.99
  const tax      = totalAmount * 0.08
  const total    = totalAmount + shipping + tax

  const setA = (k) => (e) => setAddress(a => ({ ...a, [k]: e.target.value }))
  const setP = (k) => (e) => setPayment(p => ({ ...p, [k]: e.target.value }))

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      const orderItems = items.map(i => ({ productId: i.product.id, quantity: i.quantity }))
      const orderRes   = await orderApi.create({ items: orderItems, ...address })
      const orderId    = orderRes.data.data.id
      const payRes     = await paymentApi.process({ orderId, ...payment })
      const payStatus  = payRes.data.data.status

      clearCart()
      if (payStatus === 'COMPLETED') {
        toast.success('🎉 Order placed & payment successful!')
      } else {
        toast.error('Order placed but payment failed. Try again from orders.')
      }
      navigate('/orders')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) { navigate('/cart'); return null }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="page-header">
          <h1 className="page-title">Checkout</h1>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 13, fontWeight: 700,
                  background: i <= step ? 'var(--accent)' : 'var(--bg3)',
                  color: i <= step ? '#fff' : 'var(--text3)',
                  border: `2px solid ${i <= step ? 'var(--accent)' : 'var(--border)'}`,
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 14, fontWeight: i === step ? 600 : 400,
                                color: i === step ? 'var(--text)' : 'var(--text2)' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 1, background: i < step ? 'var(--accent)' : 'var(--border)',
                               margin: '0 12px' }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
          {/* Main form */}
          <div>
            {/* Step 0 — Shipping */}
            {step === 0 && (
              <div className="card fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <MapPin size={18} color="var(--accent)" />
                  <h3>Shipping Address</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Address Line 1 *</label>
                    <input value={address.shippingAddressLine1} onChange={setA('shippingAddressLine1')}
                      placeholder="123 Main Street" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address Line 2</label>
                    <input value={address.shippingAddressLine2} onChange={setA('shippingAddressLine2')}
                      placeholder="Apt, Suite, Unit (optional)" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">City *</label>
                      <input value={address.shippingCity} onChange={setA('shippingCity')} placeholder="New York" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State *</label>
                      <input value={address.shippingState} onChange={setA('shippingState')} placeholder="NY" required />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">ZIP Code *</label>
                      <input value={address.shippingZip} onChange={setA('shippingZip')} placeholder="10001" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Country *</label>
                      <input value={address.shippingCountry} onChange={setA('shippingCountry')} placeholder="US" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Order Notes (optional)</label>
                    <textarea value={address.notes} onChange={setA('notes')}
                      placeholder="Any special instructions..." rows={2}
                      style={{ resize: 'vertical' }} />
                  </div>
                  <button className="btn btn-primary" style={{ marginTop: 4 }}
                    disabled={!address.shippingAddressLine1 || !address.shippingCity || !address.shippingZip}
                    onClick={() => setStep(1)}>
                    Continue to Payment <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 1 — Payment */}
            {step === 1 && (
              <div className="card fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <ShieldCheck size={18} color="var(--success)" />
                  <h3>Payment Details</h3>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
                  Card data is AES-256 encrypted before storing in the database.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select value={payment.paymentMethod} onChange={setP('paymentMethod')}>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                      <option value="PREPAID_CARD">Prepaid Card</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Card Holder Name *</label>
                    <input value={payment.cardHolderName} onChange={setP('cardHolderName')}
                      placeholder="John Doe" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Card Number * (16 digits)</label>
                    <input value={payment.cardNumber} onChange={setP('cardNumber')}
                      placeholder="1234567890123456" maxLength={16} required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Expiry (MM/YY) *</label>
                      <input value={payment.cardExpiry} onChange={setP('cardExpiry')}
                        placeholder="12/26" maxLength={5} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV *</label>
                      <input value={payment.cvv} onChange={setP('cvv')}
                        placeholder="123" maxLength={4} type="password" required />
                    </div>
                  </div>
                  <div style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)',
                                 borderRadius: 'var(--radius-sm)', padding: 12, fontSize: 13, color: 'var(--text2)' }}>
                    💡 <strong>Test mode:</strong> Card starting with <code>0000</code> = payment fail.
                    Any other number = success (5% random fail rate).
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button className="btn btn-secondary" onClick={() => setStep(0)}>← Back</button>
                    <button className="btn btn-primary" style={{ flex: 1 }}
                      disabled={!payment.cardHolderName || !payment.cardNumber || !payment.cardExpiry || !payment.cvv}
                      onClick={() => setStep(2)}>
                      Review Order <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Review */}
            {step === 2 && (
              <div className="card fade-in">
                <h3 style={{ marginBottom: 20 }}>Review Your Order</h3>

                {/* Address summary */}
                <div style={{ marginBottom: 20, padding: 14, background: 'var(--bg3)',
                               borderRadius: 'var(--radius-sm)', fontSize: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <strong>Shipping to</strong>
                    <button style={{ background: 'none', color: 'var(--accent)', fontSize: 13 }} onClick={() => setStep(0)}>Edit</button>
                  </div>
                  <div style={{ color: 'var(--text2)' }}>
                    {address.shippingAddressLine1}{address.shippingAddressLine2 && `, ${address.shippingAddressLine2}`}<br />
                    {address.shippingCity}, {address.shippingState} {address.shippingZip}, {address.shippingCountry}
                  </div>
                </div>

                {/* Payment summary */}
                <div style={{ marginBottom: 20, padding: 14, background: 'var(--bg3)',
                               borderRadius: 'var(--radius-sm)', fontSize: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <strong>Payment</strong>
                    <button style={{ background: 'none', color: 'var(--accent)', fontSize: 13 }} onClick={() => setStep(1)}>Edit</button>
                  </div>
                  <div style={{ color: 'var(--text2)' }}>
                    {payment.paymentMethod.replace('_', ' ')} · {payment.cardHolderName}<br />
                    **** **** **** {payment.cardNumber.slice(-4)}
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginBottom: 20 }}>
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between',
                                                    padding: '10px 0', borderBottom: '1px solid var(--border)',
                                                    fontSize: 14 }}>
                      <span>{product.name} × {quantity}</span>
                      <span style={{ fontWeight: 600 }}>
                        ${((product.discountPrice ?? product.price) * quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary" style={{ flex: 1, padding: '13px 0' }}
                    onClick={handlePlaceOrder} disabled={loading}>
                    {loading
                      ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                      : `Place Order — ₹${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order mini-summary sidebar */}
          <div className="card" style={{ position: 'sticky', top: 90, fontSize: 14 }}>
            <h4 style={{ marginBottom: 14, fontSize: 15 }}>Summary</h4>
            {items.map(({ product, quantity }) => (
              <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between',
                                              padding: '6px 0', color: 'var(--text2)' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                  {product.name} ×{quantity}
                </span>
                <span>₹{((product.discountPrice ?? product.price) * quantity).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12,
                           display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text2)' }}>
                <span>Subtotal</span><span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text2)' }}>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? 'var(--success)' : 'inherit' }}>
                  {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text2)' }}>
                <span>Tax</span><span>₹{tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                             fontWeight: 800, fontSize: 17, fontFamily: 'var(--font-head)',
                             paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent)' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
