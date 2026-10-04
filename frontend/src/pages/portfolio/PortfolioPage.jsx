import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Heart, MessageSquare, ExternalLink, FolderGit2, Sparkles, 
  Award, Star, Plus, Share2, Filter, Eye, ThumbsUp, CheckCircle2, ShieldCheck, Download 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { toggleLikeProject, addPortfolioProject } from '../../store/slices/portfolioSlice';

export function PortfolioPage() {
  const { list: projects } = useSelector((state) => state.portfolio);
  const dispatch = useDispatch();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMetrics, setNewMetrics] = useState('10k+ active concurrent users');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [search, setSearch] = useState('');

  const categories = ['All', 'AI & Web3', 'CleanTech', 'Developer Tools', 'FinTech'];

  const projectList = projects || [];
  const displayedProjects = projectList.filter(p => {
    const pCat = (p.category || '').toLowerCase();
    const selCat = selectedCategory.toLowerCase();
    const matchesCat = selectedCategory === 'All' || pCat.includes(selCat) || selCat.includes(pCat);
    
    const query = search.toLowerCase();
    const matchesSearch = !search || 
      (p.title && p.title.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query)) ||
      (p.skills && p.skills.some(s => s.toLowerCase().includes(query)));

    return matchesCat && matchesSearch;
  });

  const handleLike = (id) => {
    dispatch(toggleLikeProject(id));
    toast.success('Appreciation reaction updated!');
  };

  const handleShare = (p) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/portfolio/${p.id}`);
    }
    toast.success('Portfolio showcase link copied to clipboard!');
  };

  const handleDownloadPDF = () => {
    setDownloadingPdf(true);
    toast.loading('Generating printable PDF Portfolio brochure...', { id: 'pdf' });
    setTimeout(() => {
      setDownloadingPdf(false);
      toast.success('PDF Portfolio successfully compiled and ready for download!', { id: 'pdf' });
      window.print(); // Triggers browser native PDF print/save dialog
    }, 1200);
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    dispatch(addPortfolioProject({
      title: newTitle,
      role: 'Lead Innovation Specialist',
      category: newCategory,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      description: newDesc || 'Designed scalable microservice infrastructure and reactive Framer Motion animations.',
      outcomes: newMetrics,
      skills: ['React.js', 'Node.js', 'Tailwind', 'Docker'],
      rating: '5.0 ⭐ Verified Excellence'
    }));
    setShowAddModal(false);
    setNewTitle('');
    setNewDesc('');
    toast.success('🎉 Case study published to your global Behance-style showcase!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="sk-badge-primary text-xs flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Behance-Style Verified Showcase
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-strong)] tracking-tight">
              Innovative Venture Portfolio & Case Studies
            </h1>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base mt-1 max-w-3xl font-normal leading-relaxed">
              Showcase verified solutions built through collaborative SkillKollab sprints. Every project features verified owner ratings and real production metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="btn-sk-secondary group text-xs px-5 py-3 font-bold flex items-center gap-2 shadow-sm cursor-pointer hover:scale-105 hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/40 transition-all"
            >
              <Download className={`w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--color-primary)] ${downloadingPdf ? 'animate-bounce' : ''}`} />
              <span>{downloadingPdf ? 'Compiling PDF...' : 'Download as PDF'}</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn-sk-primary text-xs px-6 py-3 font-bold flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Publish New Case Study
            </button>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-[14px] bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search case studies..."
              className="w-full bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text-strong)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] shadow-sm"
            />
          </div>
        </div>

        {/* Portfolio Gallery Grid */}
        {displayedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedProjects.map((project, index) => (
              <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="sk-glass-card rounded-[18px] overflow-hidden border border-[var(--border-subtle)] hover:border-[var(--color-primary)]/40 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                {/* Banner Thumbnail */}
                <div className="h-56 relative bg-[var(--bg-surface)] rounded-t-[16px]">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-[16px]"
                  />
                  
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-900/85 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                    {project.category}
                  </span>

                  {/* Verified Owner Rating Badge */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5" /> {project.rating || '5.0 ⭐ Verified'}
                    </span>
                    <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-500/20 shadow-sm">
                      🏆 {project.role || 'Lead Contributor'}
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 space-y-3.5 bg-[var(--bg-card)]">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[var(--text-strong)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                      {project.title}
                    </h2>
                    <p className="text-xs text-[var(--color-primary)] font-semibold mt-0.5">{project.outcomes || 'Verified Production Metric'}</p>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3 font-normal">
                    {project.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(project.skills || ['React', 'Node.js', 'AI']).map((skill, i) => (
                      <span key={i} className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)] transition-colors cursor-pointer">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(project.id)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                      project.isLiked ? 'text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--color-primary)]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${project.isLiked ? 'fill-current text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'}`} />
                    <span>{project.likes || 142}</span>
                  </button>
                  <button onClick={() => toast.success('Open case study feedback discussions')} className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)] cursor-pointer transition-colors">
                    <MessageSquare className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--color-primary)]" />
                    <span>{project.comments || 18}</span>
                  </button>
                  <button onClick={() => handleShare(project)} title="Share Project" className="text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <a href={project.githubUrl || 'https://github.com'} target="_blank" rel="noreferrer" title="GitHub Repo" className="w-8 h-8 rounded-full bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-strong)] transition-colors">
                    <FolderGit2 className="w-4 h-4" />
                  </a>
                  <a href={project.liveUrl || '#'} target="_blank" rel="noreferrer" title="Live Preview" className="w-8 h-8 rounded-full bg-[var(--bg-card)] hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/40 text-[var(--text-secondary)] hover:text-[var(--color-primary)] border border-[var(--border-strong)] flex items-center justify-center transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-[var(--border-strong)] rounded-3xl bg-[var(--bg-surface)] space-y-4">
            <Briefcase className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-50" />
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-[var(--text-strong)]">No case studies found</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                {search ? `No projects match "${search}". Try clearing your search filter.` : `No projects found in category "${selectedCategory}".`}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-sk-primary text-xs px-5 py-2.5 font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Publish First Case Study
            </button>
          </div>
        )}

        {/* Modal for Publishing New Portfolio Case Study */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="sk-glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-strong)] max-w-lg w-full text-[var(--text-primary)] bg-[var(--bg-card)] space-y-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                  <h3 className="text-lg font-extrabold text-[var(--text-strong)] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[var(--color-secondary)]" /> Publish Verified Case Study
                  </h3>
                </div>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-strong)] mb-1">Project Title</label>
                    <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Autonomous NFT Escrow Protocol" className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-3 text-xs text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)]" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-strong)] mb-1">Category</label>
                      <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-3 text-xs text-[var(--text-strong)] focus:outline-none cursor-pointer">
                        <option value="AI & Web3">AI & Web3</option>
                        <option value="CleanTech">CleanTech</option>
                        <option value="Developer Tools">Developer Tools</option>
                        <option value="FinTech">FinTech</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-strong)] mb-1">Key Outcome Metric</label>
                      <input type="text" value={newMetrics} onChange={(e) => setNewMetrics(e.target.value)} placeholder="e.g. $12k Bounty Award" className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-3 text-xs text-[var(--text-strong)] focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-strong)] mb-1">Architecture & Technical Summary</label>
                    <textarea rows={3} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Describe the problem solved, team dynamics, and technical execution..." className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-3 text-xs text-[var(--text-strong)] focus:outline-none" />
                  </div>
                  <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
                    <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-full text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-strong)] cursor-pointer">Cancel</button>
                    <button type="submit" className="btn-sk-primary px-8 py-2.5 text-xs font-extrabold cursor-pointer">Publish Case Study</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

export default PortfolioPage;
