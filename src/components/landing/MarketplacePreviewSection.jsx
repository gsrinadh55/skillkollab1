import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Globe, Clock, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { challengesService } from '../../services/firebase/challenges';

const challengeFilters = [
  'All',
  'AI',
  'Healthcare',
  'Climate',
  'FinTech',
  'Education',
  'IoT',
  'Cyber Security',
  'Blockchain',
];

export function MarketplacePreviewSection() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const { list: applications } = useSelector((state) => state.applications || { list: [] });
  const { activeRole, isAuthenticated } = useSelector((state) => state.auth || { activeRole: null, isAuthenticated: false });

  useEffect(() => {
    async function fetchChallenges() {
      try {
        const data = await challengesService.getPublishedChallenges();
        setChallenges(data.slice(0, 6)); // Only show top 6 for preview
      } catch (error) {
        console.error('Error fetching marketplace challenges:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchChallenges();
  }, []);

  const filteredChallenges = challenges.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="marketplace" className="py-24 bg-[var(--bg-main)] relative overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Globe size={14} />
            <span>Marketplace</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-strong)] mb-4">
            Explore Verified Challenges
          </h2>
          <p className="text-[var(--text-secondary)] text-sm md:text-base">
            Browse through real-world problems published by our industry partners. Find the right challenge and start building your track record.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-[var(--text-muted)]" size={20} />
            <input
              type="text"
              placeholder="Search challenges by keywords, skills, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-strong)] text-sm text-[var(--text-strong)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 text-xs text-[var(--text-muted)] hover:text-[var(--text-strong)] font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-14">
          {challengeFilters.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'bg-[var(--color-primary)] text-white shadow-md border-transparent'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-strong)] hover:border-[var(--color-primary)]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 6 Premium Challenge Cards Grid */}
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="sk-glass-card p-6 sm:p-7 min-h-[340px] sk-skeleton" />
              ))}
            </div>
          ) : filteredChallenges.length === 0 ? (
            <motion.div 
              className="text-center py-16 bg-[var(--bg-card)] border border-[var(--border-subtle)] p-8 rounded-2xl max-w-lg mx-auto shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Zap size={36} className="mx-auto text-[var(--text-muted)] mb-3" />
              <h4 className="text-lg font-bold text-[var(--text-strong)]">No Challenges Matched</h4>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Try adjusting your search criteria or filter categories.</p>
              <button
                type="button"
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="mt-5 text-xs font-bold text-[var(--color-primary)] hover:underline"
              >
                Reset All Filters
              </button>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              layout
            >
              {filteredChallenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="bg-[var(--bg-card)] p-6 sm:p-7 flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--color-primary)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div>
                    {/* Top Row: Logo + Company Name + Difficulty Badge */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--color-primary)] font-bold text-sm flex items-center justify-center shadow-sm`}>
                          {challenge.logo || challenge.company?.substring(0, 2).toUpperCase() || 'CX'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-[var(--text-strong)]">{challenge.company}</h4>
                            <ShieldCheck size={14} className="text-[#10B981]" title="Verified Organization" />
                          </div>
                          <span className="text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-wider">{challenge.category}</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${challenge.difficultyColor}`}>
                        {challenge.difficulty}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-[var(--text-strong)] leading-snug mb-4 group-hover:text-[var(--color-primary)] transition-colors">
                      {challenge.title}
                    </h3>

                    {/* Reward & SDG */}
                    <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] mb-5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[var(--text-secondary)]">Reward</span>
                        <span className="text-[#06B6D4] font-bold">{challenge.reward}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium pt-2 border-t border-[var(--border-subtle)]">
                        <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                          <Globe size={13} className="text-[var(--color-primary)]" />
                          <span>Impact Focus</span>
                        </span>
                        <span className="text-[var(--text-strong)] font-bold text-[11px] truncate max-w-[120px]">{challenge.sdg}</span>
                      </div>
                    </div>

                    {/* Skills Required */}
                    <div className="mb-6">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Required Skills</span>
                      <div className="flex flex-wrap gap-1.5">
                        {challenge.skills?.slice(0, 4).map((skill) => (
                          <span 
                            key={skill} 
                            className="px-2.5 py-1 rounded-md bg-[var(--bg-surface)] text-[var(--text-secondary)] text-xs font-medium border border-[var(--border-strong)]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer: Duration + Apply Button */}
                  <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                      <Clock size={15} />
                      <span>{challenge.duration}</span>
                    </div>

                    {(() => {
                      const chId = `ch-${challenge.id}`;
                      const userApp = isAuthenticated ? applications.find(a => a.challengeId === chId || (chId === 'ch-1' && a.id === 'my-app-1')) : null;
                      const isAccepted = isAuthenticated && (activeRole === 'INNOVATION_LEAD' || userApp?.status === 'Accepted');
                      const isPending = isAuthenticated && userApp?.status === 'Pending';
                      const isRejected = isAuthenticated && userApp?.status === 'Rejected';

                      if (isAccepted) {
                        return (
                          <Link
                            to={`/projects/${chId}/workspace`}
                            className="px-5 py-2 rounded-full bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-white transition-all duration-200 inline-flex items-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.25)]"
                          >
                            <span>Workspace</span>
                            <ArrowRight size={13} />
                          </Link>
                        );
                      }
                      if (isPending) {
                        return (
                          <button
                            disabled
                            className="px-5 py-2 rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-strong)] text-xs font-bold cursor-not-allowed inline-flex items-center gap-1.5"
                          >
                            <span>Pending</span>
                          </button>
                        );
                      }
                      if (isRejected) {
                        return (
                          <button
                            disabled
                            className="px-5 py-2 rounded-full bg-red-500/10 text-[#EF4444] border border-red-500/20 text-xs font-bold cursor-not-allowed inline-flex items-center gap-1.5"
                          >
                            <span>Rejected</span>
                          </button>
                        );
                      }
                      return (
                        <Link
                          to={`/projects/${challenge.id}?action=apply`}
                          className="px-5 py-2 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-all duration-200 inline-flex items-center gap-1.5 shadow-[0_4px_12px_rgba(124,58,237,0.25)]"
                        >
                          <span>Apply Now</span>
                          <ArrowRight size={13} />
                        </Link>
                      );
                    })()}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* View All Action */}
        <div className="text-center mt-16">
          <Link 
            to="/discover" 
            className="inline-flex items-center justify-center gap-2 bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--text-strong)] border border-[var(--border-strong)] font-bold text-sm px-8 py-3.5 rounded-full transition-colors shadow-sm"
          >
            <span>Explore All 250+ Live Challenges</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
export default MarketplacePreviewSection;
