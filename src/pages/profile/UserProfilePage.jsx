import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Award, Trophy, Star, Sparkles, MapPin, Building2, Calendar, 
  ExternalLink, CheckCircle2, ShieldCheck, Zap, TrendingUp, X 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { usersService } from '../../services/firebase/users';

// Initialize empty heatmap
const HEATMAP_DATA = Array.from({ length: 52 }, () => Array.from({ length: 7 }, () => 0));

const INTENSITY_CLASSES = [
  'bg-[var(--bg-surface)] border border-[var(--border-subtle)]', // 0 commits
  'bg-[rgba(109,93,246,0.3)] border border-[var(--color-primary)]/40', // 1-2 commits
  'bg-[rgba(109,93,246,0.65)] border border-[var(--color-primary)]/70', // 3-4 commits
  'bg-cyan-500/75 border border-cyan-400', // 5-6 commits
  'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] border border-white', // 7+ intensive commits
];

export function UserProfilePage() {
  const { user, loading } = useAuth();
  const profile = user; // user object already contains merged profile data due to AuthContext onSnapshot


  const [showSettings, setShowSettings] = useState(false);
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    university: profile?.university || '',
    degree: profile?.degree || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    skills: profile?.skills?.map(s => s.name).join(', ') || ''
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Public Verified Pioneer Profile link copied to clipboard!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16 max-w-6xl mx-auto">
        {/* Profile Hero Banner & Passport Card */}
        <div className="p-8 sm:p-10 rounded-3xl sk-glass-card shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-[var(--bg-card)] via-[var(--color-primary)]/5 to-[var(--bg-card)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-6 z-10">
            <div className="relative shrink-0">
              <img
                src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                alt={profile?.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-[var(--border-subtle)] shadow-sm"
              />
              <span className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-extrabold shadow-md">
                Lvl {profile?.level || 22}
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-strong)] tracking-tight">{profile?.name || 'User'}</h1>
                <span className="px-3 py-1 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-primary)]" /> Verified User
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] font-medium mt-2 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-[var(--text-secondary)]" /> {profile?.university || "University / College"}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[var(--text-secondary)]" /> {profile?.location || "Location"}</span>
              </p>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-3 max-w-xl font-normal leading-relaxed">
                {profile?.bio || "No bio added yet. Add a short bio to tell others about your interests."}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col gap-3 z-10 w-full sm:w-auto">
            <button
              onClick={() => {
                setFormData({
                  name: profile?.name || '',
                  email: profile?.email || '',
                  university: profile?.university || '',
                  degree: profile?.degree || '',
                  location: profile?.location || '',
                  bio: profile?.bio || '',
                  skills: profile?.skills?.map(s => s.name).join(', ') || ''
                });
                setShowSettings(true);
              }}
              className="btn-sk-primary px-6 py-3 text-xs font-bold whitespace-nowrap cursor-pointer shadow-sm hover:shadow-md hover:scale-105 transition-all"
            >
              Edit Profile Settings
            </button>
            <button
              onClick={handleCopyLink}
              className="btn-sk-secondary px-6 py-3 text-xs font-bold whitespace-nowrap cursor-pointer hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)] hover:scale-105 transition-all"
            >
              Copy Shareable Passport
            </button>
          </div>
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-[var(--color-primary)] rounded-full blur-[100px] opacity-10 pointer-events-none" />
        </div>

        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {[
            { label: 'Contribution XP', value: `${profile?.xp || 0} XP`, sub: 'Pioneer Tier', text: 'text-[var(--color-primary)]' },
            { label: 'Verified Commits', value: '0 Commits', sub: 'Across 0 agile teams', text: 'text-[var(--color-primary)]' },
            { label: 'Owner Rating', value: '0.0 ⭐', sub: 'Based on 0 Lead reviews', text: 'text-amber-500 dark:text-amber-400' },
            { label: 'Bounty Awards', value: '$0', sub: 'Equity + Research grants', text: 'text-emerald-500 dark:text-emerald-400' },
          ].map((m, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -2 }}
              className="p-5 sm:p-6 sk-glass-card shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <span className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">{m.label}</span>
              <p className={`text-2xl sm:text-3xl font-extrabold mt-3 mb-1 font-mono ${m.text}`}>{m.value}</p>
              <span className="text-[11px] text-[var(--text-secondary)] font-medium">{m.sub}</span>
            </motion.div>
          ))}
        </div>

        {/* 365-Day GitHub-Style Contribution Heatmap */}
        <div className="sk-glass-card p-7 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-strong)] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--color-primary)]" /> 365-Day Collaborative Contribution Heatmap
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Authentic log of code commits, Kanban PR reviews, and sprint iterations over the past year.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-bold">
              <span>Less</span>
              <div className="flex gap-1">
                {INTENSITY_CLASSES.map((col, idx) => (
                  <div key={idx} className={`w-3.5 h-3.5 rounded-sm ${col}`} />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>

          <div className="overflow-x-auto pb-3 custom-scrollbar">
            <div className="inline-flex gap-1 min-w-full justify-between">
              {HEATMAP_DATA.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((intensity, dIdx) => (
                    <div
                      key={dIdx}
                      title={`Week ${wIdx + 1}, Day ${dIdx + 1}: ${intensity * 2 + 1} verified collaborative actions logged`}
                      className={`w-3.5 h-3.5 rounded-[3px] transition-all hover:scale-125 cursor-pointer ${INTENSITY_CLASSES[intensity]}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills Mastery Meters & Verified University Certificates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skill Mastery */}
          <div className="sk-glass-card p-7 shadow-sm space-y-6">
            <h3 className="text-lg font-extrabold text-[var(--text-strong)] border-b border-[var(--border-subtle)] pb-3 flex items-center justify-between">
              <span>Verified Skill Competency Rankings</span>
              <span className="px-2 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[10px] font-bold">AI Evaluated</span>
            </h3>
            <div className="space-y-4 pt-1">
              {[
                { skill: 'Add Skills', percent: 0 }
              ].map((s, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-[var(--text-strong)]">
                    <span>{s.skill}</span>
                    <span className="text-[var(--color-primary)] font-mono">{s.percent}% Mastered</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden">
                    <div className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-1000" style={{ width: `${s.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Certificates & Honors */}
          <div className="sk-glass-card p-7 shadow-sm space-y-6">
            <h3 className="text-lg font-extrabold text-[var(--text-strong)] border-b border-[var(--border-subtle)] pb-3 flex items-center justify-between">
              <span>Verified Academic Credentials</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck size={15} /> 100% On-Chain Verifiable
              </span>
            </h3>
            <div className="space-y-4 pt-1">
              { profile?.certificates && profile.certificates.length > 0 ? profile.certificates.map((c, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-500/50 transition-all flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <Award className="w-7 h-7 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-strong)]">{c.name}</h4>
                      <span className="text-[11px] text-[var(--text-secondary)]">{c.org}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 font-extrabold text-[10px] uppercase shrink-0">
                    {c.badge}
                  </span>
                </div>
              )) : (
                <div className="p-4 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                  No verified credentials yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="bg-[var(--bg-card)] p-6 sm:p-8 rounded-3xl border border-[var(--border-strong)] max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-6 right-6 text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-extrabold text-[var(--text-strong)] mb-6 flex items-center gap-2">
                <User className="text-[var(--color-primary)]" size={24} /> Edit Profile Settings
              </h3>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    // Convert comma separated string to array of skill objects if necessary, or just strings
                    const skillsArray = formData.skills.split(',').map(s => ({ name: s.trim() })).filter(s => s.name);
                    
                    await usersService.updateUserProfile(user.uid, {
                      name: formData.name,
                      email: formData.email,
                      university: formData.university,
                      degree: formData.degree,
                      location: formData.location,
                      bio: formData.bio,
                      skills: skillsArray
                    });
                    toast.success('Profile updated successfully!');
                    setShowSettings(false);
                  } catch (error) {
                    toast.error('Failed to update profile');
                  }
                }} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-[var(--text-strong)] mb-1">Full Name <span className="text-rose-500">*</span></label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Enter your full name" className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-3 text-sm text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-strong)] mb-1">Email <span className="text-rose-500">*</span></label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="e.g. alex@stanford.edu" className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-3 text-sm text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-strong)] mb-1">College / University</label>
                    <input type="text" value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} placeholder="e.g. Stanford University" className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-3 text-sm text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-strong)] mb-1">Course / Degree</label>
                    <input type="text" value={formData.degree} onChange={(e) => setFormData({...formData, degree: e.target.value})} placeholder="e.g. B.Tech Computer Science" className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-3 text-sm text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-strong)] mb-1">Location</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g. Hyderabad, India" className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-3 text-sm text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-strong)] mb-1">Skills</label>
                    <input type="text" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} placeholder="e.g. React, Python, AI, UI/UX" className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-3 text-sm text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-strong)] mb-1">Bio / About</label>
                  <textarea rows={3} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} placeholder="Tell others briefly about your interests and what you build" className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-3 text-sm text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)] mt-2">
                  <button type="button" onClick={() => setShowSettings(false)} className="btn-sk-secondary px-5 py-2.5 text-xs font-bold cursor-pointer">Cancel</button>
                  <button type="submit" className="btn-sk-primary px-8 py-2.5 text-xs font-bold cursor-pointer">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

export default UserProfilePage;
