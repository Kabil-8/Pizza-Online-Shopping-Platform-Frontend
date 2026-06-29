import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STEPS = ['Base', 'Sauce', 'Cheese', 'Veggies', 'Review & Pay'];

export default function BuildPizza() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [options, setOptions] = useState({ base: [], sauce: [], cheese: [], veggie: [], meat: [] });
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [selection, setSelection] = useState({
    base: null, sauce: null, cheese: null,
    veggies: [], meats: [],
    size: 'medium', quantity: 1,
    address: user?.address || '', phone: user?.phone || '',
    specialInstructions: ''
  });
  const [price, setPrice] = useState(0);

  useEffect(() => {
    api.get('/pizza/options').then(res => {
      setOptions(res.data.options);
      setLoading(false);
    }).catch(() => { toast.error('Failed to load options'); setLoading(false); });
  }, []);

  useEffect(() => {
    if (selection.base && selection.sauce && selection.cheese) {
      api.post('/pizza/calculate-price', {
        baseId: selection.base._id, sauceId: selection.sauce._id,
        cheeseId: selection.cheese._id, veggieIds: selection.veggies.map(v=>v._id),
        meatIds: selection.meats.map(m=>m._id), size: selection.size, quantity: selection.quantity
      }).then(res => setPrice(res.data.totalPrice)).catch(() => {});
    }
  }, [selection.base, selection.sauce, selection.cheese, selection.veggies, selection.meats, selection.size, selection.quantity]);

  const toggleVeggie = (item) => {
    setSelection(s => {
      const exists = s.veggies.find(v => v._id === item._id);
      return { ...s, veggies: exists ? s.veggies.filter(v => v._id !== item._id) : [...s.veggies, item] };
    });
  };

  const toggleMeat = (item) => {
    setSelection(s => {
      const exists = s.meats.find(m => m._id === item._id);
      return { ...s, meats: exists ? s.meats.filter(m => m._id !== item._id) : [...s.meats, item] };
    });
  };

  const canProceed = () => {
    if (step === 0) return !!selection.base;
    if (step === 1) return !!selection.sauce;
    if (step === 2) return !!selection.cheese;
    if (step === 3) return true;
    return false;
  };

  const handlePayment = async () => {
    if (!selection.address) return toast.error('Please enter delivery address');
    setPaying(true);
    try {
      const { data } = await api.post('/payment/create-order', {
        amount: price,
        pizzaConfig: {
          baseId: selection.base._id, sauceId: selection.sauce._id,
          cheeseId: selection.cheese._id, veggieIds: selection.veggies.map(v=>v._id),
          meatIds: selection.meats.map(m=>m._id)
        },
        deliveryAddress: selection.address, phone: selection.phone,
        specialInstructions: selection.specialInstructions,
        size: selection.size, quantity: selection.quantity
      });

      // Try Razorpay if key is real, otherwise use test mode
      const keyId = data.keyId;
      if (keyId && keyId !== 'rzp_test_placeholder' && window.Razorpay) {
        const rzp = new window.Razorpay({
          key: keyId,
          amount: data.amount,
          currency: data.currency,
          order_id: data.razorpayOrderId,
          name: 'PizzaCraft',
          description: 'Custom Pizza Order',
          handler: async (response) => {
            await verifyPayment({ ...response, orderId: data.orderId });
          },
          prefill: { name: user.name, email: user.email, contact: selection.phone },
          theme: { color: '#ff6b35' }
        });
        rzp.open();
      } else {
        // Test mode - simulate successful payment
        await verifyPayment({
          razorpay_order_id: data.razorpayOrderId,
          razorpay_payment_id: `test_pay_${Date.now()}`,
          razorpay_signature: 'test_signature',
          orderId: data.orderId,
          testMode: true
        });
      }
    } catch (err) {
      toast.error('Payment failed: ' + (err.response?.data?.message || err.message));
      setPaying(false);
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      const { data } = await api.post('/payment/verify', paymentData);
      toast.success('🎉 Order placed successfully!');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error('Payment verification failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <div className="spinner" style={{ width: 48, height: 48 }} />
      </div>
    </div>
  );

  const ItemCard = ({ item, selected, onSelect, multi = false }) => (
    <div
      onClick={() => onSelect(item)}
      className={`card ${selected ? 'selected-item' : ''}`}
      style={{ cursor: 'pointer', padding: 16 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>{item.image}</div>
        {selected && <span style={{ color: 'var(--accent)', fontSize: 20 }}>✓</span>}
      </div>
      <h4 style={{ fontSize: 15, marginBottom: 4 }}>{item.name}</h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 8, lineHeight: 1.4 }}>{item.description}</p>
      <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 14 }}>+₹{item.price}</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page-container" style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 36, marginBottom: 8 }}>Build Your <span style={{ color: 'var(--accent)' }}>Perfect Pizza</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Craft it your way, every ingredient matters</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40, gap: 0 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: i < step ? 'var(--green)' : i === step ? 'var(--accent)' : 'var(--bg-card)',
                border: `2px solid ${i <= step ? (i < step ? 'var(--green)' : 'var(--accent)') : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: i <= step ? 'white' : 'var(--text-muted)',
                fontWeight: 700, fontSize: 14, flexShrink: 0,
                transition: 'all 0.3s'
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <div style={{ marginLeft: 6, marginRight: 6, fontSize: 12, color: i === step ? 'var(--text-primary)' : 'var(--text-muted)', display: window.innerWidth > 500 ? 'block' : 'none' }}>{s}</div>
              {i < STEPS.length - 1 && <div style={{ width: 32, height: 2, background: i < step ? 'var(--green)' : 'var(--border)', margin: '0 4px', transition: 'all 0.3s' }} />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="fade-in" key={step}>
          {step === 0 && (
            <div>
              <h2 style={{ marginBottom: 6, textAlign: 'center' }}>Choose Your Base</h2>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 24, fontSize: 14 }}>The foundation of your pizza</p>
              <div className="grid-3">
                {options.base.map(item => (
                  <ItemCard key={item._id} item={item} selected={selection.base?._id === item._id} onSelect={i => setSelection(s => ({ ...s, base: i }))} />
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 style={{ marginBottom: 6, textAlign: 'center' }}>Choose Your Sauce</h2>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 24, fontSize: 14 }}>The flavor backbone</p>
              <div className="grid-3">
                {options.sauce.map(item => (
                  <ItemCard key={item._id} item={item} selected={selection.sauce?._id === item._id} onSelect={i => setSelection(s => ({ ...s, sauce: i }))} />
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ marginBottom: 6, textAlign: 'center' }}>Select Your Cheese</h2>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 24, fontSize: 14 }}>Pick one cheesy goodness</p>
              <div className="grid-3">
                {options.cheese.map(item => (
                  <ItemCard key={item._id} item={item} selected={selection.cheese?._id === item._id} onSelect={i => setSelection(s => ({ ...s, cheese: i }))} />
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ marginBottom: 6, textAlign: 'center' }}>Add Toppings</h2>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 24, fontSize: 14 }}>Select as many as you like</p>
              
              <h3 style={{ fontSize: 16, marginBottom: 12, color: 'var(--text-secondary)' }}>🥦 Veggies ({selection.veggies.length} selected)</h3>
              <div className="grid-4" style={{ marginBottom: 24 }}>
                {options.veggie.map(item => (
                  <ItemCard key={item._id} item={item} selected={!!selection.veggies.find(v=>v._id===item._id)} onSelect={toggleVeggie} multi />
                ))}
              </div>

              <h3 style={{ fontSize: 16, marginBottom: 12, color: 'var(--text-secondary)' }}>🍗 Meats ({selection.meats.length} selected)</h3>
              <div className="grid-4">
                {options.meat.map(item => (
                  <ItemCard key={item._id} item={item} selected={!!selection.meats.find(m=>m._id===item._id)} onSelect={toggleMeat} multi />
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={{ marginBottom: 24, textAlign: 'center' }}>Review Your Pizza</h2>
              <div className="grid-2" style={{ gap: 24 }}>
                {/* Pizza Summary */}
                <div>
                  <div className="card" style={{ marginBottom: 16 }}>
                    <h3 style={{ marginBottom: 16, color: 'var(--accent)' }}>🍕 Your Custom Pizza</h3>
                    {[
                      { label: 'Base', value: selection.base?.name, emoji: selection.base?.image },
                      { label: 'Sauce', value: selection.sauce?.name, emoji: selection.sauce?.image },
                      { label: 'Cheese', value: selection.cheese?.name, emoji: selection.cheese?.image },
                    ].map(({ label, value, emoji }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{label}</span>
                        <span style={{ fontSize: 14 }}>{emoji} {value}</span>
                      </div>
                    ))}
                    {selection.veggies.length > 0 && (
                      <div style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Veggies</span>
                        <p style={{ fontSize: 13, marginTop: 4 }}>{selection.veggies.map(v=>v.name).join(', ')}</p>
                      </div>
                    )}
                    {selection.meats.length > 0 && (
                      <div style={{ padding: '8px 0' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Meats</span>
                        <p style={{ fontSize: 13, marginTop: 4 }}>{selection.meats.map(m=>m.name).join(', ')}</p>
                      </div>
                    )}
                  </div>

                  <div className="card">
                    <h4 style={{ marginBottom: 12 }}>Size & Quantity</h4>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                      {['small', 'medium', 'large'].map(s => (
                        <button key={s} onClick={() => setSelection(sel => ({...sel, size: s}))}
                          className={`btn ${selection.size === s ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, justifyContent: 'center', padding: '8px 0', fontSize: 13 }}>
                          {s === 'small' ? '🍕 S' : s === 'medium' ? '🍕 M' : '🍕 L'}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={() => setSelection(s => ({...s, quantity: Math.max(1, s.quantity-1)}))}
                        style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 18 }}>−</button>
                      <span style={{ fontWeight: 700, fontSize: 20, minWidth: 24, textAlign: 'center' }}>{selection.quantity}</span>
                      <button onClick={() => setSelection(s => ({...s, quantity: Math.min(10, s.quantity+1)}))}
                        style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 18 }}>+</button>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div>
                  <div className="card" style={{ marginBottom: 16 }}>
                    <h4 style={{ marginBottom: 12 }}>Delivery Details</h4>
                    <div className="form-group">
                      <label className="form-label">Delivery Address *</label>
                      <input className="form-input" placeholder="Full delivery address" value={selection.address}
                        onChange={e => setSelection(s => ({...s, address: e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" placeholder="+91 9876543210" value={selection.phone}
                        onChange={e => setSelection(s => ({...s, phone: e.target.value}))} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Special Instructions</label>
                      <input className="form-input" placeholder="Extra crispy, less spice, etc." value={selection.specialInstructions}
                        onChange={e => setSelection(s => ({...s, specialInstructions: e.target.value}))} />
                    </div>
                  </div>

                  <div className="card" style={{ background: 'var(--bg-card)' }}>
                    <h4 style={{ marginBottom: 16 }}>Order Summary</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                      <span>Pizza ({selection.size})</span><span>₹{price}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                      <span>Delivery</span><span style={{ color: 'var(--green)' }}>FREE</span>
                    </div>
                    <div className="divider" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 20 }}>
                      <span>Total</span><span style={{ color: 'var(--gold)' }}>₹{price}</span>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16, padding: 14, fontSize: 16 }}
                      onClick={handlePayment} disabled={paying}>
                      {paying ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Processing...</> : `💳 Pay ₹${price}`}
                    </button>
                    <p style={{ color: 'var(--text-muted)', fontSize: 11, textAlign: 'center', marginTop: 8 }}>🔒 Test mode - click to simulate payment</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            ← Back
          </button>
          {step < 4 && (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
              {step === 3 ? 'Review Order →' : 'Next →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
