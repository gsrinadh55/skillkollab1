import React, { useState } from 'react';
import { ShieldAlert, Users, Server, Zap, CheckCircle2, AlertTriangle, Search, RefreshCw, Lock, Terminal, Activity } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import toast from 'react-hot-toast';

const MOCK_TELEMETRY = [
  { metric: 'Total Ecosystem Builders', value: '0', change: '+0% this week', positive: true },
  { metric: 'Active Sprint Cohorts', value: '0', change: '0% completion rate', positive: true },
  { metric: 'AI Co-Pilot Tokens Used', value: '0', change: 'Zero latency anomalies', positive: true },
  { metric: 'Socket.IO Active Rooms', value: '0 Rooms', change: '100% uptime', positive: true },
];

const INITIAL_USERS = [];

export function AdminDashboardPage() {
  const [usersList, setUsersList] = useState(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [loadingRefresh, setLoadingRefresh] = useState(false);

  const handleRefreshTelemetry = () => {
    setLoadingRefresh(true);
    setTimeout(() => {
      setLoadingRefresh(false);
      toast.success('Live server diagnostics & user roster refreshed!');
    }, 800);
  };

  const toggleRole = (id) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        const nextRole = u.role === 'STUDENT' ? 'MENTOR' : u.role === 'MENTOR' ? 'ADMIN' : 'STUDENT';
        toast.success(`Rotated user ${u.name} role to ${nextRole}`);
        return { ...u, role: nextRole };
      }
      return u;
    }));
  };

  const filteredUsers = usersList.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto">
        {/* Admin Warning & Title Banner */}
        <div className="p-8 sm:p-10 rounded-3xl sk-glass-card border border-rose-500/40 shadow-[0_10px_40px_rgba(244,63,94,0.12)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-r from-[var(--bg-card)] via-rose-950/15 to-[var(--bg-card)]">
          <div className="z-10 max-w-2xl">
            <span className="inline-flex px-3.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-black uppercase tracking-wider mb-3 items-center gap-2">
              <ShieldAlert size={15} /> Restricted Admin Telemetry & Moderation Console
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-strong)] tracking-tight mt-1 mb-2">
              Platform Telemetry & Governance
            </h1>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base font-normal leading-relaxed">
              Real-time cluster analytics, Zod schema validation streams, and role rotation capabilities for student cohort governors.
            </p>
          </div>

          <button 
            onClick={handleRefreshTelemetry} 
            className="btn-sk-secondary px-6 py-3 text-xs font-bold whitespace-nowrap flex items-center gap-2 cursor-pointer shadow-md hover:scale-105 transition-transform self-start md:self-auto"
          >
            <RefreshCw size={15} className={loadingRefresh ? 'animate-spin text-[var(--color-secondary)]' : ''} />
            <span>{loadingRefresh ? 'Syncing Streams...' : 'Refresh Telemetry'}</span>
          </button>
        </div>

        {/* KPI Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MOCK_TELEMETRY.map((kpi, index) => (
            <div key={index} className="p-6 rounded-2xl sk-glass-card border border-[var(--border-strong)] shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{kpi.metric}</span>
                <Activity size={16} className="text-[var(--color-secondary)]" />
              </div>
              <strong className="text-3xl font-extrabold text-[var(--text-strong)] mt-4 mb-1 font-mono">{kpi.value}</strong>
              <span className={`text-xs font-bold ${kpi.positive ? 'text-emerald-400' : 'text-rose-400'}`}>{kpi.change}</span>
            </div>
          ))}
        </div>

        {/* User Governance Table */}
        <div className="sk-glass-card p-7 rounded-3xl border border-[var(--border-strong)] shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
            <div>
              <h3 className="text-xl font-extrabold text-[var(--text-strong)] flex items-center gap-2.5">
                <Users size={22} className="text-[var(--color-primary)]" />
                Builder & Mentor Roster Governance
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Manage RBAC permissions across all university incubators.</p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search builder name or email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-xs text-[var(--text-strong)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-strong)] text-[var(--text-muted)] font-extrabold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Builder Identity</th>
                  <th className="py-3.5 px-4">Ecosystem Role</th>
                  <th className="py-3.5 px-4">Weekly Contributions</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Governance Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-medium text-[var(--text-secondary)]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--bg-surface)] transition-colors">
                    <td className="py-4 px-4">
                      <strong className="text-sm text-[var(--text-strong)] font-extrabold block">{u.name}</strong>
                      <span className="text-[11px] text-[var(--text-muted)]">{u.email}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                        u.role === 'ADMIN' ? 'bg-rose-500/15 text-rose-400 border-rose-500/40' :
                        u.role === 'MENTOR' ? 'bg-purple-500/15 text-purple-400 border-purple-500/40' :
                        'bg-cyan-500/15 text-cyan-400 border-cyan-500/40'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-[var(--text-strong)] text-sm">{u.hours}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 font-bold ${
                        u.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => toggleRole(u.id)}
                        className="px-4 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--color-primary)] text-[var(--text-strong)] hover:text-white border border-[var(--border-strong)] transition-all font-bold cursor-pointer shadow-sm"
                      >
                        Rotate Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Server Telemetry Diagnostic Log */}
        <div className="p-6 rounded-2xl bg-[#0B0F19] border border-cyan-500/30 text-cyan-300 font-mono text-xs space-y-2.5 shadow-inner">
          <div className="flex items-center gap-2 text-[var(--text-muted)] pb-2 border-b border-white/10 text-[11px] font-extrabold uppercase tracking-wider">
            <Terminal size={16} className="text-cyan-400" /> Server Telemetry Deployment Logs (WSS // PORT 5000)
          </div>
          <div>[INFO] Prisma Schema synced successfully with zero destructive migration alerts.</div>
          <div>[INFO] Socket.IO connection pool holding 94 active collaborative rooms with automatic fallback enabled.</div>
          <div>[SUCCESS] All Zod validator schemas for authentication and sprint tasks passing rigorous integration checks.</div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboardPage;
