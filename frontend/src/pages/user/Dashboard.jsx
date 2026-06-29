import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const pizzaVarieties = [
  { name: 'Margherita', emoji: '🍕', desc: 'Classic tomato, fresh mozzarella, basil', price: 249, tag: 'Bestseller' },
  { name: 'Veggie Delight', emoji: '🌿', desc: 'Loaded with garden-fresh veggies', price: 279, tag: 'Healthy' },
  { name: 'Chicken Tikka', emoji: '🍗', desc: 'Spicy Indian-style grilled chicken', price: 329, tag: 'Spicy' },
  { name: 'Pepperoni Feast', emoji: '🥩', desc: 'Double pepperoni with extra cheese', price: 359, tag: 'Popular' },
  { name: 'BBQ Chicken', emoji: '🔥', desc: 'Smoky BBQ sauce with grilled chicken', price: 339, tag: 'Smoky' },
  { name: 'Four Cheese', emoji: '🧀', desc: 'Mozzarella, cheddar, gouda, parmesan', price: 349, tag: 'Indulgent' },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    api.get('/orders/my-orders').then(res => {
      setRecentOrders(res.data.orders.slice(0, 3));
    }).catch(() => {}).finally(() => setLoadingOrders(false));
  }, []);

  const getStatusBadge = (status) => {
    const labels = { pending: '⏳ Pending', confirmed: '✅ Confirmed', in_kitchen: '👨‍🍳 In Kitchen', out_for_delivery: '🚴 On the Way', delivered: '🎉 Delivered', cancelled: '❌ Cancelled' };
    return <span className={`badge badge-${status}`}>{labels[status] || status}</span>;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page-container">
        {/* Hero */}
        <div className="fade-in" style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, #1e1020 100%)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: '48px 40px',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', right: -20, top: -20,
            fontSize: 160, opacity: 0.06, transform: 'rotate(15deg)',
            pointerEvents: 'none'
          }}>🍕</div>
          <h1 style={{ fontSize: 36, marginBottom: 12, position: 'relative' }}>
            Welcome back, <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0]}</span>! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 28, maxWidth: 500, position: 'relative' }}>
            Craving something delicious? Build your perfect custom pizza or pick from our favorites.
          </p>
          <Link to="/build-pizza" className="btn btn-primary" style={{ fontSize: 16, padding: '14px 32px', position: 'relative' }}>
            🍕 Build Your Pizza
          </Link>
          <Link to="/my-orders" className="btn btn-secondary" style={{ marginLeft: 12, fontSize: 16, padding: '14px 28px', position: 'relative' }}>
            My Orders
          </Link>
        </div>

        {/* Pizza varieties */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, marginBottom: 8 }}>Our Pizza Menu</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>Or build your own custom creation</p>
          
          <div className="grid-3">
            {pizzaVarieties.map((pizza, i) => (
              <div key={i} className="card" style={{
                cursor: 'pointer',
                animation: `fadeIn 0.4s ease ${i * 0.07}s both`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ fontSize: 48 }}>{pizza.emoji}</div>
                  <span style={{ background: 'var(--accent-glow)', color: 'var(--accent)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {pizza.tag}
                  </span>
                </div>
                <h3 style={{ fontSize: 18, marginBottom: 6, fontFamily: 'Playfair Display' }}>{pizza.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>{pizza.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 18 }}>₹{pizza.price}</span>
                  <Link to="/build-pizza" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                    Customize →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 24 }}>Recent Orders</h2>
              <Link to="/my-orders" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14 }}>View all →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentOrders.map(order => (
                <Link key={order._id} to={`/orders/${order._id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: 4 }}>Order #{order._id.toString().slice(-6).toUpperCase()}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric',month:'short',year:'numeric' })}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ color: 'var(--gold)', fontWeight: 700 }}>₹{order.totalPrice}</span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
