import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Sparkles, TrendingUp, Flame, ShieldCheck, Search, Zap, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../../layouts/DashboardLayout';

const INITIAL_LEADERBOARD_USERS = [
  {
    rank: 1,
    name: 'GUDIPATI SRINADH',
    university: 'Stanford University',
    xp: '3,840',
    rawXp: 3840,
    level: 12,
    streak: '🔥 18 Days',
    badge: 'AI Architect',
    avatar: 'https://ui-avatars.com/api/?name=Gudipati+Srinadh&background=6D4AFF&color=fff&size=128',
    category: 'Stanford Only'
  },
  {
    rank: 2,
    name: 'Elena Rostova',
    university: 'MIT (Massachusetts Institute of Technology)',
    xp: '3,420',
    rawXp: 3420,
    level: 10,
    streak: '🔥 14 Days',
    badge: 'Zod Expert',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    category: 'Global'
  },
  {
    rank: 3,
    name: 'Marcus Chen',
    university: 'Stanford University',
    xp: '3,150',
    rawXp: 3150,
    level: 9,
    streak: '🔥 12 Days',
    badge: 'Fullstack Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    category: 'Stanford Only'
  },
  {
    rank: 4,
    name: 'Sophia Al-Mansoor',
    university: 'UC Berkeley',
    xp: '2,890',
    rawXp: 2890,
    level: 8,
    streak: '🔥 9 Days',
    badge: 'LangChain Master',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    category: 'This Sprint'
  },
  {
    rank: 5,
    name: 'Alex Rivera',
    university: 'Carnegie Mellon University',
    xp: '2,650',
    rawXp: 2650,
    level: 7,
    streak: '🔥 7 Days',
    badge: 'Rust Developer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    category: 'Global'
  },
  {
    rank: 6,
    name: 'Priya Sharma',
    university: 'IIT Bombay',
    xp: '2,410',
    rawXp: 2410,
    level: 6,
    streak: '🔥 11 Days',
    badge: 'PyTorch Contributor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    category: 'This Sprint'
  },
  {
    rank: 7,
    name: 'David Kim',
    university: 'Stanford University',
    xp: '2,200',
    rawXp: 2200,
    level: 6,
    streak: '🔥 5 Days',
    badge: 'UI/UX Pioneer',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    category: 'Stanford Only'
  },
  {
    rank: 8,
    name: 'Liam O\'Connor',
    university: 'Harvard University',
    xp: '1,980',
    rawXp: 1980,
    level: 5,
    streak: '🔥 4 Days',
    badge: 'Smart Contracts',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    category: 'This Sprint'
  },
];

export function LeaderboardPage() {
  const { profile, user } = useSelector((state) => state.auth);
  const [filter, setFilter] = useState('Global'); // 'Global' | 'Stanford Only' | 'This Sprint'
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Merge profile if available
  const myName = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'GUDIPATI SRINADH';
  const myAvatar = profile?.avatarUrl || user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(myName)}&background=6D4AFF&color=fff&size=128`;

  // Build current user enhanced leaderboard list
  const usersList = INITIAL_LEADERBOARD_USERS.map(u => {
    if (u.name.toLowerCase() === myName.toLowerCase() || u.rank === 1) {
      return {
        ...u,
        name: myName,
        avatar: myAvatar,
        xp: profile?.xp ? `${profile.xp.toLocaleString()}` : u.xp,
        level: profile?.level || u.level
      };
    }
    return u;
  });

  // Filter users based on tab selection & search text
  const filteredUsers = usersList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.university.toLowerCase().includes(search.toLowerCase()) ||
                          item.badge.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'Stanford Only') return item.university.includes('Stanford');
    if (filter === 'This Sprint') return item.category === 'This Sprint' || item.rank <= 4;
    return true; // Global
  }).map((u, i) => ({ ...u, displayRank: i + 1 }));

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Leaderboard XP standings updated live!');
    }, 600);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16 max-w-5xl mx-auto">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="py-1 px-3 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Live Pioneer Rankings & XP Standings
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-strong)] tracking-tight">
              Global University Innovation Leaderboard
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Top verified student contributors ranked by collaborative problem solving, sprint code commits, and AI peer reviews.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-all cursor-pointer"
              title="Refresh Standings"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[var(--color-primary)]' : ''}`} />
            </button>

            <div className="flex items-center bg-[var(--bg-surface)] p-1.5 rounded-2xl border border-[var(--border-strong)]">
              {['Global', 'Stanford Only', 'This Sprint'].map((tab, idx) => (
                <button
                  key={idx}
                  onClick={() => { setFilter(tab); toast.success(`Viewing leaderboard: ${tab}`); }}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    filter === tab
                      ? 'bg-[var(--color-primary)] text-white shadow-md'
                      : 'text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search innovators by name, university, or badge..."
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-2xl pl-10 pr-4 py-3 text-sm text-[var(--text-strong)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all shadow-inner"
          />
        </div>

        {/* Top 3 Winners Podium Cards */}
        {filteredUsers.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {[filteredUsers[1], filteredUsers[0], filteredUsers[2]].map((user, idx) => {
              if (!user) return null;
              const isFirst = user.displayRank === 1;
              const crownEmoji = user.displayRank === 1 ? '👑' : user.displayRank === 2 ? '🥈' : '🥉';
              
              return (
                <motion.div
                  key={user.rank}
                  whileHover={{ y: -6 }}
                  className={`p-6 sk-glass-card flex flex-col items-center text-center relative transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/40 ${isFirst ? 'md:-translate-y-4 border-[var(--color-primary)]/30' : ''}`}
                >
                  <span className="text-4xl mb-3">{crownEmoji}</span>
                  <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover border-4 border-[var(--bg-main)] shadow-md mb-3" />
                  <h3 className="text-lg font-black text-[var(--text-strong)] truncate max-w-full">{user.name}</h3>
                  <p className="text-xs text-[var(--color-accent)] font-bold mb-1 truncate max-w-full">{user.university}</p>
                  <span className="px-3 py-1 rounded-full bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] text-[11px] font-mono font-bold mb-4">{user.streak}</span>
                  <div className="w-full pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-secondary)]">Total XP</span>
                    <span className="text-base font-black text-amber-500 dark:text-amber-400 font-mono">{user.xp} XP</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="sk-glass-card overflow-hidden">
          <div className="p-4 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-sm font-black text-[var(--text-strong)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-primary)]" /> Verified Innovator Standing Directory
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Showing {filteredUsers.length} pioneers • Updated live
            </span>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="divide-y divide-[var(--border-subtle)]">
              {filteredUsers.map((item) => (
                <div key={item.rank} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[var(--color-primary)]/5 transition-colors group">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="w-8 text-center text-base font-black text-[var(--text-secondary)] font-mono shrink-0">
                      #{item.displayRank}
                    </span>
                    <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-2xl object-cover border border-[var(--border-subtle)] shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-extrabold text-[var(--text-strong)] flex items-center gap-2 truncate">
                        <span className="truncate">{item.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-amber-600 dark:text-amber-400 font-bold shrink-0">
                          {item.badge}
                        </span>
                      </h4>
                      <span className="text-xs text-[var(--text-secondary)] font-medium truncate block">{item.university}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs text-[var(--text-secondary)] block">Current Streak</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{item.streak}</span>
                    </div>
                    <div className="text-right min-w-[90px]">
                      <span className="text-base font-black text-[var(--color-accent)] font-mono block">{item.xp} XP</span>
                      <span className="text-[10px] text-[var(--text-secondary)] font-extrabold uppercase">Level {item.level}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-[var(--text-muted)] space-y-2">
              <Trophy className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-sm font-bold text-[var(--text-strong)]">No innovators found matching "{search}"</p>
              <p className="text-xs text-[var(--text-secondary)]">Try adjusting your search criteria or switching filters.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

