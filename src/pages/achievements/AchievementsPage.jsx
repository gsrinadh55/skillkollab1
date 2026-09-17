import React from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, ShieldCheck, Sparkles, Star, Lock, Zap, Flame, Cpu, Code2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../../layouts/DashboardLayout';

const ACHIEVEMENTS_DATA = [
  { title: 'Grand Innovator Catalyst', desc: 'Published 3 active problem statements attracting 25+ top university applicants.', icon: '🚀', xp: 500, earned: true, date: 'Jul 15, 2026' },
  { title: 'Zero-Day Vulnerability Hunter', desc: 'Resolved 10 automated AST security flags during live collaborative sprint review.', icon: '🛡️', xp: 450, earned: true, date: 'Jul 22, 2026' },
  { title: 'Vercel-Tier UI Artisan', desc: 'Received 5.0 Star Owner rating for glassmorphic design and micro-animations.', icon: '✨', xp: 400, earned: true, date: 'Jul 28, 2026' },
  { title: '100 Collaborative PRs Merged', desc: 'Successfully submitted 100 verified Git patches into shared team repositories.', icon: '⚡', xp: 750, earned: true, date: 'Yesterday' },
  { title: 'AI Orchestration Master', desc: 'Achieved 98% AI Match Score across 5 consecutive challenge applications.', icon: '🤖', xp: 600, earned: true, date: 'Today' },
  { title: 'Y-Combinator Demo Day Finalist', desc: 'Present real-time team prototype to global startup investor judges.', icon: '👑', xp: 1000, earned: false, progress: '3 / 4 Sprints Complete' },
];

export function AchievementsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16 max-w-5xl mx-auto">
        <div className="border-b border-[var(--border-subtle)] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="py-1 px-3 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Pioneer Gamification Honors
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-strong)] tracking-tight">
              Verified Achievement Badges & Trophies
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Earn immutable on-chain credential trophies by demonstrating technical leadership, teamwork, and innovation speed.
            </p>
          </div>

          <div className="p-4 rounded-[18px] bg-[var(--bg-card)] border border-[var(--color-primary)]/20 shadow-sm flex items-center gap-4">
            <Trophy className="w-8 h-8 text-amber-500 dark:text-amber-400 flex-shrink-0 animate-pulse" />
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-bold uppercase">Total Honor XP</p>
              <p className="text-xl font-black text-[var(--text-strong)] font-mono">3,200 / 4,200 XP</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACHIEVEMENTS_DATA.map((ach, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              onClick={() => ach.earned && toast.success(`Viewing credentials for: ${ach.title}`)}
              className={`p-6 sk-glass-card flex flex-col justify-between relative overflow-hidden transition-all shadow-sm hover:shadow-[var(--color-primary)]/5 ${
                ach.earned ? 'border-[var(--border-subtle)] hover:border-[var(--color-primary)]/40 hover:shadow-md cursor-pointer' : 'border-[var(--border-subtle)] bg-[var(--bg-card)]/50'
              }`}
            >
              {ach.earned && (
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[var(--color-primary)]/10 to-transparent pointer-events-none blur-[24px]" />
              )}
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-strong)] flex items-center justify-center text-3xl shadow-sm">
                    {ach.icon}
                  </div>
                  {ach.earned ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      ✓ Earned
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-300 dark:bg-white/5 dark:text-slate-400 dark:border-white/10 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                <h3 className={`text-base font-extrabold mb-2 leading-snug ${ach.earned ? 'text-[var(--text-strong)]' : 'text-[var(--text-secondary)]'}`}>{ach.title}</h3>
                <p className={`text-xs leading-relaxed font-medium mb-6 ${ach.earned ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`}>{ach.desc}</p>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs relative z-10">
                <span className="font-extrabold text-[var(--color-accent)] font-mono">+{ach.xp} XP Bonus</span>
                <span className="text-[var(--text-secondary)] font-semibold text-[11px]">{ach.earned ? `Unlocked ${ach.date}` : ach.progress}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
