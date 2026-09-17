import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Lock, LogIn, UserPlus } from 'lucide-react';

export function LoginRequiredModal({ isOpen, onClose, challengeId, challengeTitle }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    sessionStorage.setItem('skillkollab_pending_redirect', `/projects/${challengeId}?action=apply`);
    onClose();
    navigate('/login');
  };

  const handleCreateAccount = () => {
    sessionStorage.setItem('skillkollab_pending_redirect', `/projects/${challengeId}?action=apply`);
    onClose();
    navigate('/register');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
          className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-[24px] p-7 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.85)] z-10 overflow-hidden text-[var(--text-primary)]"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-tr from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)] opacity-25 blur-[65px] pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:border-[var(--border-strong)] transition-all cursor-pointer z-20"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="text-center mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
              <Lock size={22} />
            </div>
            <h3 className="text-2xl font-extrabold text-[var(--text-strong)] tracking-tight mb-2">
              🔐 Login Required
            </h3>
            <p className="text-sm text-[var(--text-secondary)] font-normal leading-relaxed mx-auto">
              You need to log in or create an account before applying to this challenge.
            </p>
          </div>

          {/* Target Challenge Details */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-4 mb-8 text-center relative z-10">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">
              Challenge
            </span>
            <p className="text-sm font-bold text-[var(--text-strong)] truncate">
              {challengeTitle || 'Innovation Challenge'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 relative z-10">
            <button
              onClick={handleLogin}
              className="w-full py-3.5 px-5 rounded-xl bg-[var(--color-primary)] hover:bg-[#6D28D9] text-white font-bold text-sm shadow-[0_4px_12px_rgba(124,58,237,0.25)] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn size={16} />
              <span>Log In</span>
            </button>
            <button
              onClick={handleCreateAccount}
              className="w-full py-3.5 px-5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] text-[var(--text-strong)] font-bold text-sm border border-[var(--border-strong)] flex items-center justify-center gap-2 transition-all hover:border-[var(--color-primary)] cursor-pointer"
            >
              <UserPlus size={16} />
              <span>Create Account</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors mt-2 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
