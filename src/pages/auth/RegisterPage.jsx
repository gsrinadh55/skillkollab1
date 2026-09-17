import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowRight, User, Mail, Lock, AlertCircle, Check, Eye, EyeOff, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/common/Navbar';
import { redirectAfterLogin } from '../../utils/authUtils';
import { motion, AnimatePresence } from 'framer-motion';

const registerSchema = z.object({
  role: z.enum(['USER', 'INNOVATION_LEAD', 'ORGANIZATION_ADMIN']),
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email address is required').email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function RegisterPage() {
  const { register: registerUser, loginWithProvider, loading } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [searchParams] = useSearchParams();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    defaultValues: {
      role: searchParams.get('role') === 'lead' ? 'INNOVATION_LEAD' : 'USER',
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setErrorMsg('');
    const res = await registerUser(data.name, data.email, data.password, data.role);
    if (res.success) {
      const stored = sessionStorage.getItem('skillkollab_pending_redirect');
      if (stored) {
        sessionStorage.removeItem('skillkollab_pending_redirect');
        navigate(stored, { replace: true });
      } else {
        if (data.role === 'ORGANIZATION_ADMIN') {
          navigate('/signup/organization/verification', { replace: true });
        } else if (data.role === 'USER' || data.role === 'STUDENT') {
          navigate('/onboarding', { replace: true });
        } else {
          navigate(redirectAfterLogin(res.user), { replace: true });
        }
      }
    } else {
      setErrorMsg(res.message || 'Registration failed');
    }
  };

  const handleRoleSelect = (roleId) => {
    setValue('role', roleId);
    setValue('name', '');
    setValue('email', '');
    setValue('password', '');
    setValue('confirmPassword', '');
  };

  const roles = [
    { id: 'USER', label: 'STUDENT / INNOVATOR', desc: 'Find challenges, build teams & create projects' },
    { id: 'ORGANIZATION_ADMIN', label: 'ORGANIZATION', desc: 'Publish challenges & discover student talent' }
  ];

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <div className="ambient ambient-right" aria-hidden="true" />
      <Navbar />

      <div style={{ display: 'flex', flex: 1, padding: '40px 16px', justifyContent: 'center', alignItems: 'center' }}>
        <div className="two-column-grid" style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', alignItems: 'center', gap: '60px' }}>
          
          {/* Left Column (Intro) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ paddingRight: '20px' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', fontSize: '0.85rem' }}>
              <Sparkles size={16} />
              Real-World Innovation Platform
            </div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.03em' }}>
              Build. Collaborate.<br />
              <span className="sk-gradient-text">Create Real Impact.</span>
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px', maxWidth: '400px' }}>
              Join students and innovators building solutions for real-world challenges.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {['Discover real-world challenges', 'Find the right collaborators', 'Build projects for your portfolio'].map((feat, i) => (
                <motion.li 
                  key={feat} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(109, 93, 246, 0.15)', color: 'var(--color-primary)' }}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                  {feat}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right Column Form */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="sk-glass-card" 
            style={{ padding: '40px', width: '100%', maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-strong)' }}>Create Your SkillKollab Account</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Start building, collaborating, and solving real-world challenges.</p>
            </div>

            {errorMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--accent-danger)', borderRadius: '10px', color: '#f87171', fontSize: '0.88rem', marginBottom: '20px' }}>
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {roles.map(role => (
                    <motion.div
                      key={role.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleSelect(role.id)}
                      style={{
                        position: 'relative',
                        padding: '16px',
                        borderRadius: '16px',
                        border: `1px solid ${selectedRole === role.id ? 'var(--color-primary)' : 'var(--border-strong)'}`,
                        background: selectedRole === role.id ? 'var(--bg-surface)' : 'var(--bg-card)',
                        boxShadow: selectedRole === role.id ? 'var(--shadow-glow-primary)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        overflow: 'hidden'
                      }}
                    >
                      {selectedRole === role.id && (
                        <motion.div layoutId="role-border" style={{ position: 'absolute', inset: 0, borderRadius: '16px', border: '2px solid var(--color-primary)', pointerEvents: 'none' }} />
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: selectedRole === role.id ? 'var(--color-primary)' : 'var(--text-strong)' }}>{role.label}</span>
                        {selectedRole === role.id && <Check size={16} color="var(--color-primary)" />}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{role.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="popLayout">
                <motion.div
                  key={selectedRole}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      {selectedRole === 'USER' ? 'Full Name' : 'Organization Name'} <span style={{ color: 'var(--accent-danger)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                        {selectedRole === 'USER' ? <User size={16} /> : <Building size={16} />}
                      </div>
                      <input
                        type="text"
                        placeholder={selectedRole === 'USER' ? 'Enter your full name' : 'Enter organization name'}
                        {...register('name')}
                        style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px', background: 'var(--bg-main)', border: `1px solid ${errors.name ? 'var(--accent-danger)' : 'var(--border-strong)'}`, color: 'var(--text-strong)', fontSize: '0.95rem', outline: 'none' }}
                      />
                    </div>
                    {errors.name && <span style={{ color: 'var(--accent-danger)', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>{errors.name.message}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      {selectedRole === 'USER' ? 'Email Address' : 'Official Email'} <span style={{ color: 'var(--accent-danger)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        placeholder={selectedRole === 'USER' ? 'Enter your email address' : 'Enter official email'}
                        {...register('email')}
                        style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px', background: 'var(--bg-main)', border: `1px solid ${errors.email ? 'var(--accent-danger)' : 'var(--border-strong)'}`, color: 'var(--text-strong)', fontSize: '0.95rem', outline: 'none' }}
                      />
                    </div>
                    {errors.email && <span style={{ color: 'var(--accent-danger)', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>{errors.email.message}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Password <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                        <Lock size={16} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        {...register('password')}
                        style={{ width: '100%', padding: '12px 40px', borderRadius: '12px', background: 'var(--bg-main)', border: `1px solid ${errors.password ? 'var(--accent-danger)' : 'var(--border-strong)'}`, color: 'var(--text-strong)', fontSize: '0.95rem', outline: 'none' }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <span style={{ color: 'var(--accent-danger)', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>{errors.password.message}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Confirm Password <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                        <Lock size={16} />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        {...register('confirmPassword')}
                        style={{ width: '100%', padding: '12px 40px', borderRadius: '12px', background: 'var(--bg-main)', border: `1px solid ${errors.confirmPassword ? 'var(--accent-danger)' : 'var(--border-strong)'}`, color: 'var(--text-strong)', fontSize: '0.95rem', outline: 'none' }}
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <span style={{ color: 'var(--accent-danger)', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>{errors.confirmPassword.message}</span>}
                  </div>
                </motion.div>
              </AnimatePresence>

              <motion.button 
                whileHover={{ scale: 1.01, boxShadow: '0 8px 28px rgba(109, 93, 246, 0.4)' }}
                whileTap={{ scale: 0.99 }}
                type="submit" 
                disabled={loading} 
                className="btn-sk-primary" 
                style={{ width: '100%', padding: '14px', fontSize: '1.05rem', marginTop: '8px' }}
              >
                {loading ? 'Creating account...' : (
                  <>{selectedRole === 'USER' ? 'Create Student Account' : 'Create Organization Account'} <ArrowRight size={18} /></>
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
                    const stored = sessionStorage.getItem('skillkollab_pending_redirect');
                    if (stored) {
                      sessionStorage.removeItem('skillkollab_pending_redirect');
                      navigate(stored, { replace: true });
                    } else {
                      navigate(redirectAfterLogin(res.user), { replace: true });
                    }
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
                    const stored = sessionStorage.getItem('skillkollab_pending_redirect');
                    if (stored) {
                      sessionStorage.removeItem('skillkollab_pending_redirect');
                      navigate(stored, { replace: true });
                    } else {
                      navigate(redirectAfterLogin(res.user), { replace: true });
                    }
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
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Sign In <ArrowRight size={14} />
                </Link>
              </p>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
export default RegisterPage;
