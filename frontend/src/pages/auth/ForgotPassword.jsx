import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card fade-in" style={{ maxWidth: 420, width: '100%', padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
          <h2 style={{ marginBottom: 8 }}>Forgot Password?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Enter your email and we'll send you a reset link</p>
        </div>

        {sent ? (
          <div className="alert alert-success">
            ✅ Reset link sent to <strong>{email}</strong>. Check your inbox!
            <div style={{ marginTop: 16 }}>
              <Link to="/login" className="btn btn-primary" style={{ justifyContent: 'center', width: '100%' }}>Back to Login</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14 }} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="divider" />
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
