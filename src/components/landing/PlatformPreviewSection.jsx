import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Building2, 
  PlusCircle, 
  CheckCircle2, 
  TrendingUp, 
  BarChart3, 
  Sparkles,
  ArrowRight,
  UserCheck,
  Award
} from 'lucide-react';

const tabs = [
  { id: 'lead', label: 'Innovation Lead', icon: LayoutDashboard, description: 'Manage teams, define milestones, and oversee sprint progress.' },
  { id: 'contributor', label: 'Contributor', icon: Users, description: 'Find matched projects, submit solutions, and build public portfolios.' },
  { id: 'organization', label: 'Organization', icon: Building2, description: 'Publish verified problems, review talent, and track R&D analytics.' },
];

export function PlatformPreviewSection() {
  const [activeTab, setActiveTab] = useState('lead');

  return (
    <section id="platform-preview" className="py-24 sm:py-32 relative z-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.h2 
            className="text-xs font-bold uppercase tracking-widest text-[#7C3AED] mb-3"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Role-Aware Architecture
          </motion.h2>
          <motion.p 
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#172033] tracking-tight leading-tight mb-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Platform Preview
          </motion.p>
          <p className="text-base text-[#64748B]">
            Tailored interfaces engineered specifically for each stakeholder in the real-world innovation ecosystem.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 rounded-2xl bg-white border border-[#E5E7EB] gap-1 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    isSelected ? 'text-white' : 'text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="platformTabIndicator"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] shadow-[0_4px_12px_rgba(124,58,237,0.25)]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon size={18} className="relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dashboard Preview Box with Animation */}
        <div className="w-full rounded-[28px] bg-[#F8FAFC] border border-[#E5E7EB] p-6 sm:p-10 shadow-xl relative overflow-hidden min-h-[500px]">
          
          {/* Top Bar inside Dashboard */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB] mb-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm" />
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-sm" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#10B981] shadow-sm" />
              </div>
              <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider pl-4 border-l border-[#E5E7EB]">
                {tabs.find(t => t.id === activeTab)?.label} Workspace
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-bold bg-[#ECFDF5] text-[#10B981] rounded-full border border-[#A7F3D0]">Real-Time Sync Active</span>
              <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center text-xs font-extrabold text-white shadow-sm">
                SK
              </div>
            </div>
          </div>

          {/* Animated Tab Content Switcher */}
          <AnimatePresence mode="wait">
            
            {activeTab === 'lead' && (
              <motion.div
                key="lead"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* 4 Feature Cards for Innovation Lead */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] space-y-3 shadow-sm hover:border-[#7C3AED]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Create Challenge</span>
                      <PlusCircle size={20} className="text-[#7C3AED]" />
                    </div>
                    <p className="text-xl font-extrabold text-[#172033]">Drafting Mode</p>
                    <p className="text-xs text-[#64748B]">Define problem scope, milestones, and reward allocation.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] space-y-3 shadow-sm hover:border-[#7C3AED]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Applications</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F3E8FF] text-[#7C3AED]">18 Pending</span>
                    </div>
                    <p className="text-xl font-extrabold text-[#172033]">Applicant Pool</p>
                    <p className="text-xs text-[#64748B]">AI analyzed candidate skill match and github credibility.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] space-y-3 shadow-sm hover:border-[#7C3AED]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Team Status</span>
                      <Users size={20} className="text-[#10B981]" />
                    </div>
                    <p className="text-xl font-extrabold text-[#172033]">4 Active Innovators</p>
                    <p className="text-xs text-[#64748B]">Collaborating in Sprint 2 with 98% task velocity.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] space-y-3 shadow-sm hover:border-[#7C3AED]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Progress</span>
                      <TrendingUp size={20} className="text-[#06B6D4]" />
                    </div>
                    <p className="text-xl font-extrabold text-[#172033]">Milestone 2 of 4</p>
                    <p className="text-xs text-[#64748B]">Next review scheduled with Organization mentors in 3 days.</p>
                  </div>
                </div>

                {/* Simulated Activity Stream */}
                <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
                  <h4 className="text-sm font-bold text-[#172033] mb-4 flex items-center gap-2">
                    <Sparkles size={16} className="text-[#7C3AED]" />
                    <span>Active Sprint Deliverables</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-[#10B981]" />
                        <span className="text-sm font-medium text-[#172033]">Implement zero-knowledge authentication verification layer</span>
                      </div>
                      <span className="text-xs font-bold text-[#10B981]">Completed & Verified</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
                      <div className="flex items-center gap-3">
                        <div className="w-4.5 h-4.5 rounded-full border-2 border-t-[#06B6D4] border-r-[#06B6D4] border-b-[#E2E8F0] border-l-[#E2E8F0] animate-spin" />
                        <span className="text-sm font-medium text-[#172033]">Optimize telemetry processing speed for IoT edge nodes</span>
                      </div>
                      <span className="text-xs font-bold text-[#06B6D4]">In Progress (85%)</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'contributor' && (
              <motion.div
                key="contributor"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* 4 Feature Cards for Contributor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] space-y-3 shadow-sm hover:border-[#7C3AED]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Recommended</span>
                      <Sparkles size={20} className="text-[#06B6D4]" />
                    </div>
                    <p className="text-xl font-extrabold text-[#172033]">14 Matched Bounties</p>
                    <p className="text-xs text-[#64748B]">Curated by AI based on your React and Python proficiency.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] space-y-3 shadow-sm hover:border-[#7C3AED]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Applications</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#3B82F6]">3 Under Review</span>
                    </div>
                    <p className="text-xl font-extrabold text-[#172033]">Active Submissions</p>
                    <p className="text-xs text-[#64748B]">Awaiting final team match verification from Innovation Leads.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] space-y-3 shadow-sm hover:border-[#7C3AED]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase">My Teams</span>
                      <Users size={20} className="text-[#7C3AED]" />
                    </div>
                    <p className="text-xl font-extrabold text-[#172033]">EcoTech Climate Squad</p>
                    <p className="text-xs text-[#64748B]">Lead Frontend Contributor • Milestone 3 deploying this Friday.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] space-y-3 shadow-sm hover:border-[#7C3AED]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Portfolio</span>
                      <Award size={20} className="text-amber-500" />
                    </div>
                    <p className="text-xl font-extrabold text-[#172033]">5 Verified Shipped</p>
                    <p className="text-xs text-[#64748B]">Public credential profile updated with confirmed company praise.</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
                  <h4 className="text-sm font-bold text-[#172033] mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Briefcase size={16} className="text-[#06B6D4]" />
                      <span>My Verified Innovation Portfolio</span>
                    </span>
                    <span className="text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer">View Public Shareable URL</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-between hover:border-[#7C3AED]/30 transition-colors cursor-pointer">
                      <div>
                        <h5 className="text-sm font-bold text-[#172033]">AI Healthcare Triage Assistant</h5>
                        <p className="text-xs text-[#64748B]">Built for MediPulse Global • 100% Milestone Completion</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">Verified Badge</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-between hover:border-[#7C3AED]/30 transition-colors cursor-pointer">
                      <div>
                        <h5 className="text-sm font-bold text-[#172033]">Carbon Credit Ledger System</h5>
                        <p className="text-xs text-[#64748B]">Built for TeraCarbon Labs • Core Backend Contributor</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">Verified Badge</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'organization' && (
              <motion.div
                key="organization"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* 4 Feature Cards for Organization */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] space-y-3 shadow-sm hover:border-[#7C3AED]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Published Challenges</span>
                      <Building2 size={20} className="text-[#8B5CF6]" />
                    </div>
                    <p className="text-xl font-extrabold text-[#172033]">6 Active Bounties</p>
                    <p className="text-xs text-[#64748B]">Across AI, Clean Energy, and Cyber Security focus areas.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] space-y-3 shadow-sm hover:border-[#7C3AED]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Student Teams</span>
                      <UserCheck size={20} className="text-[#10B981]" />
                    </div>
                    <p className="text-xl font-extrabold text-[#172033]">24 Innovators Engaged</p>
                    <p className="text-xs text-[#64748B]">Pre-vetted university talent driving continuous R&D delivery.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] space-y-3 shadow-sm hover:border-[#7C3AED]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Analytics</span>
                      <BarChart3 size={20} className="text-[#06B6D4]" />
                    </div>
                    <p className="text-xl font-extrabold text-[#172033]">94.2% Sprint Velocity</p>
                    <p className="text-xs text-[#64748B]">Average milestone on-time delivery rate across active challenges.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] space-y-3 shadow-sm hover:border-[#7C3AED]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Top Contributors</span>
                      <Award size={20} className="text-[#7C3AED]" />
                    </div>
                    <p className="text-xl font-extrabold text-[#172033]">Talent Pipeline</p>
                    <p className="text-xs text-[#64748B]">Direct access to hire verified top-performing builders & team leads.</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
                  <h4 className="text-sm font-bold text-[#172033] mb-4 flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#10B981]" />
                    <span>Real-Time Team Progress Monitor</span>
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="text-sm font-bold text-[#172033]">Autonomous Multi-Agent Fact Verification Engine</h5>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F3E8FF] text-[#7C3AED]">Team Alpha (4 Members)</span>
                        </div>
                        <p className="text-xs text-[#64748B]">Milestone 3 Submitted for Verification • Review due by Friday</p>
                      </div>
                      <button className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-colors shadow-sm shrink-0">
                        Review Deliverable
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}
export default PlatformPreviewSection;
