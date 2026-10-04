import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight, Lock, Mail, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/common/Navbar';
import { motion } from 'framer-motion';
import { redirectAfterLogin } from '../../utils/authUtils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required to sign in'),
});

export function LoginPage() {
  const { login, loginWithProvider, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const [searchParams] = useSearchParams();

  const onSubmit = async (data) => {
    setErrorMsg('');
    const res = await login(data.email, data.password);
    if (res.success) {
      let intended = searchParams.get('redirect');
      if (!intended && location.state?.from) {
        intended = typeof location.state.from === 'string' 
          ? location.state.from 
          : `${location.state.from.pathname}${location.state.from.search || ''}`;
      }
      if (!intended) {
        const stored = sessionStorage.getItem('skillkollab_pending_redirect');
        if (stored) {
          intended = stored;
          sessionStorage.removeItem('skillkollab_pending_redirect');
        }
      }
      
      const from = redirectAfterLogin(res.user, intended);
      navigate(from, { replace: true });
    } else {
      setErrorMsg(res.message || 'Invalid email or password');
    }
  };

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <div className="ambient ambient-left" aria-hidden="true" />
      <Navbar />

      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sk-glass-card" 
          style={{ width: '100%', maxWidth: '480px', padding: '40px', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ display: 'inline-flex', padding: '12px', borderRadius: '16px', background: 'rgba(109, 93, 246, 0.1)', color: 'var(--color-primary)', marginBottom: '16px' }}>
              <Lock size={28} />
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-strong)' }}>Welcome back to SkillKollab</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Sign in to continue your collaborative building journey.</p>
          </div>

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--accent-danger)', borderRadius: '10px', color: '#f87171', fontSize: '0.88rem', marginBottom: '20px' }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  placeholder="alex@stanford.edu"
                  {...register('email')}
                  style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px', background: 'var(--bg-main)', border: `1px solid ${errors.email ? 'var(--accent-danger)' : 'var(--border-strong)'}`, color: 'var(--text-strong)', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
              {errors.email && <span style={{ color: 'var(--accent-danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.email.message}</span>}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>Forgot Password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  {...register('password')}
                  style={{ width: '100%', padding: '12px 40px', borderRadius: '12px', background: 'var(--bg-main)', border: `1px solid ${errors.password ? 'var(--accent-danger)' : 'var(--border-strong)'}`, color: 'var(--text-strong)', fontSize: '0.95rem', outline: 'none' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span style={{ color: 'var(--accent-danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.password.message}</span>}
            </div>

            <motion.button 
              whileHover={{ scale: 1.01, boxShadow: '0 8px 28px rgba(109, 93, 246, 0.4)' }}
              whileTap={{ scale: 0.99 }}
              type="submit" 
              disabled={loading} 
              className="btn-sk-primary" 
              style={{ width: '100%', padding: '14px', fontSize: '1.05rem', marginTop: '8px' }}
            >
              {loading ? 'Signing in...' : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </motion.button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-strong)' }}></div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-strong)' }}></div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
            <button 
              type="button" 
              className="btn-sk-secondary" 
              style={{ flex: 1 }}
              onClick={async () => {
                setErrorMsg('');
                const res = await loginWithProvider('Google');
                if (res.success) {
                  let intended = searchParams.get('redirect');
                  if (!intended && location.state?.from) {
                    intended = typeof location.state.from === 'string' 
                      ? location.state.from 
                      : `${location.state.from.pathname}${location.state.from.search || ''}`;
                  }
                  if (!intended) {
                    const stored = sessionStorage.getItem('skillkollab_pending_redirect');
                    if (stored) {
                      intended = stored;
                      sessionStorage.removeItem('skillkollab_pending_redirect');
                    }
                  }
                  
                  const from = redirectAfterLogin(res.user, intended);
                  navigate(from, { replace: true });
                } else {
                  setErrorMsg(res.message);
                }
              }}
              disabled={loading}
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '18px' }} />
              Google
            </button>
            <button 
              type="button" 
              className="btn-sk-secondary" 
              style={{ flex: 1 }}
              onClick={async () => {
                setErrorMsg('');
                const res = await loginWithProvider('GitHub');
                if (res.success) {
                  let intended = searchParams.get('redirect');
                  if (!intended && location.state?.from) {
                    intended = typeof location.state.from === 'string' 
                      ? location.state.from 
                      : `${location.state.from.pathname}${location.state.from.search || ''}`;
                  }
                  if (!intended) {
                    const stored = sessionStorage.getItem('skillkollab_pending_redirect');
                    if (stored) {
                      intended = stored;
                      sessionStorage.removeItem('skillkollab_pending_redirect');
                    }
                  }
                  
                  const from = redirectAfterLogin(res.user, intended);
                  navigate(from, { replace: true });
                } else {
                  setErrorMsg(res.message);
                }
              }}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center', padding: '16px', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-strong)' }}>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Create Account <ArrowRight size={14} />
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
export default LoginPage;
