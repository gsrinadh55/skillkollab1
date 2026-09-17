import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BadgeCheck, 
  Sparkles, 
  BriefcaseBusiness, 
  Globe2, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  ShieldAlert,
  Flame,
  Award
} from 'lucide-react';

export function HeroSection() {
  const badgeItems = [
    { icon: BadgeCheck, label: 'Verified Challenges' },
    { icon: Sparkles, label: 'AI Team Matching' },
    { icon: BriefcaseBusiness, label: 'Portfolio Ready' },
    { icon: Globe2, label: 'SDG Projects' },
  ];

  return (
    <section className="relative pt-28 pb-24 md:pt-36 md:pb-32 overflow-hidden bg-[var(--bg-main)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Messaging & Actions */}
          <motion.div 
            className="lg:col-span-6 z-10 flex flex-col items-start text-left"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[#7C3AED] text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
              <Sparkles size={14} />
              <span>Real-World Innovation Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-strong)] leading-[1.08] mb-6">
              Bridge Students with <br />
              <span className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">Real-World Innovation.</span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--text-secondary)] font-normal leading-relaxed max-w-xl mb-9">
              SkillKollab connects innovators with startups, industries, researchers, NGOs, and colleges to solve verified real-world challenges.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-12 w-full sm:w-auto">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-base px-8 py-3.5 rounded-full transition-all shadow-lg shadow-[#7C3AED]/25 w-full sm:w-auto">
                Start Building
                <ArrowRight size={18} />
              </Link>
              <a href="#marketplace" className="inline-flex items-center justify-center bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--text-strong)] border border-[var(--border-strong)] font-bold text-base px-8 py-3.5 rounded-full transition-colors shadow-sm w-full sm:w-auto text-center">
                Explore Challenges
              </a>
            </div>

            {/* Small Trust Badges */}
            <div className="w-full pt-6 border-t border-[#E5E7EB]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
                Powered by next-generation primitives
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {badgeItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={idx} 
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-strong)] transition-all duration-200 hover:border-[var(--color-primary)] shadow-sm"
                    >
                      <Icon size={15} className="text-[#06B6D4]" />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Animated Interactive Dashboard Illustration */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[500px] sm:min-h-[540px] lg:min-h-[580px] w-full">
            
            {/* Background Gradient Animation */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 sm:w-[26rem] sm:h-[26rem] rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#06B6D4] opacity-15 blur-[90px] animate-pulse-glow" />
            </div>

            {/* Core Illustration Wrapper */}
            <div className="relative w-full max-w-lg lg:max-w-none h-full flex items-center justify-center">
              
              {/* Central Glowing Hub Card / Mesh Backplate */}
              <motion.div 
                className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-[28px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(124,58,237,0.1)] relative z-10 overflow-hidden transition-colors"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center justify-between pb-5 border-b border-[#E5E7EB] mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-semibold tracking-wider uppercase text-[var(--text-muted)]">Live Collaboration Workspace</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F3E8FF] flex items-center justify-center text-[#7C3AED] font-bold">
                        AI
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--text-strong)]">Autonomous Medical Diagnoser</h4>
                        <p className="text-xs text-[var(--text-secondary)]">Published by BioPulse Labs • 4 Weeks</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#ECFEFF] text-[#06B6D4] border border-[#A5F3FC]">Active</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#ECFEFF] flex items-center justify-center text-[#06B6D4] font-bold">
                        SDG
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--text-strong)]">Smart Micro-Grid IoT Controller</h4>
                        <p className="text-xs text-[var(--text-secondary)]">SDG 7: Clean Energy • 98% Match</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE]">$3.5K Grant</span>
                  </div>
                </div>

                {/* Progress Bar Mock */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-[#64748B]">
                    <span>Sprint 2: Zero-Knowledge Validation</span>
                    <span className="text-[#06B6D4] font-bold">84% Completed</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full w-[84%]" />
                  </div>
                </div>
              </motion.div>

              {/* Floating Challenge Card (Top Left) */}
              <motion.div 
                className="absolute -top-6 -left-4 sm:-left-8 z-20 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-[0_12px_30px_rgba(124,58,237,0.12)] max-w-[240px] w-full"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: [0, -10, 0], opacity: 1 }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", opacity: { duration: 0.5 } }}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <Flame size={18} className="text-amber-400 shrink-0" />
                  <span className="text-xs font-bold uppercase text-amber-500 tracking-wider">Challenge Verified</span>
                </div>
                <h5 className="text-sm font-bold text-[var(--text-strong)] leading-snug mb-1">Carbon Capture AI Monitor</h5>
                <p className="text-xs text-[var(--text-secondary)] mb-2">EcoTech Foundation • SDG 13</p>
                <div className="flex items-center justify-between text-xs font-semibold text-[#06B6D4]">
                  <span>Reward: $5,000 + Coop</span>
                  <BadgeCheck size={16} />
                </div>
              </motion.div>

              {/* Floating Team Card (Top Right) */}
              <motion.div 
                className="absolute -top-10 -right-4 sm:-right-8 z-20 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-[0_12px_30px_rgba(124,58,237,0.12)] max-w-[220px] w-full"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: [0, 12, 0], opacity: 1 }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5, opacity: { duration: 0.5 } }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--text-strong)]">AI Team Matched</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">99% Fit</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-3">4 Innovators combined across Stanford & MIT</p>
                <div className="flex items-center -space-x-2 overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-[#7C3AED] border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">AL</div>
                  <div className="w-7 h-7 rounded-full bg-[#0ea5e9] border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">RM</div>
                  <div className="w-7 h-7 rounded-full bg-[#14b8a6] border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">JK</div>
                  <div className="w-7 h-7 rounded-full bg-[#f59e0b] border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">+1</div>
                </div>
              </motion.div>

              {/* Floating Progress Card (Bottom Left) */}
              <motion.div 
                className="absolute -bottom-6 -left-4 sm:-left-6 z-20 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-[0_12px_30px_rgba(124,58,237,0.12)] max-w-[230px] w-full"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: [0, 8, 0], opacity: 1 }}
                transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1, opacity: { duration: 0.5 } }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <CheckCircle2 size={16} className="text-[#10B981]" />
                  <span className="text-xs font-bold text-[var(--text-strong)]">Milestone Shipped</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">Production Architecture deployed to testnet</p>
              </motion.div>

              {/* Floating Portfolio Card (Bottom Right) */}
              <motion.div 
                className="absolute -bottom-8 -right-4 sm:-right-8 z-20 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-[0_12px_30px_rgba(124,58,237,0.12)] max-w-[230px] w-full"
                initial={{ y: -15, opacity: 0 }}
                animate={{ y: [0, -10, 0], opacity: 1 }}
                transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut", delay: 1.5, opacity: { duration: 0.5 } }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Award size={18} className="text-[#7C3AED]" />
                  <span className="text-xs font-bold text-[var(--text-strong)]">Portfolio Awarded</span>
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed">
                  Verified Industry Contribution Badge added to public builder identity.
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
export default HeroSection;
