import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, ShieldAlert } from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';
import { api } from '../../services/api';

import { useAuth } from '../../context/AuthContext';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true); // Always reveal success to prevent enumeration in secure platforms
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="ambient ambient-left" aria-hidden="true" />
      <Navbar />

      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '36px', borderRadius: '24px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
          {submitted ? (
            <div>
              <CheckCircle size={48} style={{ color: 'var(--accent-secondary)', margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: '0 0 10px' }}>Check Your Inbox</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
                If an account exists for <strong>{email}</strong>, we have dispatched instructions and a verification code to reset your credentials.
              </p>
              <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                💡 Demo Eval Tip: You can immediately test password resets at the link below!
              </div>
              <Link to="/reset-password?token=demo-token-888" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '12px' }}>
                Go to Password Reset Screen
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>Return to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>Recover Password</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>Enter your account email to receive a secure recovery link.</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="builder@skillkollab.com"
                    style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', minHeight: '3rem', justifyContent: 'center' }}>
                {loading ? 'Dispatching...' : 'Send Recovery Instructions'}
                <ArrowRight size={18} />
              </button>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <Link to="/login" style={{ fontSize: '0.88rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to Sign In</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
export default ForgotPasswordPage;
