import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Sparkles, TrendingUp, Flame, ShieldCheck, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../../layouts/DashboardLayout';

const LEADERBOARD_USERS = [];

export function LeaderboardPage() {
  const [filter, setFilter] = useState('Global'); // 'Global' | 'University' | 'Weekly'

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

          <div className="flex items-center bg-[var(--bg-surface)] p-1.5 rounded-2xl border border-[var(--border-strong)]">
            {['Global', 'Stanford Only', 'This Sprint'].map((tab, idx) => (
              <button
                key={idx}
                onClick={() => { setFilter(tab); toast.success(`Viewing leaderboard: ${tab}`); }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  filter === tab || (filter === 'University' && tab === 'Stanford Only')
                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                    : 'text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Winners Podium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {LEADERBOARD_USERS.slice(0, 3).map((user, idx) => {
            const isFirst = idx === 0;
            
            return (
              <motion.div
                key={user.rank}
                whileHover={{ y: -6 }}
                className={`p-6 sk-glass-card flex flex-col items-center text-center relative transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/40 ${isFirst ? 'md:-translate-y-4' : ''}`}
              >
                <span className="text-4xl mb-3">{isFirst ? '👑' : idx === 1 ? '🥈' : '🥉'}</span>
                <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover border-4 border-[var(--bg-main)] shadow-md mb-3" />
                <h3 className="text-lg font-black text-[var(--text-strong)]">{user.name}</h3>
                <p className="text-xs text-[var(--color-accent)] font-bold mb-1">{user.university}</p>
                <span className="px-3 py-1 rounded-full bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] text-[11px] font-mono font-bold mb-4">{user.streak}</span>
                <div className="w-full pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-secondary)]">Total XP</span>
                  <span className="text-base font-black text-amber-500 dark:text-amber-400 font-mono">{user.xp} XP</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Full Leaderboard Table */}
        <div className="sk-glass-card overflow-hidden">
          <div className="p-4 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-sm font-black text-[var(--text-strong)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-primary)]" /> Verified Innovator Standing Directory
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">Updated every 5 mins</span>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {LEADERBOARD_USERS.map((item) => (
              <div key={item.rank} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[var(--color-primary)]/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <span className="w-8 text-center text-base font-black text-[var(--text-secondary)] font-mono">#{item.rank}</span>
                  <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-2xl object-cover border border-[var(--border-subtle)]" />
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-[var(--text-strong)] flex items-center gap-2">
                      <span>{item.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-amber-600 dark:text-amber-400 font-bold">{item.badge}</span>
                    </h4>
                    <span className="text-xs text-[var(--text-secondary)] font-medium">{item.university}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs text-[var(--text-secondary)] block">Current Streak</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{item.streak}</span>
                  </div>
                  <div className="text-right min-w-[90px]">
                    <span className="text-base font-black text-[var(--color-accent)] font-mono block">{item.xp}</span>
                    <span className="text-[10px] text-[var(--text-secondary)] font-extrabold uppercase">Level {item.level}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
