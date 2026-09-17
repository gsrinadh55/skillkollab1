import React from 'react';
import { Link } from 'react-router-dom';

export function LandingFooter() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-[#F8FAFC] py-14 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#E5E7EB]">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <Link className="brand inline-flex items-center gap-3 text-[#172033] no-underline" to="/">
              <span className="brand-mark bg-[#7C3AED] text-white">SK</span>
              <span className="flex flex-col font-bold text-base leading-tight">
                SkillKollab
                <small className="text-xs font-medium text-[#64748B]">Real-World Innovation</small>
              </span>
            </Link>
            <p className="text-sm text-[#64748B] max-w-sm leading-relaxed font-normal">
              Connecting innovative students with startups, industries, researchers, NGOs, and colleges to solve verified real-world challenges.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            <div className="space-y-3">
              <span className="font-bold text-[#172033] uppercase text-xs tracking-wider block">Platform</span>
              <ul className="space-y-2 list-none p-0 m-0 text-[#64748B]">
                <li><a href="#how-it-works" className="hover:text-[#7C3AED] transition-colors no-underline">How It Works</a></li>
                <li><a href="#why-skillkollab" className="hover:text-[#7C3AED] transition-colors no-underline">Why SkillKollab</a></li>
                <li><a href="#marketplace" className="hover:text-[#7C3AED] transition-colors no-underline">Live Challenges</a></li>
                <li><a href="#platform-preview" className="hover:text-[#7C3AED] transition-colors no-underline">Role Preview</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="font-bold text-[#172033] uppercase text-xs tracking-wider block">Ecosystem</span>
              <ul className="space-y-2 list-none p-0 m-0 text-[#64748B]">
                <li><Link to="/discover" className="hover:text-[#7C3AED] transition-colors no-underline">Challenge Directory</Link></li>
                <li><Link to="/register" className="hover:text-[#7C3AED] transition-colors no-underline">Student Innovators</Link></li>
                <li><Link to="/login" className="hover:text-[#7C3AED] transition-colors no-underline">Organization Login</Link></li>
                <li><a href="#faq" className="hover:text-[#7C3AED] transition-colors no-underline">Simple FAQ</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="font-bold text-[#172033] uppercase text-xs tracking-wider block">Legal & Security</span>
              <ul className="space-y-2 list-none p-0 m-0 text-[#64748B]">
                <li><a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-[#7C3AED] transition-colors no-underline">Privacy Policy</a></li>
                <li><a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-[#7C3AED] transition-colors no-underline">Terms of Service</a></li>
                <li><a href="#security" onClick={(e) => e.preventDefault()} className="hover:text-[#7C3AED] transition-colors no-underline">Verified Endorsements</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#94A3B8] gap-4">
          <p>© {new Date().getFullYear()} SkillKollab Platform. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Engineered with modern SaaS primitives for real impact.
          </p>
        </div>

      </div>
    </footer>
  );
}
export default LandingFooter;
