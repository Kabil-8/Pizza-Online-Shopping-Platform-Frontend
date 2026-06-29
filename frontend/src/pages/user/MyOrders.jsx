import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';

const STATUS_LABELS = {
  pending: { label: '⏳ Pending', color: 'var(--gold)' },
  confirmed: { label: '✅ Confirmed', color: 'var(--green)' },
  in_kitchen: { label: '👨‍🍳 In Kitchen', color: 'var(--accent)' },
  out_for_delivery: { label: '🚴 On the Way', color: 'var(--blue)' },
  delivered: { label: '🎉 Delivered', color: 'var(--green)' },
  cancelled: { label: '❌ Cancelled', color: 'var(--red)' },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-orders')
      .then(res => setOrders(res.data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
    // Poll for live updates every 15s
    const interval = setInterval(() => {
      api.get('/orders/my-orders').then(res => setOrders(res.data.orders)).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page-container">
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>My Orders</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Track your pizza orders in real-time</p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 48, height: 48 }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 64 }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>🍕</div>
            <h2 style={{ marginBottom: 12 }}>No orders yet!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Start by building your perfect pizza</p>
            <Link to="/build-pizza" className="btn btn-primary" style={{ justifyContent: 'center' }}>Build Your Pizza</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map((order, i) => {
              const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: 'var(--text-secondary)' };
              return (
                <div key={order._id} className="card fade-in" style={{ animation: `fadeIn 0.3s ease ${i * 0.05}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <h3 style={{ fontSize: 18 }}>Order #{order._id.toString().slice(-6).toUpperCase()}</h3>
                        <span className={`badge badge-${order.status}`}>{statusInfo.label}</span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 20, marginBottom: 4 }}>₹{order.totalPrice}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{order.size?.toUpperCase()} · Qty {order.quantity}</div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '12px 0' }}>
                    {order.pizza?.base && <span style={{ background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: 20, fontSize: 12 }}>{order.pizza.base.image} {order.pizza.base.name}</span>}
                    {order.pizza?.sauce && <span style={{ background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: 20, fontSize: 12 }}>{order.pizza.sauce.image} {order.pizza.sauce.name}</span>}
                    {order.pizza?.cheese && <span style={{ background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: 20, fontSize: 12 }}>{order.pizza.cheese.image} {order.pizza.cheese.name}</span>}
                    {order.pizza?.veggies?.map(v => <span key={v._id} style={{ background: 'rgba(6,214,160,0.1)', border: '1px solid rgba(6,214,160,0.2)', padding: '4px 10px', borderRadius: 20, fontSize: 12 }}>{v.image} {v.name}</span>)}
                    {order.pizza?.meats?.map(m => <span key={m._id} style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)', padding: '4px 10px', borderRadius: 20, fontSize: 12 }}>{m.image} {m.name}</span>)}
                  </div>

                  {/* Status timeline */}
                  <div style={{ margin: '16px 0', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {['confirmed', 'in_kitchen', 'out_for_delivery', 'delivered'].map((s, idx) => {
                        const statusOrder = ['pending', 'confirmed', 'in_kitchen', 'out_for_delivery', 'delivered'];
                        const currentIdx = statusOrder.indexOf(order.status);
                        const sIdx = statusOrder.indexOf(s);
                        const done = currentIdx >= sIdx;
                        const icons = { confirmed: '✅', in_kitchen: '👨‍🍳', out_for_delivery: '🚴', delivered: '🎉' };
                        const labels = { confirmed: 'Confirmed', in_kitchen: 'Kitchen', out_for_delivery: 'Delivery', delivered: 'Delivered' };
                        return (
                          <React.Fragment key={s}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                              <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: done ? 'var(--accent)' : 'var(--bg-card)',
                                border: `2px solid ${done ? 'var(--accent)' : 'var(--border)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 16, transition: 'all 0.3s'
                              }}>{icons[s]}</div>
                              <span style={{ fontSize: 10, color: done ? 'var(--text-primary)' : 'var(--text-muted)' }}>{labels[s]}</span>
                            </div>
                            {idx < 3 && <div style={{ flex: 1, height: 2, background: done && currentIdx > sIdx ? 'var(--accent)' : 'var(--border)', margin: '0 4px', marginBottom: 16, transition: 'all 0.3s' }} />}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>📍 {order.deliveryAddress}</p>
                    <Link to={`/orders/${order._id}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
