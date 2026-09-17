import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users2, CheckCircle2, XCircle, Calendar, MessageSquare, Sparkles, 
  ExternalLink, FolderGit2, FileText, Lock, Terminal, ShieldCheck, 
  Search, Filter, Award, UserCheck, AlertTriangle, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useApplications } from '../../hooks/firebase/useApplications';
import { applicationsService } from '../../services/firebase/applications';
import { teamsService } from '../../services/firebase/teams';
export function ApplicationsManagementPage() {
  const { user, activeRole, profile } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const isLead = activeRole === 'INNOVATION_LEAD';

  const filter = isLead ? { challengeCreatorId: user?.uid } : { studentId: user?.uid };
  const { applications, loading } = useApplications(filter);

  const [filterRole, setFilterRole] = useState('All Roles');

  // Extract unique roles from applications
  const uniqueRoles = ['All Roles', ...new Set(applications.map(app => app.roleApplied).filter(Boolean))];

  // Filter applications by role and status
  const displayedApps = applications.filter(app => {
    if (filterStatus !== 'All' && app.status !== filterStatus.toUpperCase()) return false;
    if (filterRole !== 'All Roles' && app.roleApplied !== filterRole) return false;
    if (search) {
      const q = search.toLowerCase();
      const nameMatch = app.studentName?.toLowerCase().includes(q);
      const roleMatch = app.roleApplied?.toLowerCase().includes(q);
      const titleMatch = app.challengeTitle?.toLowerCase().includes(q);
      if (!nameMatch && !roleMatch && !titleMatch) return false;
    }
    return true;
  });

  const handleAccept = async (app) => {
    try {
      // 1. Update Application Status
      await applicationsService.updateApplicationStatus(app.id, 'ACCEPTED', user.uid);
      
      // 2. Ensure team exists for challenge
      let team = await teamsService.getTeamByChallengeId(app.challengeId);
      let teamId;
      if (!team) {
        teamId = await teamsService.createTeam(app.challengeId, user.uid, `${app.challengeTitle} Team`);
      } else {
        teamId = team.id;
      }

      // 3. Add user to team
      await teamsService.addTeamMember(teamId, app.challengeId, app.studentId, app.roleApplied);

      toast.success(`🎉 Accepted ${app.studentName}! Team Workspace & permissions automatically unlocked!`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to accept candidate.');
    }
  };

  const handleReject = async (app) => {
    try {
      await applicationsService.updateApplicationStatus(app.id, 'REJECTED', user.uid);
      toast.error(`Application for ${app.studentName} marked as Rejected.`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to reject candidate.');
    }
  };

  const handleInterview = async (app) => {
    try {
      await applicationsService.updateApplicationStatus(app.id, 'INTERVIEW', user.uid);
      toast.success(`Scheduled interview with ${app.studentName}! Invitation sent.`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to schedule interview.');
    }
  };

  const handleMessage = (candidateName) => {
    navigate('/messages');
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Accepted':
        return 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20';
      case 'Rejected':
        return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20';
      case 'Interview':
        return 'text-[var(--color-primary)] bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20';
      case 'Pending':
      default:
        return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-[var(--border-subtle)] pb-6">
          <div className="flex items-center">
            <span className="py-1 px-3 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-[11px] font-bold uppercase tracking-wider">
              {isLead ? 'Owner Application HQ & AI Screening' : 'My Submitted Challenge Applications'}
            </span>
          </div>
          <h1 className="text-[32px] sm:text-4xl font-bold text-[var(--text-strong)] tracking-tight">
            {isLead ? 'Evaluate Candidates & Manage Team Access' : 'Track Application Status & Workspace Access'}
          </h1>
          <p className="text-[15px] text-[var(--text-secondary)] mt-1 max-w-3xl">
            {isLead 
              ? 'Review AI Match Scores, examine GitHub commits, and grant instant team workspace access upon acceptance.'
              : 'Monitor real-time review updates from Innovation Leads. Once accepted, your team workspace immediately unlocks.'}
          </p>
        </div>

        {/* Filters & Notice */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {['All', 'Pending', 'Accepted', 'Rejected', 'Interview'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${
                  filterStatus === status 
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {isLead && uniqueRoles.length > 1 && (
            <div className="flex-shrink-0">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
              >
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 flex items-center gap-3 lg:w-[450px]">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--text-strong)]">Automated Team Access Rules</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Accepting a candidate automatically unlocks their team workspace, chat, files, and meetings.</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isLead ? 'Search candidates by name, university, or role...' : 'Search your applications by challenge title or role...'}
            className="w-full bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-[12px] pl-12 pr-4 py-3.5 text-[15px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary)]/10 shadow-sm transition-all"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        )}

        {/* Applications List */}
        {!loading && (
        <div className="space-y-6">
          {displayedApps.map((app, idx) => {
            const isCandidateAccepted = app.status === 'ACCEPTED';
            const isRejected = app.status === 'REJECTED';
            const candidate = {
              name: app.studentName || 'User',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
              university: 'University / College',
              skills: ['React', 'Node.js', 'AI'],
              resumeUrl: app.resumeUrl || '#',
              githubUrl: app.githubUrl || 'https://github.com',
              portfolioUrl: app.portfolioUrl || 'https://portfolio.dev',
              expectedContribution: app.expectedContribution || 'Building real-time interactive UI dashboards and custom animations.'
            };

            return (
              <motion.div
                key={app.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-[18px] p-6 sm:p-8 flex flex-col shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-[2px] hover:border-[#C4B5FD] dark:hover:border-[var(--color-primary)] transition-all duration-300 relative group"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-[var(--border-subtle)] pb-6">
                  <div className="flex items-start sm:items-center gap-5 flex-col sm:flex-row">
                    <img 
                      src={candidate.avatar} 
                      alt={candidate.name} 
                      className="w-20 h-20 rounded-full object-cover border border-[var(--border-strong)] shadow-sm"
                    />
                    <div>
                      <h2 className="text-[22px] font-bold text-[var(--text-strong)] flex items-center gap-2">
                        {candidate.name}
                        {isCandidateAccepted && <UserCheck className="w-5 h-5 text-[#10B981]" />}
                      </h2>
                      <p className="text-[15px] font-semibold text-[var(--color-primary)] mt-0.5">{candidate.title || app.roleApplied}</p>
                      <p className="text-[14px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-1.5">
                         {candidate.university || app.challengeTitle} {candidate.degree && `• ${candidate.degree}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-3 flex-shrink-0">
                    {/* Status Badge */}
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusStyle(app.status)}`}>
                      Status: {app.status}
                    </span>
                    {/* AI Match Score Badge */}
                    <div className="px-3.5 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{app.roleMatchScore || app.aiMatchScore || 0}% Role Match</span>
                    </div>
                  </div>
                </div>

                {/* Candidate Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                  {/* Left Column - Details */}
                  <div className="lg:col-span-8 space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-strong)] mb-2">Proposed Role & Expected Contribution</h3>
                      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-xl text-[14px] text-[var(--text-primary)] leading-relaxed">
                        "{candidate.expectedContribution || 'Committed to deploying real-time AST analysis and responsive Framer Motion dashboards.'}"
                      </div>
                    </div>

                    <div className="bg-[var(--color-primary)]/[0.04] border border-[var(--color-primary)]/20 p-4 rounded-xl text-sm">
                      <h3 className="font-semibold text-[var(--color-primary)] flex items-center gap-2 mb-1.5">
                        <Sparkles className="w-4 h-4" /> AI Engine Assessment
                      </h3>
                      <p className="text-[var(--text-secondary)]">
                        {app.aiMatchReason || 'Outstanding overlap in requested skills and real-time socket architectures; verified code commits in relevant libraries.'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-strong)] mb-2">Verified Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills?.map((sk, sIdx) => (
                          <span key={sIdx} className="text-[13px] px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Links & Status */}
                  <div className="lg:col-span-4 flex flex-col space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-strong)] mb-3">Candidate Verification Links</h3>
                      <div className="space-y-3">
                        <a href={candidate.resumeUrl || '#'} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--color-primary)]/50 text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors group">
                          <span className="flex items-center gap-2.5 text-sm font-medium"><FileText className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--color-primary)]" /> Academic Resume (PDF)</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                        </a>
                        <a href={candidate.portfolioUrl || '#'} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--color-primary)]/50 text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors group">
                          <span className="flex items-center gap-2.5 text-sm font-medium"><ExternalLink className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--color-primary)]" /> Live Web Portfolio</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                        </a>
                        <a href={candidate.githubUrl || '#'} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--color-primary)]/50 text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors group">
                          <span className="flex items-center gap-2.5 text-sm font-medium"><FolderGit2 className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--color-primary)]" /> GitHub Commit Roster</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                        </a>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-[var(--border-subtle)]">
                      {isCandidateAccepted ? (
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#10B981] bg-[#10B981]/10 p-3 rounded-xl border border-[#10B981]/20">
                          <CheckCircle2 className="w-4 h-4" /> Workspace Access Enabled
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#EF4444] bg-[#EF4444]/10 p-3 rounded-xl border border-[#EF4444]/20">
                          <Lock className="w-4 h-4" /> Workspace Protected
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-5 border-t border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-[13px] text-[var(--text-muted)] w-full md:w-auto">
                    Target Challenge: <span className="text-[var(--text-secondary)] font-medium">{app.challengeTitle || 'Autonomous AI Security Engine'}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
                    {isLead ? (
                      <>
                        <button
                          onClick={() => handleMessage(candidate.name)}
                          className="px-4 py-2.5 rounded-[10px] bg-[var(--bg-card)] border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 font-medium text-sm transition-colors flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-4 h-4" /> Message
                        </button>
                        <button
                          onClick={() => handleInterview(app.id, candidate.name)}
                          className="px-4 py-2.5 rounded-[10px] bg-[var(--bg-card)] border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 font-medium text-sm transition-colors flex items-center gap-1.5"
                        >
                          <Calendar className="w-4 h-4" /> Interview
                        </button>

                        {app.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleReject(app)}
                            className="px-4 py-2.5 rounded-[10px] bg-[var(--bg-card)] border border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/5 font-medium text-sm transition-colors flex items-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        )}

                        {app.status !== 'ACCEPTED' && (
                          <button
                            onClick={() => handleAccept(app)}
                            className="px-6 py-2.5 rounded-[10px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium text-sm flex items-center gap-2 shadow-[0_4px_14px_rgba(109,74,255,0.2)] transition-all ml-auto md:ml-0"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Accept & Unlock Workspace
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {isCandidateAccepted ? (
                          <button
                            onClick={() => navigate('/workspace')}
                            className="px-6 py-2.5 rounded-[10px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium text-sm flex items-center gap-2 shadow-[0_4px_14px_rgba(109,74,255,0.2)] transition-all w-full md:w-auto justify-center"
                          >
                            <Terminal className="w-4 h-4" /> Open Team Workspace
                          </button>
                        ) : isRejected ? (
                          <span className="text-sm font-medium text-[#EF4444] px-4 py-2 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 w-full md:w-auto text-center">
                            🔒 Access Denied
                          </span>
                        ) : (
                          <span className="text-[13px] text-[var(--text-muted)] w-full md:w-auto text-center flex items-center justify-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" /> Workspace unlocks upon acceptance
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        )}

        {displayedApps.length === 0 && (
          <div className="py-16 text-center text-[var(--text-muted)] bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-strong)] border-dashed">
            <Users2 className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3 opacity-50" />
            <h3 className="text-lg font-semibold text-[var(--text-strong)] mb-1">No applications found</h3>
            <p className="text-sm mb-6">Try adjusting your filters or search terms.</p>
            <button onClick={() => setFilterStatus('All')} className="px-6 py-2 bg-[var(--bg-card)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-[10px] text-sm font-medium hover:bg-[var(--bg-surface)] transition-colors">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
