import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useChallenges } from '../../../hooks/firebase/useChallenges';
import { useApplications } from '../../../hooks/firebase/useApplications';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
  BarChart, Bar, Legend
} from 'recharts';
import { 
  Rocket, Users, FileText, CheckCircle, TrendingUp, Cpu, Sparkles, 
  Calendar, ArrowRight, ShieldAlert, Zap, Award, ExternalLink, UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';

const ANALYTICS_DATA = [];

const RECENT_ACTIVITIES = [];

export function InnovationLeadDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Fetch real-time data using custom Firebase hooks
  const { challenges, loading: challengesLoading } = useChallenges(user?.uid);
  const { applications, loading: appsLoading } = useApplications({ challengeCreatorId: user?.uid });

  useEffect(() => {
    if (!challengesLoading && !appsLoading) {
      setLoading(false);
    }
  }, [challengesLoading, appsLoading]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const activeChallenges = challenges.filter(c => c.status === 'PUBLISHED' || c.status === 'ACTIVE');
    
    // Calculate total requested role spots across all active challenges
    let totalOpenRoles = 0;
    activeChallenges.forEach(c => {
      if (c.roles && Array.isArray(c.roles)) {
        c.roles.forEach(r => {
          totalOpenRoles += parseInt(r.count || 0, 10);
        });
      }
    });

    const pendingApps = applications.filter(a => a.status === 'PENDING').length;
    const acceptedApps = applications.filter(a => a.status === 'ACCEPTED').length;

    // Remaining open roles (naive approach: total requested minus accepted, floored at 0)
    const remainingRoles = Math.max(0, totalOpenRoles - acceptedApps);

    return {
      activeChallenges: activeChallenges.length,
      openRoles: remainingRoles,
      pendingApps,
      acceptedMembers: acceptedApps,
      teamSize: acceptedApps + 1, // +1 for the Lead
      progress: 0 // Placeholder until sprints are implemented
    };
  }, [challenges, applications]);

  const handleActionClick = (actionName, route) => {
    toast.success(`Launching ${actionName}`);
    navigate(route);
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-12 animate-pulse">
        <div className="h-52 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)]" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]" />
          ))}
        </div>
        <div className="h-80 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)]" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 pb-12"
    >
      {/* Welcome Hero Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[var(--bg-card)] via-[rgba(109,93,246,0.15)] to-[var(--bg-card)] border border-[var(--color-primary)]/40 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="sk-badge-primary text-xs font-bold uppercase tracking-wider">
              🚀 Innovation Lead Headquarters
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-strong)] tracking-tight mb-3">
            Build Teams. Execute Vision. Lead Innovation.
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base font-normal leading-relaxed">
            Your real-time venture command deck. Recruit verified student innovators, orchestrate agile sprints, and transform problem statements into production value.
          </p>
        </div>
        <div className="flex sm:flex-col gap-3 z-10 w-full sm:w-auto">
          <button 
            onClick={() => handleActionClick('Create Challenge Studio', '/create-project')}
            className="btn-sk-primary whitespace-nowrap px-6 py-3 font-bold text-sm shadow-lg shadow-indigo-500/25 cursor-pointer hover:scale-105 transition-transform"
          >
            <Rocket className="w-4 h-4" /> Publish New Challenge
          </button>
          <button 
            onClick={() => handleActionClick('Team Workspace', '/workspace')}
            className="btn-sk-secondary whitespace-nowrap px-6 py-3 font-semibold text-sm cursor-pointer hover:scale-105 transition-transform"
          >
            Open Live Workspace
          </button>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[var(--color-primary)] rounded-full blur-3xl opacity-15 pointer-events-none" />
      </div>

      {/* Top Dashboard Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[ 
          { label: 'Active Challenges', value: metrics.activeChallenges.toString(), sub: metrics.activeChallenges > 0 ? 'Currently live' : 'No active challenges', text: 'text-[var(--color-primary)]' },
          { label: 'Open Roles', value: metrics.openRoles.toString(), sub: `Across ${metrics.activeChallenges} projects`, text: 'text-[var(--color-secondary)]' },
          { label: 'Pending Apps', value: metrics.pendingApps.toString(), sub: metrics.pendingApps > 0 ? 'Needs review' : 'No new applications', text: 'text-[var(--text-accent)]' },
          { label: 'Accepted Members', value: metrics.acceptedMembers.toString(), sub: `${metrics.acceptedMembers} active contributors`, text: 'text-emerald-400' },
          { label: 'Team Size', value: metrics.teamSize.toString(), sub: 'Includes You as Lead', text: 'text-blue-400' },
          { label: 'Project Progress', value: `${metrics.progress}%`, sub: 'No active projects', text: 'text-amber-400' },
        ].map((item, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl sk-glass-card border border-[var(--border-strong)] shadow-sm flex flex-col justify-between"
          >
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{item.label}</span>
            <p className={`text-3xl font-extrabold mt-2 my-1 ${item.text}`}>{item.value}</p>
            <span className="text-[11px] font-medium text-[var(--text-secondary)] mt-1 truncate">{item.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: AI Suggestions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Left 2 Columns: AI Team Suggestions */}
        <div className="lg:col-span-2 sk-glass-card p-6 sm:p-7 space-y-6 border border-[var(--border-strong)] shadow-md">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)]">
                <Sparkles className="w-5 h-5 text-[var(--color-secondary)]" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[var(--text-strong)] flex items-center gap-2">
                  AI Team Recommendation Engine
                  <span className="sk-badge-secondary text-[10px]">Live Sync</span>
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">Autonomous architectural telemetry matching requirements with top university talent.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center p-8 border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)]">
            <p className="text-sm text-[var(--text-muted)] text-center">
              No AI team recommendations yet.<br/>Publish a challenge to start matching with students.
            </p>
          </div>
        </div>

        {/* Right Column: Quick Actions & Timeline */}
        <div className="space-y-6">
          <div className="sk-glass-card p-6 space-y-4 border border-[var(--border-strong)] shadow-md">
            <h3 className="text-base font-bold text-[var(--text-strong)] flex items-center gap-2 pb-2.5 border-b border-[var(--border-subtle)]">
              <Zap className="w-4 h-4 text-[var(--color-primary)]" /> Quick Command Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Create Challenge', icon: Rocket, route: '/create-project' },
                { label: 'Recruit Team', icon: Users, route: '/applications' },
                { label: 'Applications', icon: FileText, route: '/applications' },
                { label: 'Workspace', icon: Cpu, route: '/workspace' },
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleActionClick(action.label, action.route)}
                    className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--color-primary)] hover:bg-[var(--bg-card-hover)] transition-all duration-200 flex flex-col items-center justify-center text-center group cursor-pointer shadow-sm"
                  >
                    <Icon className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--color-primary)] mb-2 transition-transform group-hover:scale-110" />
                    <span className="text-xs font-bold text-[var(--text-strong)]">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timeline Widget */}
          <div className="sk-glass-card p-6 space-y-4 border border-[var(--border-strong)] shadow-md">
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)]">
              <span className="text-base font-bold text-[var(--text-strong)] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--color-secondary)]" /> Timeline & Recruitment
              </span>
              <Link to="/milestones" className="text-xs text-[var(--color-secondary)] hover:underline font-semibold">View All</Link>
            </div>
            <div className="space-y-3.5">
              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] text-center">
                <p className="text-xs text-[var(--text-muted)]">No active timeline milestones.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Analytics & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Left 2 Columns: Challenge Analytics Chart (Recharts) */}
        <div className="lg:col-span-2 sk-glass-card p-6 sm:p-7 space-y-4 border border-[var(--border-strong)] shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-[var(--border-subtle)]">
            <div>
              <h2 className="text-lg font-extrabold text-[var(--text-strong)] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--color-secondary)]" /> Challenge Analytics & Engagement
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">Live telemetry of challenge views, bookmarks, and application funnel.</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[var(--text-secondary)] font-medium">Acceptance Rate</span>
              <p className="text-lg font-extrabold text-[var(--text-muted)]">N/A</p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ANALYTICS_DATA}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBookmarks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 12 }} axisLine={false} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)', borderRadius: '12px', color: 'var(--text-strong)' }} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="views" name="Challenge Views" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="bookmarks" name="Bookmarks Saved" stroke="var(--color-secondary)" strokeWidth={3} fillOpacity={1} fill="url(#colorBookmarks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Recent Activity Stream */}
        <div className="sk-glass-card p-6 sm:p-7 flex flex-col justify-between border border-[var(--border-strong)] shadow-md">
          <div>
            <h3 className="text-base font-bold text-[var(--text-strong)] pb-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <span>Recent Ecosystem Activity</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)]">Live Feed</span>
            </h3>
            <div className="space-y-4 pt-4">
              {RECENT_ACTIVITIES.length > 0 ? RECENT_ACTIVITIES.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div key={idx} className="flex items-start gap-3.5 border-b border-[var(--border-subtle)] pb-3.5 last:border-0 last:pb-0">
                    <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] flex-shrink-0 mt-0.5">
                      <Icon className={`w-4 h-4 ${act.color}`} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] uppercase">{act.tag}</span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">{act.time}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] font-normal leading-relaxed">{act.text}</p>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center p-4">
                  <p className="text-xs text-[var(--text-muted)]">No recent activity.</p>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={() => navigate('/applications')}
            className="w-full mt-6 py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-strong)] rounded-xl text-xs font-bold text-[var(--text-strong)] transition-colors cursor-pointer"
          >
            Review All Notifications & Logs
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default InnovationLeadDashboard;
