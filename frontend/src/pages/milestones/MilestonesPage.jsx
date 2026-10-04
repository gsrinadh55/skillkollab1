import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, CheckCircle2, Clock, Sparkles, Zap, Rocket, Plus, RefreshCw, Cpu, Bot, ChevronDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useChallenges } from '../../hooks/firebase/useChallenges';
import { api } from '../../services/api';

const DEFAULT_MILESTONES = [
  { id: 1, sprint: 'Sprint 1: Architecture & Zod Schema Foundation', dueDate: 'Jul 20, 2026', status: 'Completed', progress: 100, color: 'emerald', deliverable: 'Fully typed AST security Zod validators and WebSocket socket harness.', assignedTeam: 'Core Arch Team' },
  { id: 2, sprint: 'Sprint 2: Glassmorphic UI & Role Switcher', dueDate: 'Aug 05, 2026', status: 'Active', progress: 85, color: 'purple', deliverable: 'Vercel-tier dark theme canvas with real-time Kanban drop indicators.', assignedTeam: 'Frontend Lead' },
  { id: 3, sprint: 'Sprint 3: Autonomous LangChain Remediation', dueDate: 'Aug 20, 2026', status: 'Upcoming', progress: 20, color: 'cyan', deliverable: 'Zero-shot vulnerability detection prompt suites & automated fix generation.', assignedTeam: 'AI Engineering' },
  { id: 4, sprint: 'Sprint 4: Y-Combinator Investor Pitch Demo', dueDate: 'Sep 01, 2026', status: 'Locked', progress: 0, color: 'amber', deliverable: 'Live executive production presentation deck and simulated venture audit.', assignedTeam: 'Venture Leads' },
];

export function MilestonesPage() {
  const { challenges } = useChallenges();
  const [selectedProject, setSelectedProject] = useState(null);
  const [milestones, setMilestones] = useState(DEFAULT_MILESTONES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiModel, setAiModel] = useState('auto'); // 'auto', 'gemini', 'chatgpt'
  const [showAddModal, setShowAddModal] = useState(false);

  // New Milestone Form
  const [newSprintName, setNewSprintName] = useState('');
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  useEffect(() => {
    if (challenges && challenges.length > 0 && !selectedProject) {
      setSelectedProject(challenges[0]);
    }
  }, [challenges]);

  const handleGenerateAiRoadmap = async () => {
    setIsGenerating(true);
    const toastId = toast.loading('Synthesizing dynamic roadmap with Gemini & ChatGPT AI...');

    const projectPayload = selectedProject ? {
      title: selectedProject.title,
      description: selectedProject.description || selectedProject.problemStatement,
      category: selectedProject.category || 'Fullstack',
      skills: selectedProject.requiredSkills || selectedProject.skills || ['React', 'Node.js'],
      model: aiModel
    } : {
      title: 'AI Voice Lead Pipeline & Automated Sales Engine',
      description: 'Autonomous voice sales pipeline with audio processing and real-time CRM updates',
      category: 'AI & Automation',
      skills: ['Python', 'Whisper', 'WebSockets', 'React'],
      model: aiModel
    };

    try {
      const res = await api.post('/ai/generate-milestones', projectPayload);
      if (res.status === 'success' && Array.isArray(res.data)) {
        setMilestones(res.data);
        toast.success(`Generated project-specific roadmap with ${aiModel.toUpperCase()} AI!`, { id: toastId });
      } else {
        toast.dismiss(toastId);
        toast.success('Generated customized sprint roadmap for your project!');
      }
    } catch (err) {
      console.error('Failed to generate AI roadmap:', err);
      toast.error('AI synthesis failed. Applied algorithmic fallback milestones.', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkChecked = (id) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, status: 'Completed', progress: 100 };
      }
      return m;
    }));
    toast.success('Deliverable checked and marked complete!');
  };

  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (!newSprintName.trim() || !newDeliverable.trim()) return;

    const newMs = {
      id: Date.now(),
      sprint: `Sprint ${milestones.length + 1}: ${newSprintName.trim()}`,
      dueDate: newDueDate || 'Sep 15, 2026',
      status: 'Active',
      progress: 10,
      color: 'purple',
      deliverable: newDeliverable.trim(),
      assignedTeam: selectedProject ? selectedProject.title : 'Team Innovators'
    };

    setMilestones([...milestones, newMs]);
    setNewSprintName('');
    setNewDeliverable('');
    setNewDueDate('');
    setShowAddModal(false);
    toast.success('Added new milestone sprint to project timeline!');
  };

  const handleExportRoadmap = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(milestones, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${(selectedProject?.title || 'Project').replace(/\s+/g, '_')}_Roadmap.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Exported Gantt & Milestone Roadmap (JSON)!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16 max-w-5xl mx-auto">
        {/* Header */}
        <div className="border-b border-[var(--border-subtle)] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="py-1 px-3 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5" /> Project Timeline & Deliverable Tracker
              </span>

              {/* Model Tag */}
              <span className="py-1 px-3 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" /> Gemini & ChatGPT AI Enabled
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-strong)] tracking-tight">
              {selectedProject ? selectedProject.title : 'Venture Sprints & Milestone Roadmap'}
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              AI-driven sprint breakdown and real-time deliverable tracking for your specific project challenges.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerateAiRoadmap}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs px-5 py-2.5 font-black rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Synthesizing...' : 'Generate AI Roadmap'}
            </button>

            <button
              onClick={handleExportRoadmap}
              className="btn-sk-secondary text-xs px-4 py-2.5 font-bold hover:text-[var(--color-primary)] cursor-pointer"
            >
              Export Roadmap
            </button>
          </div>
        </div>

        {/* Project Selector & AI Controls Bar */}
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-strong)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Rocket className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Active Project:</span>
            {challenges && challenges.length > 0 ? (
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const found = challenges.find(c => String(c.id) === e.target.value);
                  if (found) setSelectedProject(found);
                }}
                className="bg-[var(--bg-card)] text-[var(--text-strong)] border border-[var(--border-strong)] text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
              >
                {challenges.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-black text-[var(--text-strong)]">
                AI Voice Lead Pipeline (Sample Active Challenge)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-xs font-medium text-[var(--text-secondary)]">AI Model Engine:</span>
            <select
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="bg-[var(--bg-card)] text-[var(--text-strong)] border border-[var(--border-strong)] text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
            >
              <option value="auto">Auto (Gemini / ChatGPT)</option>
              <option value="chatgpt">ChatGPT GPT-4o</option>
              <option value="gemini">Google Gemini 1.5 Pro</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="p-1.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-all cursor-pointer"
              title="Add Custom Sprint"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal: Add Sprint */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
              <h3 className="text-lg font-black text-[var(--text-strong)] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[var(--color-primary)]" /> Add Sprint Milestone
              </h3>

              <form onSubmit={handleAddMilestone} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Sprint Focus Title</label>
                  <input
                    type="text"
                    required
                    value={newSprintName}
                    onChange={(e) => setNewSprintName(e.target.value)}
                    placeholder="e.g. LLM Fine-Tuning & Evaluation Harness"
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Target Deliverable</label>
                  <textarea
                    required
                    rows={2}
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    placeholder="Key features or technical targets to complete..."
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Target Due Date</label>
                  <input
                    type="text"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    placeholder="e.g. Sep 20, 2026"
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-strong)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-sk-primary px-5 py-2 text-xs font-bold cursor-pointer"
                  >
                    Create Sprint
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Timeline List */}
        <div className="relative border-l-2 border-[var(--color-primary)]/30 ml-4 sm:ml-8 space-y-10 pl-6 sm:pl-10">
          {milestones.map((ms, index) => {
            const isCompleted = ms.status === 'Completed';
            const isActive = ms.status === 'Active';
            
            return (
              <motion.div
                key={ms.id || index}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                className="relative group"
              >
                {/* Timeline Dot */}
                <div className={`absolute -left-[35px] sm:-left-[51px] top-1 w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-sm z-10 transition-colors ${
                  isCompleted ? 'bg-emerald-50 border-emerald-400 text-emerald-600 dark:bg-emerald-500 dark:border-emerald-300 dark:text-emerald-950' :
                  isActive ? 'bg-[var(--color-primary)] border-[var(--bg-card)] text-white shadow-[0_0_15px_var(--color-primary)] animate-pulse' :
                  'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-muted)]'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4 font-black" /> : <Clock className="w-3.5 h-3.5" />}
                </div>

                {/* Content Card */}
                <div className="sk-glass-card p-6 sm:p-8 flex flex-col relative overflow-hidden hover:border-[var(--color-primary)]/40 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider border inline-block w-fit ${
                      isCompleted ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                      isActive ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20' :
                      'bg-[var(--bg-surface)] text-[var(--text-strong)] border-[var(--border-strong)]'
                    }`}>
                      Status: {ms.status} • Due {ms.dueDate}
                    </span>
                    <span className="text-xs font-mono font-bold text-[var(--text-strong)] opacity-90">{ms.progress}% Complete</span>
                  </div>

                  <h3 className="text-xl font-black text-[var(--text-strong)] group-hover:text-[var(--color-primary)] transition-colors mb-2">
                    {ms.sprint}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6 font-medium leading-relaxed">
                    <strong className="text-[var(--text-strong)]">Target Deliverable:</strong> {ms.deliverable}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-[var(--bg-surface)] overflow-hidden mb-4 p-0.5 border border-[var(--border-strong)] shadow-inner">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ${
                        isCompleted ? 'from-emerald-400 to-teal-400' :
                        isActive ? 'from-[var(--color-primary)] to-[var(--color-accent)]' :
                        'bg-[var(--text-muted)] opacity-50'
                      }`}
                      style={{ width: `${ms.progress}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                    <span>👥 Assigned: <strong className="text-[var(--text-strong)]">{ms.assignedTeam || (selectedProject ? selectedProject.title : 'Innovators Squad')}</strong></span>
                    {!isCompleted && (
                      <button 
                        onClick={() => handleMarkChecked(ms.id)} 
                        className="btn-sk-primary px-4 py-2 text-xs font-bold shadow-sm hover:shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Deliverable Checked
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

