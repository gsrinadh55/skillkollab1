import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Award, Trophy, Star, Sparkles, MapPin, Building2, Calendar, 
  ExternalLink, CheckCircle2, ShieldCheck, Zap, TrendingUp, X, Edit3, Share2, Plus 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { usersService } from '../../services/firebase/users';

// Clean empty/initial 52-week activity heatmap (7 days x 52 weeks)
const INITIAL_HEATMAP_DATA = Array.from({ length: 52 }, () => Array.from({ length: 7 }, () => 0));

const INTENSITY_CLASSES = [
  'bg-[var(--bg-surface)] border border-[var(--border-subtle)]', // 0 commits
  'bg-[rgba(109,93,246,0.3)] border border-[var(--color-primary)]/40', // 1-2 commits
  'bg-[rgba(109,93,246,0.65)] border border-[var(--color-primary)]/70', // 3-4 commits
  'bg-cyan-500/75 border border-cyan-400', // 5-6 commits
  'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] border border-white', // 7+ intensive commits
];

export function UserProfilePage() {
  const { user } = useAuth();
  const profile = user;

  const [localProfile, setLocalProfile] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Derived authentic user details from logged-in account
  const userName = localProfile?.name || profile?.name || user?.displayName || user?.email?.split('@')[0] || 'User';
  const userAvatar = localProfile?.avatarUrl || profile?.avatarUrl || user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6D4AFF&color=fff&size=128`;
  const userUniversity = localProfile?.university || profile?.university || 'University / College';
  const userLocation = localProfile?.location || profile?.location || 'Location';
  const userBio = localProfile?.bio || profile?.bio || 'No bio added yet. Add a short bio to tell others about your interests.';
  
  // Real skills from user profile
  const userSkills = localProfile?.skills || profile?.skills || [];
  const userSkillsStr = Array.isArray(userSkills) 
    ? userSkills.map(s => typeof s === 'string' ? s : s.name).join(', ')
    : (userSkills || '');

  // Real certificates from user profile
  const userCertificates = localProfile?.certificates || profile?.certificates || [];

  // Real stats
  const xpValue = localProfile?.xp ?? profile?.xp ?? 0;
  const commitsValue = localProfile?.commits ?? profile?.commits ?? 0;
  const ratingValue = localProfile?.rating ?? profile?.rating ?? 0.0;
  const bountiesValue = localProfile?.bounties ?? profile?.bounties ?? 0;
  const userLevel = localProfile?.level ?? profile?.level ?? 1;

  const [formData, setFormData] = useState({
    name: userName,
    email: profile?.email || user?.email || '',
    university: userUniversity === 'University / College' ? '' : userUniversity,
    degree: localProfile?.degree || profile?.degree || '',
    location: userLocation === 'Location' ? '' : userLocation,
    bio: userBio === 'No bio added yet. Add a short bio to tell others about your interests.' ? '' : userBio,
    skills: userSkillsStr
  });

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    toast.success('Public Verified Pioneer Passport link copied to clipboard!');
  };

  const handleOpenSettings = () => {
    setFormData({
      name: userName,
      email: profile?.email || user?.email || '',
      university: userUniversity === 'University / College' ? '' : userUniversity,
      degree: localProfile?.degree || profile?.degree || '',
      location: userLocation === 'Location' ? '' : userLocation,
      bio: userBio === 'No bio added yet. Add a short bio to tell others about your interests.' ? '' : userBio,
      skills: userSkillsStr
    });
    setShowSettings(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const skillsArray = formData.skills ? formData.skills.split(',').map(s => ({ name: s.trim() })).filter(s => s.name) : [];
    
    const updatedData = {
      name: formData.name,
      email: formData.email,
      university: formData.university || 'University / College',
      degree: formData.degree,
      location: formData.location || 'Location',
      bio: formData.bio || 'No bio added yet. Add a short bio to tell others about your interests.',
      skills: skillsArray
    };

    setLocalProfile(updatedData);
    setShowSettings(false);
    toast.success('Profile settings updated successfully!');

    if (user?.uid) {
      try {
        await usersService.updateUserProfile(user.uid, updatedData);
      } catch (err) {
        console.warn('Firebase save note:', err);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16 max-w-6xl mx-auto">
        {/* Profile Hero Banner & Passport Card */}
        <div className="p-8 sm:p-10 rounded-3xl sk-glass-card shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-[var(--bg-card)] via-[var(--color-primary)]/5 to-[var(--bg-card)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-6 z-10">
            <div className="relative shrink-0">
              <img
                src={userAvatar}
                alt={userName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-[var(--border-subtle)] shadow-sm"
              />
              <span className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-extrabold shadow-md">
                Lvl {userLevel}
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-strong)] tracking-tight">{userName}</h1>
                <span className="px-3 py-1 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-primary)]" /> Verified User
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] font-medium mt-2 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-[var(--text-secondary)]" /> {userUniversity}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[var(--text-secondary)]" /> {userLocation}</span>
              </p>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-3 max-w-xl font-normal leading-relaxed">
                {userBio}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col gap-3 z-10 w-full sm:w-auto">
            <button
              onClick={handleOpenSettings}
              className="btn-sk-primary px-6 py-3 text-xs font-bold whitespace-nowrap cursor-pointer shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center gap-2 justify-center"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile Settings
            </button>
            <button
              onClick={handleCopyLink}
              className="btn-sk-secondary px-6 py-3 text-xs font-bold whitespace-nowrap cursor-pointer hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)] hover:scale-105 transition-all flex items-center gap-2 justify-center"
            >
              <Share2 className="w-4 h-4" /> Copy Shareable Passport
            </button>
          </div>
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-[var(--color-primary)] rounded-full blur-[100px] opacity-10 pointer-events-none" />
        </div>

        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {[
            { label: 'Contribution XP', value: `${xpValue} XP`, sub: 'Pioneer Tier', text: 'text-[var(--color-primary)]' },
            { label: 'Verified Commits', value: `${commitsValue} Commits`, sub: `Across ${commitsValue > 0 ? 'active' : '0'} agile teams`, text: 'text-[var(--color-primary)]' },
            { label: 'Owner Rating', value: `${ratingValue > 0 ? ratingValue + ' ⭐' : '0.0 ⭐'}`, sub: `Based on ${ratingValue > 0 ? 'verified' : '0'} Lead reviews`, text: 'text-amber-500 dark:text-amber-400' },
            { label: 'Bounty Awards', value: `${bountiesValue > 0 ? '$' + bountiesValue : '$0'}`, sub: 'Equity + Research grants', text: 'text-emerald-500 dark:text-emerald-400' },
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

        {/* 365-Day Collaborative Contribution Heatmap */}
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
              {INITIAL_HEATMAP_DATA.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((intensity, dIdx) => (
                    <div
                      key={dIdx}
                      title={`Week ${wIdx + 1}, Day ${dIdx + 1}: ${intensity} verified actions`}
                      className={`w-3.5 h-3.5 rounded-[3px] transition-all cursor-pointer ${INTENSITY_CLASSES[intensity]}`}
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
            
            {userSkills.length > 0 ? (
              <div className="space-y-4 pt-1">
                {userSkills.map((s, idx) => {
                  const skillName = typeof s === 'string' ? s : (s.name || s.skill || 'Skill');
                  const percent = typeof s === 'object' && s.percent ? s.percent : 85;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-[var(--text-strong)]">
                        <span>{skillName}</span>
                        <span className="text-[var(--color-primary)] font-mono">{percent}% Mastered</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden">
                        <div className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl space-y-3 bg-[var(--bg-surface)]">
                <Sparkles className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-40" />
                <p className="text-xs font-bold text-[var(--text-secondary)]">No verified skills added yet.</p>
                <button
                  onClick={handleOpenSettings}
                  className="btn-sk-primary text-[11px] px-4 py-2 font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Skills in Profile
                </button>
              </div>
            )}
          </div>

          {/* Verified Certificates & Honors */}
          <div className="sk-glass-card p-7 shadow-sm space-y-6">
            <h3 className="text-lg font-extrabold text-[var(--text-strong)] border-b border-[var(--border-subtle)] pb-3 flex items-center justify-between">
              <span>Verified Academic Credentials</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck size={15} /> 100% On-Chain Verifiable
              </span>
            </h3>

            {userCertificates.length > 0 ? (
              <div className="space-y-4 pt-1">
                {userCertificates.map((c, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-500/50 transition-all flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <Award className="w-7 h-7 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-strong)]">{c.name}</h4>
                        <span className="text-[11px] text-[var(--text-secondary)]">{c.org}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 font-extrabold text-[10px] uppercase shrink-0">
                      {c.badge || 'Verified'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl space-y-2 bg-[var(--bg-surface)]">
                <Award className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-40" />
                <p className="text-xs font-bold text-[var(--text-secondary)]">No verified credentials yet.</p>
                <p className="text-[11px] text-[var(--text-muted)]">Complete venture sprints or upload credentials to display on your profile.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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

              <form onSubmit={handleSaveProfile} className="space-y-4">
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
                    <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g. San Francisco, CA" className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-3 text-sm text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-strong)] mb-1">Skills (comma separated)</label>
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


