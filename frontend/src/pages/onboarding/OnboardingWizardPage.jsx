import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Lightbulb, CheckCircle2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { completeOnboardingWizard } from '../../store/slices/authSlice';
import { useAuth } from '../../context/AuthContext';
import { redirectAfterLogin } from '../../utils/authUtils';

export function OnboardingWizardPage() {
  const [selectedRole, setSelectedRole] = useState(null); // 'INNOVATION_LEAD' | 'INNOVATION_CONTRIBUTOR'
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { completeOnboarding, user } = useAuth();

  const handleCardClick = (role) => {
    setSelectedRole(role);
    toast.dismiss();
    const roleName = role === 'INNOVATION_LEAD' ? '🚀 Innovation Lead' : '💡 Innovation Contributor';
    toast('Selected: ' + roleName + '. Click Continue to enter your dashboard!', {
      icon: '✨',
      style: { background: '#18181B', color: '#22D3EE', border: '1px solid #6D5DF6' }
    });
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    dispatch(completeOnboardingWizard(selectedRole));
    
    // Map INNOVATION_CONTRIBUTOR to base STUDENT role for correct dashboard routing
    const finalRole = selectedRole === 'INNOVATION_CONTRIBUTOR' ? 'STUDENT' : selectedRole;
    
    completeOnboarding({ role: finalRole });
    toast.success('Welcome to the SkillKollab Ecosystem! Your tailored workspace is ready.');
    
    const stored = sessionStorage.getItem('skillkollab_pending_redirect');
    if (stored) {
      sessionStorage.removeItem('skillkollab_pending_redirect');
      navigate(stored);
    } else {
      // Use fake updated user to redirect immediately before context catches up
      const fakeUpdatedUser = { ...user, role: finalRole };
      navigate(redirectAfterLogin(fakeUpdatedUser));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#6D5DF6]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#A855F7]/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#22D3EE]/10 blur-3xl pointer-events-none" />

      {/* Top Logo Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex items-center gap-3 z-10"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#6D5DF6] via-[#A855F7] to-[#22D3EE] flex items-center justify-center shadow-[0_0_25px_rgba(109,93,246,0.5)]">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-black tracking-tight text-[var(--text-strong)]">
          SkillKollab
        </span>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-center max-w-2xl mx-auto mb-12 z-10"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-[var(--text-strong)] drop-shadow-[0_2px_15px_rgba(255,255,255,0.1)]">
          How do you want to innovate?
        </h1>
        <p className="text-lg sm:text-xl text-[var(--text-secondary)] font-normal">
          Choose how you want to participate in the <span className="text-[#22D3EE] font-semibold">SkillKollab</span> ecosystem.
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-2 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#6D5DF6]" /> You can easily switch between roles anytime inside your workspace settings.
        </p>
      </motion.div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full z-10 mb-12">
        {/* CARD 1: Innovation Lead */}
        <motion.div
          whileHover={{ scale: 1.025, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCardClick('INNOVATION_LEAD')}
          className={`cursor-pointer rounded-3xl p-8 relative overflow-hidden transition-all duration-300 ${
            selectedRole === 'INNOVATION_LEAD'
              ? 'bg-[var(--bg-card)] border-2 border-[#6D5DF6] shadow-[0_0_45px_rgba(109,93,246,0.4)] ring-4 ring-[#6D5DF6]/20'
              : 'bg-[var(--bg-card)]/80 hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] shadow-2xl'
          }`}
        >
          {/* Card Accent Glow */}
          {selectedRole === 'INNOVATION_LEAD' && (
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-gradient-to-br from-[#6D5DF6] to-[#A855F7] rounded-full blur-2xl opacity-40 pointer-events-none" />
          )}
          
          <div className="flex items-start justify-between mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6D5DF6] to-[#7E45F7] flex items-center justify-center shadow-[0_10px_20px_rgba(109,93,246,0.4)] text-3xl">
              🚀
            </div>
            {selectedRole === 'INNOVATION_LEAD' ? (
              <span className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-[#6D5DF6]/20 border border-[#6D5DF6] text-[#8D7BFF] text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(109,93,246,0.3)]">
                <CheckCircle2 className="w-4 h-4 text-[#8D7BFF]" /> Selected
              </span>
            ) : (
              <span className="text-xs font-semibold py-1.5 px-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                Project Architect
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-strong)] mb-2">Innovation Lead</h2>
          <p className="text-[var(--text-secondary)] text-base mb-6 font-medium leading-relaxed">
            I have an idea and want to build a team.
          </p>

          <div className="space-y-3.5 mb-8 border-t border-[var(--border-subtle)] pt-6">
            {[
              'Publish problem statements',
              'Recruit talented students',
              'Manage projects',
              'Build real-world products',
              'Lead innovation'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-[var(--text-secondary)] font-medium">
                <div className="w-5 h-5 rounded-full bg-[#6D5DF6]/20 flex items-center justify-center text-[#8D7BFF] text-xs font-bold">
                  ✓
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <button 
            type="button"
            className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
              selectedRole === 'INNOVATION_LEAD'
                ? 'bg-gradient-to-r from-[#6D5DF6] to-[#A855F7] text-white shadow-[0_4px_25px_rgba(109,93,246,0.6)]'
                : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)]'
            }`}
          >
            <span>Start as Innovation Lead</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* CARD 2: Innovation Contributor */}
        <motion.div
          whileHover={{ scale: 1.025, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCardClick('INNOVATION_CONTRIBUTOR')}
          className={`cursor-pointer rounded-3xl p-8 relative overflow-hidden transition-all duration-300 ${
            selectedRole === 'INNOVATION_CONTRIBUTOR'
              ? 'bg-[var(--bg-card)] border-2 border-[#22D3EE] shadow-[0_0_45px_rgba(34,211,238,0.4)] ring-4 ring-[#22D3EE]/20'
              : 'bg-[var(--bg-card)]/80 hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] shadow-2xl'
          }`}
        >
          {/* Card Accent Glow */}
          {selectedRole === 'INNOVATION_CONTRIBUTOR' && (
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-gradient-to-br from-[#22D3EE] to-[#00C4A1] rounded-full blur-2xl opacity-40 pointer-events-none" />
          )}

          <div className="flex items-start justify-between mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#22D3EE] to-[#059669] flex items-center justify-center shadow-[0_10px_20px_rgba(34,211,238,0.4)] text-3xl">
              💡
            </div>
            {selectedRole === 'INNOVATION_CONTRIBUTOR' ? (
              <span className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-[#22D3EE]/20 border border-[#22D3EE] text-[#22D3EE] text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                <CheckCircle2 className="w-4 h-4 text-[#22D3EE]" /> Selected
              </span>
            ) : (
              <span className="text-xs font-semibold py-1.5 px-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                Skilled Builder
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-strong)] mb-2">Innovation Contributor</h2>
          <p className="text-[var(--text-secondary)] text-base mb-6 font-medium leading-relaxed">
            I want to join exciting projects and contribute my skills.
          </p>

          <div className="space-y-3.5 mb-8 border-t border-[var(--border-subtle)] pt-6">
            {[
              'Discover challenges',
              'Join teams',
              'Build portfolio',
              'Gain experience',
              'Improve skills'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-[var(--text-secondary)] font-medium">
                <div className="w-5 h-5 rounded-full bg-[#22D3EE]/20 flex items-center justify-center text-[#22D3EE] text-xs font-bold">
                  ✓
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <button 
            type="button"
            className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
              selectedRole === 'INNOVATION_CONTRIBUTOR'
                ? 'bg-gradient-to-r from-[#22D3EE] to-[#059669] text-white shadow-[0_4px_25px_rgba(34,211,238,0.6)]'
                : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)]'
            }`}
          >
            <span>Start as Contributor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Continue Button Appears Only After Selection */}
      <AnimatePresence>
        {selectedRole && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="z-20 flex flex-col items-center"
          >
            <button
              onClick={handleContinue}
              className="px-12 py-5 rounded-full font-extrabold text-lg text-white bg-gradient-to-r from-[#6D5DF6] via-[#A855F7] to-[#22D3EE] shadow-[0_0_45px_rgba(109,93,246,0.6)] hover:shadow-[0_0_65px_rgba(168,85,247,0.8)] hover:scale-105 transition-all flex items-center gap-3 border border-[var(--border-strong)]"
            >
              <span>Continue into SkillKollab</span>
              <ArrowRight className="w-6 h-6 animate-pulse" />
            </button>
            <span className="text-xs text-[var(--text-secondary)] mt-3 uppercase tracking-wider font-semibold">
              Pressing continue configures your customized SaaS interface
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
