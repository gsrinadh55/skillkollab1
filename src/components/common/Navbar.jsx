import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SunMedium, MoonStar, ArrowRight, LogOut, Sparkles, Users } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ConnectionsPanel } from '../network/ConnectionsPanel';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isConnectionsOpen, setIsConnectionsOpen] = React.useState(false);

  return (
    <header className="relative z-50 flex items-center justify-between w-full max-w-[1180px] mx-auto py-4 px-4 sm:px-0">
      <Link className="flex items-center gap-3 no-underline" to="/" aria-label="SkillKollab home">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] text-white shadow-sm">
          <Sparkles size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-[#172033] font-bold text-[17px] leading-tight">SkillKollab</span>
          <span className="text-[#64748B] font-semibold text-[10px] tracking-wider uppercase">Real-World Innovation</span>
        </div>
      </Link>

      <nav className="hidden md:flex items-center gap-6 px-6 py-2 border border-[#E5E7EB] rounded-full bg-white/80 backdrop-blur-md shadow-sm" aria-label="Primary navigation">
        <a href="#how-it-works" className="text-[14px] font-medium text-[#64748B] hover:text-[#7C3AED] transition-colors">How It Works</a>
        <a href="#why-skillkollab" className="text-[14px] font-medium text-[#64748B] hover:text-[#7C3AED] transition-colors">Why SkillKollab</a>
        <a href="#marketplace" className="text-[14px] font-medium text-[#64748B] hover:text-[#7C3AED] transition-colors">Challenges</a>
        <a href="#platform-preview" className="text-[14px] font-medium text-[#64748B] hover:text-[#7C3AED] transition-colors">Platform</a>
        <a href="#faq" className="text-[14px] font-medium text-[#64748B] hover:text-[#7C3AED] transition-colors">FAQ</a>
      </nav>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white border border-[#E5E7EB] text-[#64748B] hover:text-[#7C3AED] hover:border-[#7C3AED]/30 transition-colors shadow-sm"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle Dark/Light theme"
        >
          {theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
        </button>

        {loading ? (
          <div className="flex items-center justify-center w-9 h-9 opacity-50 pointer-events-none">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-[#7C3AED] rounded-full animate-spin" />
          </div>
        ) : isAuthenticated ? (
          <div className="flex items-center gap-2.5">
            <Link
              to="/dashboard"
              className="hidden sm:flex items-center justify-center h-9 px-4 rounded-full font-bold text-[13px] text-[#7C3AED] bg-white border border-[#E5E7EB] hover:border-[#7C3AED]/30 transition-colors shadow-sm"
              title="Dashboard"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => setIsConnectionsOpen(true)}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white border border-[#E5E7EB] text-[#64748B] hover:text-[#7C3AED] hover:border-[#7C3AED]/30 transition-colors shadow-sm"
              title="Network"
            >
              <Users size={16} />
            </button>
            <button
              type="button"
              onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[13px] text-[#EF4444] bg-white border border-[#E5E7EB] hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm"
              title="Logout"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link className="hidden sm:flex items-center px-4 py-2 rounded-full font-bold text-[14px] text-[#172033] hover:text-[#7C3AED] transition-colors" to="/login">
              Log in
            </Link>
            <Link className="flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-[14px] text-white bg-[#7C3AED] hover:bg-[#6D28D9] transition-colors shadow-[0_4px_12px_rgba(124,58,237,0.25)]" to="/register">
              Start building
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      <ConnectionsPanel 
        isOpen={isConnectionsOpen} 
        onClose={() => setIsConnectionsOpen(false)} 
        onOpenChat={(user) => {
          // Temporarily just alert, will integrate with chat modal next
          console.log('Open chat with', user)
        }}
      />
    </header>
  );
}

export default Navbar;
