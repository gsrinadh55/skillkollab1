import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';
import { 
  Building2, Sparkles, Users, Award, DollarSign, ShieldCheck, 
  ArrowUpRight, Globe, TrendingUp, CheckCircle2, Briefcase, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const COHORT_OUTPUT_DATA = [
  { department: 'Computer Science', activeSprints: 12, completedSolutions: 24 },
  { department: 'AI & Robotics Lab', activeSprints: 18, completedSolutions: 31 },
  { department: 'CleanTech Incubator', activeSprints: 8, completedSolutions: 15 },
  { department: 'BioTech Research', activeSprints: 10, completedSolutions: 19 },
];

export function OrganizationDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateCohort = () => {
    toast.success('Opening Institutional Challenge Creator...');
    navigate('/create-project');
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-12 animate-pulse">
        <div className="h-52 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)]" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]" />
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
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[var(--bg-card)] via-[rgba(16,185,129,0.12)] to-[var(--bg-card)] border border-emerald-500/40 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              🏢 Enterprise & University Hub
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-strong)] tracking-tight mb-3">
            Institutional Innovation & Grant Ecosystem
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base font-normal leading-relaxed">
            Manage multi-disciplinary problem statements, evaluate verified student solutions, and allocate R&D stipends across top academic accelerator departments.
          </p>
        </div>
        <div className="flex sm:flex-col gap-3 z-10 w-full sm:w-auto">
          <button 
            onClick={handleCreateCohort}
            className="btn-sk-primary whitespace-nowrap px-7 py-3.5 font-bold text-sm bg-gradient-to-r from-emerald-500 to-[var(--color-secondary)] shadow-md cursor-pointer hover:scale-105 transition-transform"
          >
            <Sparkles className="w-4 h-4" /> Publish Institutional Grant
          </button>
          <button 
            onClick={() => navigate('/discover')}
            className="btn-sk-secondary whitespace-nowrap px-6 py-3 font-semibold text-sm cursor-pointer hover:scale-105 transition-transform"
          >
            Explore Student Portfolio Deck
          </button>
        </div>
      </div>

      {/* Institutional KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Active R&D Grant Pool', value: '$124,500', sub: 'Allocated across 8 sprints', icon: DollarSign, text: 'text-emerald-400' },
          { label: 'Verified Student Builders', value: '184 Innovators', sub: 'Top 1% evaluated talent', icon: Users, text: 'text-[var(--color-secondary)]' },
          { label: 'Published Challenges', value: '14 Challenges', sub: '92% completion velocity', icon: Building2, text: 'text-[var(--color-primary)]' },
          { label: 'SDG Impact Rating', value: 'AAA+ Tier', sub: 'United Nations aligned goals', icon: Globe, text: 'text-[var(--text-accent)]' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div 
              key={idx} 
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl sk-glass-card border border-[var(--border-strong)] shadow-md flex flex-col justify-between relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{item.label}</span>
                <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <Icon className="w-5 h-5 text-[var(--color-secondary)]" />
                </div>
              </div>
              <p className={`text-3xl font-extrabold mt-4 mb-1 ${item.text}`}>{item.value}</p>
              <span className="text-xs font-medium text-[var(--text-secondary)]">{item.sub}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Main Graph & Department Output */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Left 2 Columns: Bar Chart of Department Sprints */}
        <div className="lg:col-span-2 sk-glass-card p-7 border border-[var(--border-strong)] shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
            <div>
              <h2 className="text-lg font-extrabold text-[var(--text-strong)] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> Academic & Industrial Department Velocity
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">Active problem solutions vs completed verifications per division.</p>
            </div>
            <span className="sk-badge-primary text-xs font-bold self-start sm:self-auto">
              Q3 2026 Academic Quarter
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COHORT_OUTPUT_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="department" stroke="var(--text-muted)" tick={{ fontSize: 11 }} axisLine={false} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)', borderRadius: '12px', color: 'var(--text-strong)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="activeSprints" name="Active Sprints" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completedSolutions" name="Completed Solutions" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Sponsored Challenges Summary */}
        <div className="sk-glass-card p-7 border border-[var(--border-strong)] shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--text-strong)] pb-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <span>Live Grant Sprints</span>
              <span className="text-xs font-mono text-[var(--text-muted)]">3 Active</span>
            </h3>
            <div className="space-y-4 pt-4">
              {[
                { title: 'AI Climate Carbon Verification', grant: '$25,000 Grant', team: 'MIT CleanTech Lab', status: 'In Review' },
                { title: 'Zero-Knowledge Med-Tech DB', grant: '$40,000 Stipend', team: 'Stanford AI Venture', status: 'Active' },
                { title: 'Autonomous Micro-Drone Vision', grant: '$15,000 Equity', team: 'Cornell Robotics', status: 'Completed' }
              ].map((sprint, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[var(--text-strong)] truncate max-w-[180px]">{sprint.title}</span>
                    <span className="text-[11px] font-bold text-emerald-400 font-mono">{sprint.grant}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                    <span>Team: {sprint.team}</span>
                    <span className="sk-badge-secondary text-[9px]">{sprint.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => navigate('/organization/challenges')}
            className="w-full mt-6 py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-strong)] rounded-xl text-xs font-bold text-[var(--text-strong)] transition-colors cursor-pointer"
          >
            Inspect All Sponsored Challenges
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default OrganizationDashboard;
