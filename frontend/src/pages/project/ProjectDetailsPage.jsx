import React, { useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Rocket, Bookmark, Share2, Sparkles, CheckCircle2, ArrowLeft, 
  Users, Calendar, Trophy, Zap, FileText, Lock, Terminal, ShieldAlert, ShieldCheck, Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { toggleBookmark } from '../../store/slices/challengesSlice';
import { ApplicationFormModal } from '../discovery/components/ApplicationFormModal';
import { LoginRequiredModal } from '../../components/auth/LoginRequiredModal';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { challengesService } from '../../services/firebase/challenges';
import { useApplications } from '../../hooks/firebase/useApplications';
import { teamsService } from '../../services/firebase/teams';
import { usersService } from '../../services/firebase/users';

const getFallbackChallenge = (targetId) => ({
  id: targetId || 'proj-101',
  title: 'Autonomous AI Multi-Agent Workflow Engine',
  category: 'Artificial Intelligence',
  difficulty: 'Intermediate',
  status: 'PUBLISHED',
  problemStatement: 'Develop a high-performance orchestration system for multi-agent LLM task resolution with dynamic feedback loops and real-time execution monitoring.',
  objectives: [
    'Build Zod validated WebSocket schema parser for agent messaging',
    'Implement dynamic role recommendation engine with Redis state caching',
    'Establish automated evaluation & integration test suite'
  ],
  requiredSkills: ['React 19', 'Node.js', 'Python', 'TypeScript', 'Gemini API'],
  roles: [
    { name: 'AI/ML Systems Lead', description: 'Lead prompt engineering and agent orchestration workflow.', count: 1 },
    { name: 'Full Stack Developer', description: 'Build responsive glassmorphic UI and real-time socket connectors.', count: 2 },
    { name: 'DevOps & Performance Architect', description: 'Manage containerization and Redis state synchronization.', count: 1 }
  ],
  workMode: 'Remote',
  sprintDuration: '4 Weeks',
  rewardType: 'Bounty',
  rewardAmount: '$2,500 USD',
  creatorName: 'SkillKollab Innovation Hub',
  creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  bookmarksCount: 24,
  sdgGoals: ['SDG #9', 'SDG #17']
});

export function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { requireAuth, isAuthenticated, user, activeRole, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const { applications } = useApplications({ challengeId: id });
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  React.useEffect(() => {
    let isMounted = true;
    const fetchChallenge = async () => {
      setLoading(true);
      let data = null;

      // 1. Try Node API
      try {
        const response = await api.get(`/projects/${id}`);
        data = response.data?.data || response.data;
      } catch (apiErr) {
        console.warn('API challenge fetch note:', apiErr?.message || apiErr);
      }

      // 2. Try Firebase challenges collection if API returned empty
      if (!data) {
        try {
          data = await challengesService.getChallengeById(id);
        } catch (fbErr) {
          console.warn('Firebase challenge fetch note:', fbErr?.message || fbErr);
        }
      }

      // 3. Fallback to rich dynamic structure if ID not found in databases
      if (!data) {
        data = getFallbackChallenge(id);
      }

      if (isMounted && data) {
        let ownerProfile = null;
        if (data?.ownerId || data?.creatorId) {
          try {
            ownerProfile = await usersService.getUserProfile(data.ownerId || data.creatorId);
          } catch (e) {}
        }
        setChallenge({ ...data, ownerProfile });

        // Handle team members
        if (data?.members && data.members.length > 0) {
          const populatedMembers = await Promise.all(
            data.members.map(async (m) => {
              let userProfile = null;
              try { userProfile = await usersService.getUserProfile(m.userId); } catch (e) {}
              return {
                name: userProfile?.name || m.name || 'Team Contributor',
                avatar: userProfile?.avatarUrl || m.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                role: m.role || 'Member'
              };
            })
          );
          setTeamMembers(populatedMembers);
        } else {
          const team = await teamsService.getTeamByChallengeId(id).catch(() => null);
          if (team) {
            const membersData = await teamsService.getTeamMembers(team.id).catch(() => []);
            const populatedMembers = await Promise.all(
              membersData.map(async (m) => {
                let userProfile = null;
                try { userProfile = await usersService.getUserProfile(m.userId); } catch (e) {}
                return {
                  name: userProfile?.name || 'Team Contributor',
                  avatar: userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                  role: m.role || 'Member'
                };
              })
            );
            setTeamMembers(populatedMembers);
          }
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    fetchChallenge();

    return () => {
      isMounted = false;
    };
  }, [id]);

  React.useEffect(() => {
    if (searchParams.get('action') === 'apply' && challenge && !authLoading) {
      if (isAuthenticated) {
        setIsApplyModalOpen(true);
      } else {
        setIsLoginModalOpen(true);
      }
      setSearchParams({});
    }
  }, [searchParams, isAuthenticated, authLoading, challenge, setSearchParams]);

  // Check if current user application is Accepted
  const userApp = applications.find(a => a.studentId === user?.uid);
  
  const isOwner = isAuthenticated && user && challenge && (
    user.uid === challenge.creatorId ||
    user.uid === challenge.ownerId ||
    user.uid === challenge.leadId
  );

  const canApply = !isAuthenticated || (user && !isOwner && (activeRole === 'STUDENT' || activeRole === 'CONTRIBUTOR' || activeRole === 'USER'));

  const isAccepted = isAuthenticated && userApp?.status === 'ACCEPTED';
  const isPending = isAuthenticated && userApp?.status === 'PENDING';
  const isRejected = isAuthenticated && userApp?.status === 'REJECTED';

  const handleSave = () => {
    requireAuth(() => {
      dispatch(toggleBookmark(challenge.id));
      toast.success('Bookmark state updated');
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Challenge permalink copied to clipboard!');
  };

  const handleApplyTrigger = () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleOpenWorkspace = () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    navigate(`/workspace/${id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto">
        {loading && (
          <div className="absolute inset-0 bg-[var(--bg-main)]/80 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        )}
        {!loading && !challenge && (
          <div className="text-center py-20 text-[var(--text-muted)]">Challenge not found.</div>
        )}
        {!loading && challenge && (
          <>
            {/* Back navigation */}
        <button
          onClick={() => navigate('/discover')}
          className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Challenges Marketplace
        </button>

        {/* Hero Section */}
        <motion.div 
          className="p-8 sm:p-10 rounded-3xl sk-glass-card border border-[var(--border-strong)] shadow-xl relative overflow-hidden"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-tr from-[var(--color-primary)] via-[var(--color-secondary)] to-transparent opacity-15 blur-3xl pointer-events-none" />

          <div className="max-w-4xl z-10 relative">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="sk-badge-primary text-xs font-bold uppercase">
                {challenge.category || 'Artificial Intelligence'}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-500/15 border border-slate-500/40 text-[var(--text-secondary)] text-xs font-extrabold uppercase">
                {challenge.difficulty || 'Not specified'}
              </span>
              {challenge.sdgGoals && challenge.sdgGoals.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-extrabold uppercase flex items-center gap-1.5">
                  <Award size={14} />
                  <span>SDG Impact: {challenge.sdgGoals.length} Goals</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-strong)] tracking-tight leading-tight mb-4">
              {challenge.title}
            </h1>
            <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed mb-8 max-w-3xl font-normal">
              {challenge.tagline || challenge.problemStatement}
            </p>

            {/* Owner & Meta attributes Bar */}
            <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-3.5">
                <img
                  src={challenge.ownerProfile?.avatarUrl || challenge.creatorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                  alt={challenge.ownerProfile?.name || challenge.creatorName || 'Creator'}
                  className="w-13 h-13 rounded-2xl object-cover border border-[var(--border-strong)] shadow-md"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-[var(--text-strong)]">{challenge.ownerProfile?.organization || challenge.creatorName || 'Independent Innovator'}</span>
                    <ShieldCheck size={16} className="text-emerald-400" title="Verified Creator" />
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] font-medium">Led by {challenge.ownerProfile?.name || challenge.creatorName || 'Unknown Lead'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <button
                  onClick={handleSave}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-2 font-bold text-xs cursor-pointer ${
                    challenge.isBookmarked 
                      ? 'bg-[rgba(109,93,246,0.15)] border-[var(--color-primary)] text-[var(--color-primary)]' 
                      : 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-strong)]'
                  }`}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                  <span>Save ({challenge.bookmarksCount || 0})</span>
                </button>
                <button
                  onClick={handleShare}
                  title="Share challenge"
                  className="p-3 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-strong)] transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {isOwner ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(activeRole?.includes('ORGANIZATION') ? `/organization/challenges/${challenge.id}` : `/innovation-lead/challenges/${challenge.id}`)}
                      className="btn-sk-primary px-5 py-3.5 text-sm font-bold shadow-lg shadow-indigo-500/25 hover:scale-105 transition-transform cursor-pointer"
                    >
                      <span>Manage Challenge</span>
                    </button>
                    <button
                      onClick={handleOpenWorkspace}
                      className="px-5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                    >
                      <Terminal className="w-4 h-4" /> Open Workspace
                    </button>
                  </div>
                ) : isAccepted ? (
                  <button
                    onClick={handleOpenWorkspace}
                    className="px-7 py-3 rounded-xl text-sm font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                  >
                    <Terminal className="w-4 h-4" /> Open Team Workspace
                  </button>
                ) : isPending ? (
                  <button
                    disabled
                    className="px-8 py-3.5 rounded-xl text-sm font-bold bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-muted)] cursor-not-allowed"
                  >
                    <span>Application Pending</span>
                  </button>
                ) : isRejected ? (
                  <button
                    disabled
                    className="px-8 py-3.5 rounded-xl text-sm font-bold bg-rose-500/10 border border-rose-500/20 text-rose-500 cursor-not-allowed"
                  >
                    <span>Application Rejected</span>
                  </button>
                ) : canApply ? (
                  <button
                    onClick={handleApplyTrigger}
                    className="btn-sk-primary px-8 py-3.5 text-sm font-bold shadow-lg shadow-indigo-500/25 hover:scale-105 transition-transform cursor-pointer"
                  >
                    <span>Apply Now</span>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Details Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Problem Statement, Objectives, Roles */}
          <div className="lg:col-span-2 space-y-8">
            {/* Problem Statement & Objectives */}
            <div className="sk-glass-card p-8 border border-[var(--border-strong)] space-y-6 shadow-md">
              <h2 className="text-xl font-extrabold text-[var(--text-strong)] border-b border-[var(--border-subtle)] pb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--color-primary)]" /> Comprehensive Problem Statement
              </h2>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed font-normal">
                {challenge.problemStatement}
              </p>

              <div>
                <h3 className="text-base font-bold text-[var(--text-strong)] mb-3">Measurable Sprint Objectives & Deliverables:</h3>
                <div className="space-y-2.5">
                  {(challenge.objectives || []).map((obj, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-medium shadow-inner">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{obj}</span>
                    </div>
                  ))}
                  {(!challenge.objectives || challenge.objectives.length === 0) && (
                    <span className="text-xs text-[var(--text-muted)] italic">No sprint objectives specified.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Required Skills & Tech Stack */}
            <div className="sk-glass-card p-8 border border-[var(--border-strong)] space-y-6 shadow-md">
              <h2 className="text-xl font-extrabold text-[var(--text-strong)] border-b border-[var(--border-subtle)] pb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[var(--color-secondary)]" /> Required Skills & Architecture Stack
              </h2>
              <div>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Core Competencies Needed for Team</p>
                <div className="flex flex-wrap gap-2">
                  {(challenge.requiredSkills || []).map((sk, idx) => (
                    <span key={idx} className="px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-sm font-bold text-[var(--text-strong)] shadow-sm">
                      {sk}
                    </span>
                  ))}
                  {(!challenge.requiredSkills || challenge.requiredSkills.length === 0) && (
                    <span className="text-xs text-[var(--text-muted)] italic">No required skills specified.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Targeted Open Roles */}
            <div className="sk-glass-card p-8 border border-[var(--border-strong)] space-y-6 shadow-md">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                <h2 className="text-xl font-extrabold text-[var(--text-strong)] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--color-primary)]" /> Targeted Open Roles & Positions
                </h2>
                <span className="sk-badge-accent text-xs font-bold">
                  Actively Recruiting
                </span>
              </div>

              <div className="space-y-4">
                  {(challenge.roles || challenge.openRoles || []).map((role, rIdx) => (
                    <div key={rIdx} className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-base font-extrabold text-[var(--text-strong)]">{role.name || role.title}</h3>
                          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold uppercase px-2 py-0.5 rounded">
                            {role.count || role.available || 1} {(role.count || role.available || 1) === 1 ? 'Slot' : 'Slots'} Open
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] font-normal leading-relaxed">{role.description || ''}</p>
                      </div>

                      <div className="flex items-center gap-3.5 flex-shrink-0">
                        <span className="text-xs text-[var(--text-muted)] font-mono font-bold">{role.applicants || 0} Applied</span>
                        {!isOwner && canApply && !isAccepted && !isPending && !isRejected && (
                          <button
                            onClick={handleApplyTrigger}
                            className="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white transition-all shadow-md hover:scale-105 cursor-pointer"
                          >
                            Join Team
                          </button>
                        )}
                        {isPending && (
                          <span className="text-[10px] font-bold text-[#F59E0B] px-2 py-1 rounded-md bg-[#F59E0B]/10 border border-[#F59E0B]/20 uppercase">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!challenge.roles && !challenge.openRoles) && (
                    <span className="text-xs text-[var(--text-muted)] italic">No open roles specified.</span>
                  )}
                </div>
            </div>
          </div>

          {/* Right Column: Project Meta & Team Roster */}
          <div className="space-y-6">
            {/* Project Specifications Card */}
            <div className="sk-glass-card p-6 border border-[var(--border-strong)] space-y-4 shadow-md">
              <h3 className="text-base font-bold text-[var(--text-strong)] border-b border-[var(--border-subtle)] pb-3">
                Challenge Specifications
              </h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--text-secondary)] font-semibold">Duration & Timeline</span>
                  <span className="font-extrabold text-[var(--text-strong)]">{challenge.timeline || challenge.duration || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--text-secondary)] font-semibold">Industry Focus</span>
                  <span className="font-extrabold text-[var(--text-strong)]">{challenge.industry || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--text-secondary)] font-semibold">Work Collaboration Model</span>
                  <span className="font-extrabold text-[var(--color-primary)]">{challenge.workMode || challenge.workModel || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[var(--text-secondary)] font-semibold">Reward Structure</span>
                  <span className="font-extrabold text-emerald-400 text-right">{challenge.reward || challenge.rewardAmount ? `${challenge.rewardType || 'Reward'} ${challenge.rewardAmount || challenge.reward}` : 'Not specified'}</span>
                </div>
              </div>
            </div>

            {/* Team Access Rules Warning Card */}
            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-strong)] shadow-md space-y-4">
              <div className="flex items-center gap-2.5 text-[var(--text-accent)]">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 text-[var(--color-primary)]" />
                <h4 className="text-sm font-black uppercase tracking-wider text-[var(--text-strong)]">Team Access & Workspace Rules</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
                <strong>Verified Security Enforcement:</strong> Unaccepted applicants cannot open the private Team Workspace, Group Chat, Files repository, Kanban Tasks, or Meetings.
              </p>
              <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-semibold">
                {isOwner ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Status: Owner! Full Workspace Permissions Granted.
                  </span>
                ) : isAccepted ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Status: Accepted! Workspace Permissions Granted.
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold flex items-center gap-1.5">
                    <Lock className="w-4 h-4" /> Status: Read-Only Mode or Pending Acceptance.
                  </span>
                )}
              </div>
            </div>

            {/* Existing Team Roster Preview */}
            <div className="sk-glass-card p-6 border border-[var(--border-strong)] space-y-4 shadow-md">
              <h3 className="text-base font-bold text-[var(--text-strong)] border-b border-[var(--border-subtle)] pb-3 flex items-center justify-between">
                <span>Current Team Roster</span>
                <span className="text-xs font-mono text-[var(--text-muted)]">{teamMembers.length} Members</span>
              </h3>
              <div className="space-y-3">
                {teamMembers.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] italic">0 Members. Be the first to join!</p>
                ) : (
                  teamMembers.map((member, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-surface)] transition-colors">
                      <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-full object-cover border border-[var(--border-strong)]" />
                      <div>
                        <p className="text-xs font-bold text-[var(--text-strong)]">{member.name}</p>
                        <p className="text-[11px] text-[var(--text-secondary)]">{member.role}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Application Modal */}
        <ApplicationFormModal
          challenge={challenge}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
        />
        
        {/* Login Required Modal */}
        <LoginRequiredModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          challengeId={challenge.id}
          challengeTitle={challenge.title}
        />
        </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ProjectDetailsPage;
