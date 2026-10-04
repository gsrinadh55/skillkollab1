import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, ShieldCheck, Sparkles, Code2, Users, Layers, ExternalLink } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import toast from 'react-hot-toast';

const INITIAL_LOGS = [
  { id: 1, type: 'sprint', title: 'Sprint Milestone Verified by AI Doctor', body: 'Dr. Elena Rostova completed code review for NexusAI Node Parser. All Zod runtime validations passed.', time: '12 minutes ago', read: false, link: '/projects/proj-101/workspace' },
  { id: 2, type: 'ai', title: 'AI Matchmaker Recommendation Found', body: 'Your TypeScript & OpenAI profile matched 96% with a newly initialized cohort: Decentralized GPU Cluster.', time: '2 hours ago', read: false, link: '/discover' },
  { id: 3, type: 'team', title: 'New Team Join Request', body: 'Sarah Jenkins applied to join NexusAI as UI/UX Designer & Prototyper.', time: '5 hours ago', read: true, link: '/projects/proj-101' },
  { id: 4, type: 'sprint', title: 'Weekly Hours Tracked Successfully', body: 'You contributed 14.5 hours this week, beating your 10h consistency goal! You unlocked the Consistency Titan badge.', time: '1 day ago', read: true, link: '/profile' },
  { id: 5, type: 'ai', title: 'AI Roadmap Refinement Notice', body: 'AI Mentor generated 3 proactive unit testing milestones for your Auth middleware module.', time: '2 days ago', read: true, link: '/mentor' },
];

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_LOGS);
  const [filter, setFilter] = useState('all');

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All telemetry marked as read');
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification dismissed');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('Telemetry logs cleared');
  };

  const filteredList = notifications.filter(n => filter === 'all' || n.type === filter);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-7 pb-16 animate-fadeIn">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <Bell size={24} className="text-[var(--color-primary)]" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-strong)] tracking-tight">
                Live Telemetry & Activity Hub
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Real-time audit events streaming across your AI sprints, code reviews, and teammate applications.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <button 
              onClick={markAllAsRead} 
              disabled={!notifications.some(n => !n.read)} 
              className="btn-sk-secondary px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <CheckCheck size={16} className="text-emerald-400" /> Mark All as Read
            </button>
            <button 
              onClick={clearAll} 
              disabled={notifications.length === 0} 
              className="btn-sk-secondary px-4 py-2.5 text-xs font-bold text-rose-400 border-rose-500/30 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer hover:bg-rose-500/10"
            >
              <Trash2 size={16} /> Clear Log
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2.5 bg-[var(--bg-surface)] p-2.5 rounded-2xl border border-[var(--border-strong)] shadow-sm">
          {[
            { id: 'all', label: 'All Telemetry' },
            { id: 'sprint', label: '⚡ Sprint & Milestones' },
            { id: 'ai', label: '🤖 AI Co-Pilot & Matcher' },
            { id: 'team', label: '👥 Team Collaboration' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filter === t.id 
                  ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-md scale-102' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-strong)] hover:bg-[var(--bg-card)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Activity List */}
        <div className="space-y-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className={`sk-glass-card p-6 rounded-2xl transition-all border shadow-sm flex items-start gap-4 sm:gap-5 relative group ${
                item.read ? 'bg-[var(--bg-card)] border-[var(--border-subtle)]' : 'bg-[rgba(109,93,246,0.06)] border-[var(--color-primary)]/40'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-strong)] flex items-center justify-center shrink-0 text-2xl shadow-sm">
                {item.type === 'ai' ? '✨' : item.type === 'sprint' ? '🚀' : '👥'}
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <strong className={`text-base font-extrabold ${item.read ? 'text-[var(--text-strong)]' : 'text-[var(--text-accent)]'}`}>
                    {item.title}
                  </strong>
                  <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">{item.time}</span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                  {item.body}
                </p>
                
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                  <Link 
                    to={item.link} 
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[var(--color-secondary)] hover:underline"
                  >
                    <span>Inspect in Workspace</span>
                    <ExternalLink size={14} />
                  </Link>

                  <button
                    onClick={() => deleteNotification(item.id)}
                    className="text-xs font-bold text-[var(--text-muted)] hover:text-rose-400 transition-colors cursor-pointer"
                    title="Dismiss notification"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              {!item.read && (
                <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)] animate-pulse" />
              )}
            </div>
          ))}

          {filteredList.length === 0 && (
            <div className="text-center py-16 px-6 bg-[var(--bg-card)] rounded-3xl border border-dashed border-[var(--border-strong)] text-[var(--text-muted)] space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[var(--bg-surface)] flex items-center justify-center mx-auto text-[var(--color-primary)] shadow-sm">
                <ShieldCheck size={36} />
              </div>
              <h3 className="text-lg font-extrabold text-[var(--text-strong)]">Zero Active Alerts</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">All collaborative telemetry, AI code review summaries, and sprint milestones are completely up-to-date!</p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
export default NotificationsPage;
