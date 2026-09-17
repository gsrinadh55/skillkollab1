import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqItems = [
  {
    question: 'Who can use SkillKollab?',
    answer: 'SkillKollab is designed for student innovators, college builders, startups, enterprises, NGOs, and professional researchers. Anyone looking to collaborate on verified real-world engineering challenges can join.',
  },
  {
    question: 'How does AI team matching work?',
    answer: 'Our proprietary engine evaluates technical proficiency, Github contribution history, working velocity, and goal synergy to connect multidisciplinary innovators who complement each other perfectly.',
  },
  {
    question: 'How is SkillKollab different?',
    answer: 'Unlike generic task boards or textbook assignments, SkillKollab exclusively revolves around verified real-world problems published by actual organizations, ensuring every line of code ships directly into an authoritative career portfolio.',
  },
  {
    question: 'Is it free?',
    answer: 'Yes. SkillKollab is completely free for student builders and innovators. Organizations and institutions can also publish challenges and mentor teams with seamless community access.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 sm:py-32 relative z-10 border-t border-[#E5E7EB] bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-16">
          <motion.h2 
            className="text-xs font-bold uppercase tracking-widest text-[#7C3AED] mb-3"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Clear Guidance
          </motion.h2>
          <motion.p 
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#172033] tracking-tight leading-tight"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Simple FAQ
          </motion.p>
        </div>

        {/* 4 Accordion Items */}
        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={item.question}
                className={`bg-[#F8FAFC] border transition-all duration-200 overflow-hidden rounded-2xl ${
                  isOpen ? 'border-[#7C3AED] shadow-sm' : 'border-[#E5E7EB] hover:border-[#7C3AED]/50'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full py-6 px-7 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                >
                  <span className="text-lg sm:text-xl font-bold text-[#172033] tracking-tight pr-4">
                    {item.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0 transition-transform duration-300 shadow-sm ${
                    isOpen ? 'rotate-180 border-[#7C3AED] bg-[#F3E8FF]' : ''
                  }`}>
                    <ChevronDown size={18} className={isOpen ? 'text-[#7C3AED]' : 'text-[#64748B]'} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={{
                        open: { opacity: 1, height: "auto" },
                        collapsed: { opacity: 0, height: 0 }
                      }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-7 pb-6 pt-1 text-base text-[#64748B] leading-relaxed font-normal border-t border-[#E5E7EB]">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
export default FaqSection;
