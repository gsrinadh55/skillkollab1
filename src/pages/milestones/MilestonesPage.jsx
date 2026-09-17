import React from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, CheckCircle2, Clock, Sparkles, Zap, Rocket, ShieldCheck, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../../layouts/DashboardLayout';

const MILESTONES_DATA = [
  { id: 1, sprint: 'Sprint 1: Architecture & Zod Schema Foundation', dueDate: 'Jul 20, 2026', status: 'Completed', progress: 100, color: 'emerald', deliverable: 'Fully typed AST security Zod validators and WebSocket socket harness.' },
  { id: 2, sprint: 'Sprint 2: Glassmorphic UI & Role Switcher', dueDate: 'Aug 05, 2026', status: 'Active', progress: 85, color: 'purple', deliverable: 'Vercel-tier dark theme canvas with real-time Kanban drop indicators.' },
  { id: 3, sprint: 'Sprint 3: Autonomous LangChain Remediation', dueDate: 'Aug 20, 2026', status: 'Upcoming', progress: 20, color: 'cyan', deliverable: 'Zero-shot vulnerability detection prompt suites & automated fix generation.' },
  { id: 4, sprint: 'Sprint 4: Y-Combinator Investor Pitch Demo', dueDate: 'Sep 01, 2026', status: 'Locked', progress: 0, color: 'amber', deliverable: 'Live executive production presentation deck and simulated venture audit.' },
];

export function MilestonesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16 max-w-5xl mx-auto">
        {/* Header */}
        <div className="border-b border-[var(--border-subtle)] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="py-1 px-3 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5" /> Project Timeline & Deliverable Tracker
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-strong)] tracking-tight">
              Venture Sprints & Milestone Roadmap
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Real-time synchronization of project deliverable deadlines, pull request targets, and evaluation milestones.
            </p>
          </div>
          <button
            onClick={() => toast.success('Exported project milestone Gantt chart (PDF)')}
            className="btn-sk-secondary text-xs px-5 py-2.5 font-extrabold self-start sm:self-auto hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/10"
          >
            Export Gantt Roadmap
          </button>
        </div>

        {/* Timeline List */}
        <div className="relative border-l-2 border-[var(--color-primary)]/30 ml-4 sm:ml-8 space-y-10 pl-6 sm:pl-10">
          {MILESTONES_DATA.map((ms, index) => {
            const isCompleted = ms.status === 'Completed';
            const isActive = ms.status === 'Active';
            
            return (
              <motion.div
                key={ms.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative group"
              >
                {/* Timeline Dot */}
                <div className={`absolute -left-[35px] sm:-left-[51px] top-1 w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-sm z-10 transition-colors ${
                  isCompleted ? 'bg-emerald-50 border-emerald-400 text-emerald-600 dark:bg-emerald-500 dark:border-emerald-300 dark:text-emerald-950' :
                  isActive ? 'bg-[var(--color-primary)] border-[var(--bg-card)] text-white shadow-[0_0_15px_var(--color-primary)] animate-pulse' :
                  'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-muted)]'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4 font-black" /> : <Clock className="w-3.5 h-3.5" />}
                </div>

                {/* Content Card */}
                <div className="sk-glass-card p-6 sm:p-8 flex flex-col relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider border inline-block w-fit ${
                      isCompleted ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                      isActive ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20' :
                      'bg-[var(--bg-surface)] text-[var(--text-strong)] border-[var(--border-strong)]'
                    }`}>
                      Status: {ms.status} • Due {ms.dueDate}
                    </span>
                    <span className="text-xs font-mono font-bold text-[var(--text-strong)] opacity-90">{ms.progress}% Complete</span>
                  </div>

                  <h3 className="text-xl font-black text-[var(--text-strong)] group-hover:text-[var(--color-primary)] transition-colors mb-2">
                    {ms.sprint}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6 font-medium leading-relaxed">
                    <strong className="text-[var(--text-strong)]">Target Deliverable:</strong> {ms.deliverable}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-[var(--bg-surface)] overflow-hidden mb-4 p-0.5 border border-[var(--border-strong)] shadow-inner">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ${
                        isCompleted ? 'from-emerald-400 to-teal-400' :
                        isActive ? 'from-[var(--color-primary)] to-[var(--color-accent)]' :
                        'bg-[var(--text-muted)] opacity-50'
                      }`}
                      style={{ width: `${ms.progress}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                    <span>👥 Assigned Team: <strong className="text-[var(--text-strong)]">Team Name (4 Innovators)</strong></span>
                    {isActive && (
                      <button onClick={() => toast.success('Logged completion check for Sprint 2')} className="btn-sk-primary px-4 py-2 text-xs font-bold shadow-sm hover:shadow-md">
                        Mark Deliverable Checked
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
