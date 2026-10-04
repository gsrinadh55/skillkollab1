import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Bookmark, Share2, Sparkles, Trophy, MapPin, 
  Clock, CheckCircle, ArrowUpRight, Zap, RefreshCw, ChevronDown, ShieldCheck, Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { setFilter, resetFilters, toggleBookmark } from '../../store/slices/challengesSlice';
import { ApplicationFormModal } from './components/ApplicationFormModal';
import { useAuth } from '../../context/AuthContext';
import { useChallenges } from '../../hooks/firebase/useChallenges';
import { useApplications } from '../../hooks/firebase/useApplications';

const SDG_MAP = {
  'Artificial Intelligence': 'SDG #9: Innovation & AI Infrastructure',
  'CleanTech': 'SDG #13: Climate Action & Energy',
  'BioTech': 'SDG #3: Good Health & Wellbeing',
  'EdTech': 'SDG #4: Quality Education',
  'default': 'SDG #17: Partnerships for the Goals'
};

export function DiscoverProjectsPage() {
  const { filters } = useSelector((state) => state.challenges);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { requireAuth, user, activeRole } = useAuth();

  const { challenges, loading: challengesLoading } = useChallenges();
  const { applications, loading: appsLoading } = useApplications({ studentId: user?.uid });

  const [selectedChallengeForModal, setSelectedChallengeForModal] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Apply filters
  const filteredChallenges = challenges.filter(ch => {
    if (filters.search && !ch.title.toLowerCase().includes(filters.search.toLowerCase()) && !ch.problemStatement.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.difficulty !== 'All' && ch.difficulty !== filters.difficulty) return false;
    if (filters.category !== 'All' && !ch.category.includes(filters.category)) return false;
    if (filters.workMode !== 'All' && !ch.workMode.includes(filters.workMode)) return false;
    
    // Hide challenges the user is already a part of, applied to, or created
    const userApp = applications.find(a => a.challengeId === ch.id);
    if (userApp) return false;
    if (ch.ownerId === user?.uid || ch.creatorId === user?.uid) return false;

    return true;
  });

  const handleApplyClick = (e, challenge) => {
    e.stopPropagation();
    navigate(`/projects/${challenge.id}?action=apply`);
  };

  const handleOpenWorkspace = (e, id) => {
    e.stopPropagation();
    requireAuth(`/projects/${id}/workspace`);
  };

  const handleSaveClick = (e, id) => {
    e.stopPropagation();
    requireAuth(() => {
      dispatch(toggleBookmark(id));
      toast.success('Challenge bookmarked to your saved collection!');
    });
  };

  const handleShareClick = (e, challenge) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/projects/${challenge.id}`);
    toast.success('Challenge permalink copied to clipboard!');
  };

  const handleCardClick = (id) => {
    navigate(`/projects/${id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16">
        {challengesLoading && (
          <div className="absolute inset-0 bg-[var(--bg-main)]/50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        )}
        {/* Top Marketplace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs flex items-center gap-1.5 px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 rounded-full font-bold">
                <Sparkles className="w-3.5 h-3.5" /> Live Student Innovation Marketplace
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-strong)] tracking-tight">
              Discover & Join Verified Challenges
            </h1>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base mt-1 max-w-3xl font-medium leading-relaxed">
              Collaborate with passionate peers, university incubators, and industry leaders to build verified real-world solutions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => { dispatch(resetFilters()); toast.success('Filters reset to default'); }}
              className="flex items-center justify-center gap-2 bg-[var(--bg-card)] text-[var(--text-strong)] font-semibold rounded-[12px] px-4 py-2.5 border border-[var(--border-strong)] transition-all hover:bg-[var(--bg-surface)] hover:text-[var(--color-primary)] cursor-pointer text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
            </button>
            <button 
              onClick={() => requireAuth(() => navigate('/create-project'))}
              className="flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold rounded-[12px] px-5 py-2.5 transition-all hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(124,58,237,0.25)] cursor-pointer border-none text-xs"
            >
              + Publish Problem Statement
            </button>
          </div>
        </div>

        {/* Multi-Filter Bar Section */}
        <div className="bg-[var(--bg-card)] p-5 border border-[var(--border-subtle)] rounded-[16px] space-y-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => dispatch(setFilter({ key: 'search', value: e.target.value }))}
                placeholder="Search problem statements or skills..."
                className="w-full bg-[var(--bg-main)] border border-[var(--border-strong)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
              />
            </div>

            {/* Filter: Difficulty */}
            <div>
              <select
                value={filters.difficulty}
                onChange={(e) => dispatch(setFilter({ key: 'difficulty', value: e.target.value }))}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-strong)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] cursor-pointer"
              >
                <option value="All">All Difficulties</option>
                <option value="Advanced">Advanced</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Beginner">Beginner</option>
              </select>
            </div>

            {/* Filter: Category / Tech Stack */}
            <div>
              <select
                value={filters.category}
                onChange={(e) => dispatch(setFilter({ key: 'category', value: e.target.value }))}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-strong)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] cursor-pointer"
              >
                <option value="All">All Categories & Tech Stacks</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="CleanTech">CleanTech</option>
                <option value="BioTech">BioTech</option>
                <option value="EdTech">EdTech</option>
              </select>
            </div>

            {/* Filter: Work Mode */}
            <div>
              <select
                value={filters.workMode}
                onChange={(e) => dispatch(setFilter({ key: 'workMode', value: e.target.value }))}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-strong)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] cursor-pointer"
              >
                <option value="All">All Work Models (Remote & Hybrid)</option>
                <option value="Remote">Remote (Global Sync)</option>
                <option value="Hybrid">Hybrid (On-site & Remote)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Challenge Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          {filteredChallenges.map((challenge, index) => {
            const sdgTag = SDG_MAP[challenge.category] || SDG_MAP['default'];
            const userApp = applications.find(a => a.challengeId === challenge.id || (challenge.id === 'ch-1' && a.id === 'my-app-1'));
            const isAccepted = activeRole === 'INNOVATION_LEAD' || userApp?.status === 'Accepted';
            const isPending = userApp?.status === 'Pending';
            const isRejected = userApp?.status === 'Rejected';
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleCardClick(challenge.id)}
                className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-[18px] p-[26px] shadow-sm hover:border-[var(--color-primary)] hover:shadow-md hover:-translate-y-[2px] transition-all duration-[200ms] ease-out flex flex-col justify-between cursor-pointer group relative overflow-hidden"
              >
                <div>
                  {/* Header Info: Logo, Owner, Verified Stamp & Badges */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={challenge.owner?.avatar || challenge.logo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                        alt={challenge.owner?.name || 'Incubator'}
                        className="w-13 h-13 rounded-2xl object-cover border border-[var(--border-subtle)] shadow-sm group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)]">
                          <span>{challenge.owner?.name || 'SkillKollab Verified Org'}</span>
                          <ShieldCheck size={14} className="text-[#10B981] shrink-0" title="Verified Organization" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-strong)] line-clamp-1 mt-1">
                          {challenge.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        challenge.difficulty === 'Advanced' ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' :
                        challenge.difficulty === 'Intermediate' ? 'bg-amber-500/15 text-amber-500' :
                        'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        {challenge.difficulty}
                      </span>
                      <span className="text-[11px] font-semibold text-[var(--color-primary)] flex items-center gap-1">
                        <span className="text-[#F59E0B]">★</span> Impact Score: {challenge.impactScore || '9.4'} / 10
                      </span>
                    </div>
                  </div>

                  {/* Problem Statement */}
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal leading-relaxed line-clamp-3 mb-5">
                    {challenge.problemStatement}
                  </p>

                  {/* SDG Badge & Required Skills */}
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5 w-fit">
                        <Award size={13} />
                        <span>{sdgTag}</span>
                      </span>
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-1.5">
                        {(challenge.requiredSkills || ['React', 'Python', 'AI / LLM']).map((skill, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium transition-colors hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Open Roles & Reward Pill Box */}
                  <div className="p-4 rounded-[14px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] grid grid-cols-2 gap-3 text-xs mb-6">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block">Open Team Roles</span>
                      <span className="text-xs font-bold text-[var(--text-strong)] mt-0.5 block truncate">
                        {challenge.openRoles ? `${challenge.openRoles.length} Roles (${challenge.openRoles.reduce((a, b) => a + b.available, 0)} slots)` : '3 Open Roles'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block">Reward & Recognition</span>
                      <span className="text-xs font-bold text-[#10B981] mt-0.5 block truncate">
                        {challenge.reward || '$5,000 Equity + Stipend'}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5 text-[11px] text-[var(--text-strong)] font-medium">
                      <span>⏱️ Timeline: {challenge.timeline || '12 Weeks'}</span>
                      <span>📍 Mode: {challenge.workMode || 'Remote'}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar: Save, Share, Apply Now */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)] gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleSaveClick(e, challenge.id)}
                      title="Save Challenge to Bookmarks"
                      className={`flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-full p-2.5 text-[var(--text-muted)] transition-all hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 cursor-pointer ${
                        challenge.isBookmarked
                          ? 'bg-[var(--color-primary)]/15 border-[var(--color-primary)] text-[var(--color-primary)]'
                          : ''
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${challenge.isBookmarked ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleShareClick(e, challenge)}
                      title="Share Challenge Link"
                      className="flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-full p-2.5 text-[var(--text-muted)] transition-all hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-[var(--text-muted)] hidden sm:inline">
                      {challenge.views || 1420} views
                    </span>
                    {isAccepted ? (
                      <button
                        type="button"
                        onClick={(e) => handleOpenWorkspace(e, challenge.id)}
                        className="flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-[12px] px-[22px] py-[12px] transition-all hover:-translate-y-[1px] hover:shadow-[0_6px_18px_rgba(16,185,129,0.22)] border-none cursor-pointer text-xs"
                      >
                        <span>Enter Workspace</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    ) : isPending ? (
                      <button
                        type="button"
                        disabled
                        className="flex items-center justify-center gap-2 bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-strong)] font-bold rounded-[12px] px-[22px] py-[12px] cursor-not-allowed text-xs"
                      >
                        <span>Application Pending</span>
                      </button>
                    ) : isRejected ? (
                      <button
                        type="button"
                        disabled
                        className="flex items-center justify-center gap-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold rounded-[12px] px-[22px] py-[12px] cursor-not-allowed text-xs"
                      >
                        <span>Application Rejected</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleApplyClick(e, challenge)}
                        className="flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-[12px] px-[22px] py-[12px] transition-all hover:-translate-y-[1px] hover:shadow-[0_6px_18px_rgba(124,58,237,0.22)] border-none cursor-pointer text-xs"
                      >
                        <span>Apply Now</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="p-14 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-strong)] text-center shadow-md max-w-2xl mx-auto">
            <Trophy className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-4" />
            <h3 className="text-xl font-bold text-[var(--text-strong)] mb-2">No challenges match your criteria</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">Try resetting your filter parameters or searching for keywords like "AI", "React", or "Climate".</p>
            <button onClick={() => dispatch(resetFilters())} className="flex items-center justify-center mx-auto gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold rounded-[12px] px-7 py-3 transition-all hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(124,58,237,0.25)] cursor-pointer border-none text-xs">
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Interactive Application Modal */}
      <ApplicationFormModal
        challenge={selectedChallengeForModal}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </DashboardLayout>
  );
}

export default DiscoverProjectsPage;
