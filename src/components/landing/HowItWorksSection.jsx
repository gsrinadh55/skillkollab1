import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Cpu, Layers, Award } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Discover a Challenge',
    description: 'Find verified real-world problems published directly by innovative startups, NGOs, and industry leaders.',
    icon: Compass,
    gradient: 'from-[#6D5DF6] to-[#A855F7]',
  },
  {
    step: '02',
    title: 'AI Builds Your Team',
    description: 'Our deep matching engine pairs you with innovators based on skill depth, synergy, and project goals.',
    icon: Cpu,
    gradient: 'from-[#A855F7] to-[#EC4899]',
  },
  {
    step: '03',
    title: 'Collaborate & Build',
    description: 'Execute seamlessly inside targeted sprint workspaces built specifically for shipping production-ready solutions.',
    icon: Layers,
    gradient: 'from-[#EC4899] to-[#22D3EE]',
  },
  {
    step: '04',
    title: 'Deliver Real Impact',
    description: 'Deploy validated solutions, gain verified organization endorsements, and generate an elite career portfolio.',
    icon: Award,
    gradient: 'from-[#22D3EE] to-[#6D5DF6]',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 relative z-10 border-t border-[#E5E7EB] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            className="text-xs font-bold uppercase tracking-widest text-[#7C3AED] mb-3"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Streamlined Execution Flow
          </motion.h2>
          <motion.p 
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#172033] tracking-tight leading-tight"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            How SkillKollab Works
          </motion.p>
        </div>

        {/* 4 Cards with Animated Timeline */}
        <div className="relative">
          
          {/* Animated Horizontal Line for Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-[2px] bg-[#E5E7EB] -translate-y-6 z-0">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#06B6D4]"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              style={{ transformOrigin: "left" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.step}
                  className="bg-[#F8FAFC] border border-[#E5E7EB] p-8 flex flex-col justify-between relative overflow-hidden group hover:border-[#7C3AED]/50 hover:shadow-lg transition-all duration-300 rounded-2xl"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  {/* Step Number Background Stamp */}
                  <span className="absolute -top-4 -right-2 text-7xl font-extrabold text-[#E5E7EB] opacity-40 group-hover:opacity-60 transition-opacity select-none pointer-events-none">
                    {item.step}
                  </span>

                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:border-[#7C3AED]/30 transition-all duration-300">
                      <IconComponent className="text-[#06B6D4] group-hover:text-[#7C3AED] transition-colors" size={24} />
                    </div>

                    <div className="inline-block px-2.5 py-1 rounded-md bg-white text-[11px] font-bold text-[#7C3AED] tracking-wider uppercase mb-3 border border-[#E5E7EB]">
                      Step {item.step}
                    </div>

                    <h3 className="text-xl font-bold text-[#172033] tracking-tight mb-3">
                      {item.title}
                    </h3>

                    <p className="text-sm text-[#64748B] leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  <div className={`w-full h-1 mt-8 rounded-full bg-gradient-to-r ${item.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
export default HowItWorksSection;
