import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck, Cpu, Award } from 'lucide-react';

const advantages = [
  {
    title: 'Real Industry Projects',
    description: 'Bypass fictitious tutorials and simulated classrooms. Build production-grade software directly addressing verified organizational priorities.',
    icon: Building2,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    title: 'Verified Organizations',
    description: 'Every publishing enterprise, NGO, and institutional partner is rigorously vetted to guarantee high-quality engineering mentorship and rewards.',
    icon: ShieldCheck,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'AI Powered Team Formation',
    description: 'Our proprietary synergy algorithm connects multidisciplinary innovators based on verified competency, timezone alignment, and execution track record.',
    icon: Cpu,
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    title: 'Career Portfolio',
    description: 'Convert shipped pull requests and milestone accomplishments into an irrefutable, cryptographic record of verified industry achievements.',
    icon: Award,
    gradient: 'from-amber-500 to-orange-600',
  },
];

export function AdvantagesSection() {
  return (
    <section className="py-24 sm:py-32 relative z-10 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            className="text-xs font-bold uppercase tracking-widest text-[#7C3AED] mb-3"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Ecosystem Primitives
          </motion.h2>
          <motion.p 
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#172033] tracking-tight leading-tight"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Platform Advantages
          </motion.p>
        </div>

        {/* 4 Premium Advantage Cards with Large Whitespace */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.title}
                className="bg-white p-8 sm:p-10 flex flex-col justify-between border border-[#E5E7EB] transition-all duration-300 group hover:border-[#7C3AED]/30 hover:shadow-lg rounded-2xl"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                whileHover={{ y: -5 }}
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.gradient} p-0.5 shadow-sm mb-8 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center border border-[#E5E7EB]">
                      <IconComponent size={26} className="text-[#172033]" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#172033] tracking-tight mb-4 group-hover:text-[#7C3AED] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-[#64748B] leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="pt-8 mt-6 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-bold text-[#7C3AED]">
                  <span>Explore Edge</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
export default AdvantagesSection;
