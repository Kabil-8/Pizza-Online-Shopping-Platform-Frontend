// VerifyEmail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

export function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(res => { setStatus('success'); setMessage(res.data.message); })
      .catch(err => { setStatus('error'); setMessage(err.response?.data?.message || 'Verification failed'); });
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card fade-in" style={{ maxWidth: 400, width: '100%', textAlign: 'center', padding: 48 }}>
        {status === 'verifying' && <><div className="spinner" style={{ margin: '0 auto 20px', width: 48, height: 48 }} /><p>Verifying your email...</p></>}
        {status === 'success' && <>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={{ marginBottom: 12 }}>Email Verified!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{message}</p>
          <Link to="/login" className="btn btn-primary" style={{ justifyContent: 'center' }}>Sign In Now</Link>
        </>}
        {status === 'error' && <>
          <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
          <h2 style={{ marginBottom: 12 }}>Verification Failed</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{message}</p>
          <Link to="/login" className="btn btn-secondary" style={{ justifyContent: 'center' }}>Go to Login</Link>
        </>}
      </div>
    </div>
  );
}

export default VerifyEmail;
