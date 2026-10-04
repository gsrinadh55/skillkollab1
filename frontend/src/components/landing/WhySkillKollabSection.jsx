import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Briefcase, Sparkles } from 'lucide-react';

const features = [
  {
    title: 'Verified Industry Challenges',
    description: 'Organizations publish real-world problems. No toy projects or fictitious assignments—build software that matters.',
    icon: ShieldCheck,
    badge: 'Real Problems',
    glowColor: 'rgba(109, 93, 246, 0.25)',
  },
  {
    title: 'AI Team Matching',
    description: 'Find teammates based on verified skills, velocity, and synergy instead of static keyword profiles.',
    icon: Cpu,
    badge: 'Smart Synergy',
    glowColor: 'rgba(168, 85, 247, 0.25)',
  },
  {
    title: 'Portfolio Generation',
    description: 'Every completed project automatically becomes a verified portfolio artifact directly tied to actual pull requests and milestones.',
    icon: Briefcase,
    badge: 'Verified Proof',
    glowColor: 'rgba(34, 211, 238, 0.25)',
  },
  {
    title: 'Impact Reputation',
    description: 'Students earn credibility and algorithmic ranking based on actual engineering contributions and shipped milestones.',
    icon: Sparkles,
    badge: 'Credibility Engine',
    glowColor: 'rgba(16, 185, 129, 0.25)',
  },
];

export function WhySkillKollabSection() {
  return (
    <section id="why-skillkollab" className="py-24 sm:py-32 relative z-10 bg-[var(--bg-main)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-3"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Competitive Edge
          </motion.h2>
          <motion.p 
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-strong)] tracking-tight leading-tight"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Why SkillKollab Stands Out
          </motion.p>
        </div>

        {/* 4 Feature Cards Grid with Hover Glow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                className="bg-[var(--bg-card)] p-8 sm:p-10 relative overflow-hidden group border border-[var(--border-subtle)] transition-all duration-300 rounded-2xl hover:border-[var(--color-primary)]/40 hover:shadow-lg"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -6 }}
              >
                {/* Subtle Radial Hover Glow inside card */}
                <div 
                  className="absolute -right-20 -top-20 w-60 h-60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-[60px]"
                  style={{ background: item.glowColor }}
                />

                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center shadow-sm group-hover:border-[var(--color-primary)]/40 group-hover:scale-105 transition-all duration-300">
                    <Icon size={28} className="text-[#06B6D4] group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <span className="px-3 py-1 text-xs font-bold bg-[var(--color-primary)]/15 text-[var(--color-primary)] rounded-full">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-[var(--text-strong)] tracking-tight mb-4 group-hover:text-[var(--color-primary)] transition-colors">
                  {item.title}
                </h3>

                <p className="text-base text-[var(--text-secondary)] leading-relaxed font-normal">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
export default WhySkillKollabSection;
