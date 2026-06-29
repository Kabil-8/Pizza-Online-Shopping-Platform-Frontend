import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';

const STATUS_INFO = {
  pending: { label: 'Payment Pending', icon: '⏳', color: 'var(--gold)' },
  confirmed: { label: 'Order Confirmed', icon: '✅', color: 'var(--green)' },
  in_kitchen: { label: 'Being Prepared', icon: '👨‍🍳', color: 'var(--accent)' },
  out_for_delivery: { label: 'Out for Delivery', icon: '🚴', color: 'var(--blue)' },
  delivered: { label: 'Delivered!', icon: '🎉', color: 'var(--green)' },
  cancelled: { label: 'Cancelled', icon: '❌', color: 'var(--red)' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = () => api.get(`/orders/${id}`).then(res => setOrder(res.data.order)).catch(() => {});
    fetchOrder().finally(() => setLoading(false));
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <div className="spinner" style={{ width: 48, height: 48 }} />
      </div>
    </div>
  );

  if (!order) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page-container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <h2>Order not found</h2>
        <Link to="/my-orders" className="btn btn-primary" style={{ marginTop: 20, justifyContent: 'center' }}>Back to Orders</Link>
      </div>
    </div>
  );

  const statusInfo = STATUS_INFO[order.status] || { label: order.status, icon: '📦', color: 'var(--text-secondary)' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page-container" style={{ maxWidth: 800 }}>
        <Link to="/my-orders" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: 24 }}>
          ← Back to My Orders
        </Link>

        {/* Status Hero */}
        <div className="card fade-in" style={{ textAlign: 'center', padding: 48, marginBottom: 24, border: `1px solid ${statusInfo.color}40` }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>{statusInfo.icon}</div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>{statusInfo.label}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Order #{order._id.toString().slice(-6).toUpperCase()}</p>
          {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <p style={{ color: 'var(--gold)', marginTop: 8, fontSize: 14 }}>
              Estimated delivery: {new Date(order.estimatedDelivery).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          {/* Pizza details */}
          <div className="card">
            <h3 style={{ marginBottom: 16, color: 'var(--accent)' }}>🍕 Pizza Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Base', item: order.pizza?.base },
                { label: 'Sauce', item: order.pizza?.sauce },
                { label: 'Cheese', item: order.pizza?.cheese },
              ].map(({ label, item }) => item && (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{label}</span>
                  <span style={{ fontSize: 14 }}>{item.image} {item.name}</span>
                </div>
              ))}
              {order.pizza?.veggies?.length > 0 && (
                <div style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'block', marginBottom: 6 }}>Veggies</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {order.pizza.veggies.map(v => <span key={v._id} style={{ background: 'rgba(6,214,160,0.1)', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>{v.image} {v.name}</span>)}
                  </div>
                </div>
              )}
              {order.pizza?.meats?.length > 0 && (
                <div style={{ padding: '8px 0' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'block', marginBottom: 6 }}>Meats</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {order.pizza.meats.map(m => <span key={m._id} style={{ background: 'rgba(255,107,53,0.1)', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>{m.image} {m.name}</span>)}
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Size: {order.size?.toUpperCase()} · Qty: {order.quantity}</span>
              <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 18 }}>₹{order.totalPrice}</span>
            </div>
          </div>

          {/* Delivery & Status History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <h3 style={{ marginBottom: 12, color: 'var(--accent)' }}>📍 Delivery Info</h3>
              <p style={{ fontSize: 14, marginBottom: 8 }}>{order.deliveryAddress}</p>
              {order.phone && <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>📞 {order.phone}</p>}
              {order.specialInstructions && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 6 }}>
                  💬 {order.specialInstructions}
                </p>
              )}
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 12, color: 'var(--accent)' }}>📋 Status History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {order.statusHistory?.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{h.status.replace('_', ' ')}</p>
                      {h.note && <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{h.note}</p>}
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(h.timestamp).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
