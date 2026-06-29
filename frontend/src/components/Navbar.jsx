import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = isAdmin
    ? [
        { to: '/admin', label: 'Dashboard' },
        { to: '/admin/orders', label: 'Orders' },
        { to: '/admin/inventory', label: 'Inventory' },
      ]
    : [
        { to: '/dashboard', label: 'Home' },
        { to: '/build-pizza', label: 'Build Pizza' },
        { to: '/my-orders', label: 'My Orders' },
      ];

  return (
    <nav style={{
      background: 'rgba(13,13,20,0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to={isAdmin ? '/admin' : '/dashboard'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 28 }}>🍕</span>
          <span style={{ fontFamily: 'Playfair Display', fontWeight: 900, fontSize: 20, color: 'var(--accent)' }}>PizzaCraft</span>
          {isAdmin && <span style={{ background: 'var(--accent)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, marginLeft: 4 }}>ADMIN</span>}
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              padding: '8px 14px',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              color: location.pathname === link.to ? 'var(--accent)' : 'var(--text-secondary)',
              background: location.pathname === link.to ? 'var(--accent-glow)' : 'transparent',
              transition: 'all 0.2s'
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isAdmin && (
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                width: 36, height: 36,
                background: 'var(--accent)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: 14
              }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            </Link>
          )}
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
