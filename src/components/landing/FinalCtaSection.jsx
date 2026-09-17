import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export function FinalCtaSection() {
  return (
    <section className="py-24 sm:py-32 relative z-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[32px] p-10 sm:p-16 lg:p-20 relative overflow-hidden text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Ambient Glows Inside Banner */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] rounded-full bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#06B6D4] opacity-20 blur-[90px] pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[#7C3AED] text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
              <Sparkles size={14} />
              <span>Launch Your Journey</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#172033] tracking-tight leading-[1.1] mb-6">
              Ready to Build Real Impact?
            </h2>

            <p className="text-lg sm:text-xl text-[#64748B] font-normal max-w-xl mx-auto mb-10 leading-relaxed">
              Join SkillKollab today and collaborate on verified real-world challenges with industry leaders, startups, and university teams.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-base px-9 py-4 rounded-full transition-all duration-200 shadow-[0_4px_14px_rgba(124,58,237,0.39)]"
              >
                <span>Get Started</span>
                <ArrowRight size={18} />
              </Link>
              <a 
                href="#marketplace" 
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#172033] border border-[#E5E7EB] font-bold text-base px-9 py-4 rounded-full transition-all duration-200 shadow-sm"
              >
                Explore Challenges
              </a>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
export default FinalCtaSection;
