import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { X, Mail, Lock, User, ArrowLeft, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, pendingAction, clearPendingAction, login, register, loginWithProvider, loading } = useAuth();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('options'); // 'options' | 'email-login' | 'create-account'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('USER');

  if (!isAuthModalOpen) return null;

  const executePendingAction = (userData) => {
    toast.success(`Welcome to SkillKollab, ${userData.name || 'Builder'}!`);
    closeAuthModal();
    setViewMode('options');

    // Return user to exactly the same page and continue their original selected action
    if (typeof pendingAction === 'function') {
      pendingAction();
    } else if (typeof pendingAction === 'string') {
      navigate(pendingAction);
    } else {
      const stored = sessionStorage.getItem('skillkollab_pending_redirect');
      if (stored) {
        sessionStorage.removeItem('skillkollab_pending_redirect');
        navigate(stored);
      }
    }
    clearPendingAction();
  };

  const handleProviderLogin = async (provider) => {
    try {
      const res = await loginWithProvider(provider);
      if (res.success) {
        executePendingAction(res.user);
      }
    } catch (err) {
      toast.error('Provider authentication failed. Please try again.');
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in both email and password.');
      return;
    }
    const res = await login(email, password);
    if (res.success) {
      executePendingAction(res.user);
    } else {
      toast.error(res.message || 'Login failed.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all registration fields.');
      return;
    }
    const res = await register(name, email, password, role);
    if (res.success) {
      executePendingAction(res.user);
    } else {
      toast.error(res.message || 'Account creation failed.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
        {/* Blurred Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/65 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
        />

        {/* Centered Glassmorphism Modal Box */}
        <motion.div
          className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-[28px] p-7 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.85)] z-10 overflow-hidden text-[var(--text-primary)]"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
        >
          {/* Ambient ambient glow inside modal */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-tr from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)] opacity-25 blur-[65px] pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:border-[var(--border-strong)] transition-all cursor-pointer z-20"
            aria-label="Close authentication modal"
          >
            <X size={18} />
          </button>

          {/* Header Section */}
          <div className="text-center mb-8 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
              SK
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-strong)] tracking-tight mb-2">
              Continue to SkillKollab
            </h3>
            <p className="text-sm text-[var(--text-secondary)] font-normal leading-relaxed max-w-sm mx-auto">
              Sign in to apply for challenges, collaborate with teams, and build your portfolio.
            </p>
          </div>

          {/* Dynamic Modal View Modes */}
          <div className="relative z-10">
            {viewMode === 'options' && (
              <div className="space-y-3.5">
                {/* Continue with Google */}
                <button
                  type="button"
                  onClick={() => handleProviderLogin('Google')}
                  disabled={loading}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] text-[var(--text-strong)] font-bold text-sm border border-[var(--border-strong)] flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer shadow-sm hover:border-[var(--color-primary)]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7 8.8 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                    <path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.8z"/>
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2-6.7-5.2L1.6 16.6C3.5 20.4 7.4 23 12 23z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Continue with GitHub */}
                <button
                  type="button"
                  onClick={() => handleProviderLogin('GitHub')}
                  disabled={loading}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] text-[var(--text-strong)] font-bold text-sm border border-[var(--border-strong)] flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer shadow-sm hover:border-[var(--color-primary)]"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>Continue with GitHub</span>
                </button>

                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                  <span className="text-[11px] font-bold uppercase text-[var(--text-muted)] tracking-wider">or email access</span>
                  <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                </div>

                {/* Email Login Button */}
                <button
                  type="button"
                  onClick={() => setViewMode('email-login')}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] text-[var(--text-strong)] font-bold text-sm border border-[var(--border-subtle)] flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer"
                >
                  <Mail size={18} className="text-[var(--text-accent)]" />
                  <span>Email Login</span>
                </button>

                {/* Create Account Button */}
                <button
                  type="button"
                  onClick={() => setViewMode('create-account')}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer hover:opacity-95"
                >
                  <Sparkles size={16} />
                  <span>Create Account</span>
                </button>
              </div>
            )}

            {viewMode === 'email-login' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)] mb-4">
                  <button
                    type="button"
                    onClick={() => setViewMode('options')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to sign-in options</span>
                  </button>
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Sign In</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail size={16} className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex.innovator@university.edu"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-sm text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative flex items-center">
                    <Lock size={16} className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-sm text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-extrabold text-sm shadow-md transition-all duration-200 cursor-pointer mt-2"
                >
                  {loading ? 'Authenticating...' : 'Sign In & Continue Action'}
                </button>
              </form>
            )}

            {viewMode === 'create-account' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)] mb-3">
                  <button
                    type="button"
                    onClick={() => setViewMode('options')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to sign-in options</span>
                  </button>
                  <span className="text-xs font-semibold text-[var(--text-muted)]">New Builder</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Full Name</label>
                  <div className="relative flex items-center">
                    <User size={16} className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-sm text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail size={16} className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@skillkollab.dev"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-sm text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Select Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-sm text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value="USER">Student Innovator / Contributor</option>
                    <option value="ORGANIZATION">Organization / Innovation Lead</option>
                    <option value="MENTOR">Academic Researcher / Mentor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Create Password</label>
                  <div className="relative flex items-center">
                    <Lock size={16} className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-sm text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-extrabold text-sm shadow-md transition-all duration-200 cursor-pointer mt-2"
                >
                  {loading ? 'Registering...' : 'Create Account & Continue Action'}
                </button>
              </form>
            )}
          </div>

          {/* Footer Security Badge */}
          <div className="mt-7 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] font-medium">
            <ShieldCheck size={15} className="text-emerald-400" />
            <span>256-Bit SSL Encrypted & Verified Credibility Engine</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default AuthModal;
