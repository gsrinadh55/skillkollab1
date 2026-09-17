import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChallenges } from '../../hooks/firebase/useChallenges';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FolderOpen } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';

export function MyChallengesPage() {
  const { user } = useAuth();
  const { challenges, loading } = useChallenges(user?.uid);
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredChallenges = (challenges || []).filter(ch => {
    if (filter !== 'All' && ch.status !== filter.toLowerCase()) return false;
    if (search && !ch.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-[#10B981]';
      case 'recruiting': 
        return 'text-[var(--color-primary)]';
      case 'completed': 
        return 'text-[#3B82F6]';
      case 'closed': 
        return 'text-[#EF4444]';
      case 'draft': 
      default: 
        return 'text-[var(--text-muted)]';
    }
  };

  const displayStatus = (status) => {
    if (!status) return 'Draft';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!challenges || challenges.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mb-6 border border-[var(--border-subtle)]">
             <FolderOpen className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-strong)] mb-2">No challenges yet</h1>
          <p className="text-[var(--text-secondary)] mb-8">
            Create your first real-world challenge and invite students to solve it.
          </p>
          <button
            onClick={() => navigate('/create-project')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-[12px] font-medium transition-colors shadow-[0_4px_14px_rgba(109,74,255,0.2)]"
          >
            <Plus className="w-4 h-4" />
            Create Challenge
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-[var(--text-strong)] tracking-tight leading-tight">
              My Challenges
            </h1>
            <p className="text-[15px] text-[var(--text-secondary)] mt-1">
              Manage your challenges, review applications, and build student teams.
            </p>
          </div>
          <button
            onClick={() => navigate('/create-project')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-[12px] font-medium transition-colors whitespace-nowrap shadow-[0_4px_14px_rgba(109,74,255,0.2)]"
          >
            <Plus className="w-4 h-4" /> Create Challenge
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-[10px] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary)]/10 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {['All', 'Active', 'Recruiting', 'Completed', 'Draft'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${
                  filter === f
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredChallenges.map((ch) => (
            <div
              key={ch.id}
              className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-[18px] p-6 flex flex-col justify-between shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-[2px] hover:border-[#C4B5FD] dark:hover:border-[var(--color-primary)] transition-all duration-300 group"
            >
              <div>
                <div className="mb-3">
                  <span className="text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-md">
                    {ch.category || 'Challenge'}
                  </span>
                </div>
                <h2 
                  className="text-[20px] font-semibold text-[var(--text-strong)] mt-3 cursor-pointer group-hover:text-[var(--color-primary)] transition-colors"
                  onClick={() => navigate(`/projects/${ch.id}`)}
                >
                  {ch.title}
                </h2>
                
                <p className="text-[14px] sm:text-[15px] text-[var(--text-secondary)] line-clamp-2 mt-2 mb-4 leading-relaxed">
                  {ch.problemStatement}
                </p>
                
                <div className="flex items-center text-sm font-medium mb-5">
                  <span className={`flex items-center gap-1.5 ${getStatusStyle(ch.status)}`}>
                    <span className="text-[10px]">●</span> {displayStatus(ch.status)}
                  </span>
                </div>
                
                {/* Information Row */}
                <div className="grid grid-cols-3 gap-4 border-y border-[var(--border-subtle)] py-4 mb-5">
                  <div>
                    <span className="text-[13px] text-[var(--text-secondary)] block mb-1">Applications</span>
                    <span className="text-sm font-semibold text-[var(--text-strong)]">{ch.applicationsCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-[13px] text-[var(--text-secondary)] block mb-1">Team</span>
                    <span className="text-sm font-semibold text-[var(--text-strong)]">
                      {ch.teamCount || 0}{ch.maxTeamSize ? ` / ${ch.maxTeamSize}` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-[13px] text-[var(--text-secondary)] block mb-1">Progress</span>
                    <span className="text-sm font-semibold text-[var(--color-primary)]">{ch.progress || 0}%</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <span className="text-[13px] text-[var(--text-secondary)] block mb-2">Required skills</span>
                  <div className="flex flex-wrap gap-2">
                    {ch.skills?.length > 0 ? (
                      ch.skills.map(skill => (
                        <span key={skill} className="text-[13px] font-medium bg-[var(--bg-surface)] text-[var(--text-secondary)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)]">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-[13px] text-[var(--text-muted)] italic">No skills specified</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button 
                  onClick={() => navigate(`/projects/${ch.id}`)}
                  className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-[10px] text-sm font-medium transition-colors shadow-sm"
                >
                  View Challenge
                </button>
                <button 
                  onClick={() => navigate(`/projects/${ch.id}/applications`)}
                  className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-strong)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-[10px] text-sm font-medium transition-colors"
                >
                  Applications
                </button>
                {(ch.teamCount > 0 || ch.hasWorkspace || ch.status === 'active' || ch.status === 'recruiting') && (
                  <button 
                    onClick={() => navigate(`/workspace/${ch.id}`)}
                    className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-strong)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-[10px] text-sm font-medium transition-colors ml-auto"
                  >
                    Open Workspace
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {filteredChallenges.length === 0 && challenges.length > 0 && (
            <div className="col-span-1 lg:col-span-2 py-16 text-center text-[var(--text-muted)] bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-strong)] border-dashed">
              No challenges match your filters.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
