import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';

const StatCard = ({ icon, label, value, color = 'var(--accent)', sub }) => (
  <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 80, opacity: 0.05 }}>{icon}</div>
    <p style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{label}</p>
    <h2 style={{ fontSize: 36, color, fontFamily: 'Playfair Display', marginBottom: 4 }}>{value}</h2>
    {sub && <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{sub}</p>}
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/inventory/stats'),
      api.get('/orders?limit=5'),
      api.get('/inventory?category='),
    ]).then(([statsRes, ordersRes, inventoryRes]) => {
      setStats(statsRes.data.stats);
      setRecentOrders(ordersRes.data.orders);
      setLowStock(inventoryRes.data.items.filter(i => i.quantity <= i.threshold).slice(0, 6));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const STATUS_LABELS = {
    pending: '⏳ Pending', confirmed: '✅ Confirmed',
    in_kitchen: '👨‍🍳 In Kitchen', out_for_delivery: '🚴 On Way',
    delivered: '🎉 Delivered', cancelled: '❌ Cancelled'
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <div className="spinner" style={{ width: 48, height: 48 }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page-container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats grid */}
        {stats && (
          <div className="grid-4" style={{ marginBottom: 32 }}>
            <StatCard icon="📦" label="Total Orders" value={stats.totalOrders} color="var(--accent)" />
            <StatCard icon="📅" label="Today's Orders" value={stats.todayOrders} color="var(--gold)" />
            <StatCard icon="🔄" label="Active Orders" value={stats.pendingOrders} color="var(--blue)" />
            <StatCard icon="💰" label="Revenue" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} color="var(--green)" sub={`${stats.lowStockItems} low stock items`} />
          </div>
        )}

        <div className="grid-2" style={{ gap: 24 }}>
          {/* Recent Orders */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20 }}>Recent Orders</h2>
              <Link to="/admin/orders" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14 }}>View all →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentOrders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No orders yet</div>
              ) : recentOrders.map(order => (
                <Link key={order._id} to="/admin/orders" style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>#{order._id.toString().slice(-6).toUpperCase()}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{order.user?.name} · {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge badge-${order.status}`}>{STATUS_LABELS[order.status]}</span>
                      <p style={{ color: 'var(--gold)', fontWeight: 700, marginTop: 4, fontSize: 14 }}>₹{order.totalPrice}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20 }}>⚠️ Low Stock Alerts</h2>
              <Link to="/admin/inventory" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14 }}>Manage →</Link>
            </div>
            {lowStock.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                <p style={{ color: 'var(--green)' }}>All stock levels are good!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lowStock.map(item => (
                  <div key={item._id} className="card" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: item.quantity === 0 ? 'var(--red)' : 'rgba(255,209,102,0.3)' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{item.image} {item.name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 12, textTransform: 'capitalize' }}>{item.category}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: item.quantity === 0 ? 'var(--red)' : 'var(--gold)', fontWeight: 700, fontSize: 16 }}>{item.quantity}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>threshold: {item.threshold}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
