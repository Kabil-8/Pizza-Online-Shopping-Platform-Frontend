import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_FLOW = {
  confirmed: { label: '✅ Confirmed', next: 'in_kitchen', nextLabel: '👨‍🍳 Send to Kitchen', color: 'var(--green)' },
  in_kitchen: { label: '👨‍🍳 In Kitchen', next: 'out_for_delivery', nextLabel: '🚴 Send for Delivery', color: 'var(--accent)' },
  out_for_delivery: { label: '🚴 Out for Delivery', next: 'delivered', nextLabel: '✅ Mark Delivered', color: 'var(--blue)' },
  delivered: { label: '🎉 Delivered', next: null, color: 'var(--green)' },
  pending: { label: '⏳ Pending Payment', next: null, color: 'var(--gold)' },
  cancelled: { label: '❌ Cancelled', next: null, color: 'var(--red)' },
};

const FILTERS = ['all', 'confirmed', 'in_kitchen', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = () => {
    const params = filter !== 'all' ? `?status=${filter}` : '';
    return api.get(`/orders${params}`).then(res => setOrders(res.data.orders)).catch(console.error);
  };

  useEffect(() => {
    setLoading(true);
    fetchOrders().finally(() => setLoading(false));
    const interval = setInterval(fetchOrders, 20000);
    return () => clearInterval(interval);
  }, [filter]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to: ${newStatus.replace('_', ' ')}`);
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!confirm('Cancel this order?')) return;
    await updateStatus(orderId, 'cancelled');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 32, marginBottom: 4 }}>Order Management</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{orders.length} orders {filter !== 'all' ? `(${filter.replace('_', ' ')})` : ''}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => fetchOrders()} style={{ fontSize: 13 }}>🔄 Refresh</button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: 13, textTransform: 'capitalize' }}>
              {f === 'all' ? '📋 All' : STATUS_FLOW[f]?.label || f}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 48, height: 48 }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 60, marginBottom: 12 }}>📭</div>
            <p>No orders found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((order, i) => {
              const statusInfo = STATUS_FLOW[order.status] || { label: order.status, color: 'var(--text-secondary)' };
              const isExpanded = expandedOrder === order._id;

              return (
                <div key={order._id} className="card fade-in" style={{ animation: `fadeIn 0.3s ease ${i * 0.04}s both`, padding: 0, overflow: 'hidden' }}>
                  {/* Order header */}
                  <div
                    style={{ padding: '16px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}
                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <h3 style={{ fontSize: 16 }}>#{order._id.toString().slice(-6).toUpperCase()}</h3>
                          <span className={`badge badge-${order.status}`}>{statusInfo.label}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                          👤 {order.user?.name} · {order.user?.email}
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 18 }}>₹{order.totalPrice}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{order.size?.toUpperCase()} · Qty {order.quantity}</p>
                      </div>

                      {/* Status action buttons */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        {statusInfo.next && (
                          <button
                            className="btn btn-primary"
                            style={{ padding: '8px 14px', fontSize: 12 }}
                            onClick={(e) => { e.stopPropagation(); updateStatus(order._id, statusInfo.next); }}
                            disabled={updating === order._id}
                          >
                            {updating === order._id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : statusInfo.nextLabel}
                          </button>
                        )}
                        {!['delivered', 'cancelled'].includes(order.status) && (
                          <button
                            className="btn btn-danger"
                            style={{ padding: '8px 12px', fontSize: 12 }}
                            onClick={(e) => { e.stopPropagation(); cancelOrder(order._id); }}
                            disabled={updating === order._id}
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                      <div className="grid-2" style={{ gap: 20 }}>
                        {/* Pizza config */}
                        <div>
                          <h4 style={{ marginBottom: 12, color: 'var(--accent)' }}>🍕 Pizza Configuration</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                              { label: 'Base', item: order.pizza?.base },
                              { label: 'Sauce', item: order.pizza?.sauce },
                              { label: 'Cheese', item: order.pizza?.cheese },
                            ].filter(x => x.item).map(({ label, item }) => (
                              <div key={label} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                                <span style={{ color: 'var(--text-muted)', minWidth: 50 }}>{label}:</span>
                                <span>{item.image} {item.name}</span>
                              </div>
                            ))}
                            {order.pizza?.veggies?.length > 0 && (
                              <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                                <span style={{ color: 'var(--text-muted)', minWidth: 50 }}>Veggies:</span>
                                <span>{order.pizza.veggies.map(v => `${v.image} ${v.name}`).join(', ')}</span>
                              </div>
                            )}
                            {order.pizza?.meats?.length > 0 && (
                              <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                                <span style={{ color: 'var(--text-muted)', minWidth: 50 }}>Meats:</span>
                                <span>{order.pizza.meats.map(m => `${m.image} ${m.name}`).join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Delivery info + status history */}
                        <div>
                          <h4 style={{ marginBottom: 12, color: 'var(--accent)' }}>📍 Delivery Details</h4>
                          <p style={{ fontSize: 13, marginBottom: 6 }}>📍 {order.deliveryAddress}</p>
                          {order.phone && <p style={{ fontSize: 13, marginBottom: 6 }}>📞 {order.phone}</p>}
                          {order.specialInstructions && <p style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 6 }}>💬 {order.specialInstructions}</p>}

                          <h4 style={{ marginTop: 16, marginBottom: 10, color: 'var(--accent)' }}>📋 Status Timeline</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {order.statusHistory?.slice().reverse().map((h, idx) => (
                              <div key={idx} style={{ fontSize: 12, display: 'flex', gap: 8 }}>
                                <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(h.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                <span style={{ textTransform: 'capitalize', fontWeight: idx === 0 ? 600 : 400 }}>{h.status.replace('_', ' ')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
