import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, PlusCircle, FolderGit2, Users2, TerminalSquare, MessageSquare, 
  FileText, CalendarCheck, Award, Trophy, Briefcase, User, Settings, Search, 
  Bell, ChevronLeft, ChevronRight, LogOut, Sparkles, RefreshCcw, Sun, Moon, LogIn
} from 'lucide-react';
import toast from 'react-hot-toast';
import { setActiveRole, resetOnboardingForDemo } from '../store/slices/authSlice';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useApplications } from '../hooks/firebase/useApplications';

const LEAD_NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', protected: true },
  { label: 'Create Challenge', icon: PlusCircle, path: '/innovation-lead/create-challenge', accent: true, protected: true },
  { label: 'My Challenges', icon: FolderGit2, path: '/my-challenges', protected: true },
  { label: 'Applications', icon: Users2, path: '/applications', protected: true },
  { label: 'Workspace', icon: TerminalSquare, path: '/workspace', protected: true },
  { label: 'Messages', icon: MessageSquare, path: '/messages', protected: true },
  { label: 'Documents', icon: FileText, path: '/documents', protected: true },
  { label: 'Milestones', icon: CalendarCheck, path: '/milestones', protected: true },
  { label: 'Leaderboard', icon: Trophy, path: '/leaderboard', protected: true },
  { label: 'Portfolio', icon: Briefcase, path: '/portfolio', protected: true },
  { label: 'Achievements', icon: Award, path: '/achievements', protected: true },
  { label: 'Settings', icon: Settings, path: '/profile', protected: true },
];

const CONTRIBUTOR_NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', protected: true },
  { label: 'Discover Challenges', icon: Search, path: '/discover', accent: true, protected: false },
  { label: 'Applications', icon: Users2, path: '/applications', protected: true },
  { label: 'Workspace', icon: TerminalSquare, path: '/workspace', protected: true },
  { label: 'Messages', icon: MessageSquare, path: '/messages', protected: true },
  { label: 'Portfolio', icon: Briefcase, path: '/portfolio', protected: true },
  { label: 'Achievements', icon: Award, path: '/achievements', protected: true },
  { label: 'Leaderboard', icon: Trophy, path: '/leaderboard', protected: true },
  { label: 'Profile', icon: User, path: '/profile', protected: true },
  { label: 'Settings', icon: Settings, path: '/profile', protected: true },
];

export function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  
  const { isAuthenticated, logout, requireAuth, openAuthModal, user, updateActiveRole } = useAuth();
  
  const activeRole = user?.activeRole || user?.role || 'STUDENT';
  const profile = user; // Use user from context as the profile source of truth
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isLead = activeRole === 'INNOVATION_LEAD';
  const isOrg = activeRole === 'ORGANIZATION_ADMIN' || activeRole === 'ORGANIZATION_REVIEWER' || activeRole === 'ORGANIZATION';
  let navItems = isLead ? LEAD_NAV_ITEMS : (isOrg ? [] : CONTRIBUTOR_NAV_ITEMS);

  const filter = isLead ? { challengeCreatorId: user?.uid } : { studentId: user?.uid };
  const { applications } = useApplications(isAuthenticated ? filter : {});
  const pendingCount = applications?.filter(a => a.status === 'PENDING').length || 0;
  const activeCount = applications?.filter(a => a.status === 'ACCEPTED').length || 0;

  navItems = navItems.map(item => {
    if (item.label === 'Applications') {
      if (isLead && pendingCount > 0) return { ...item, badge: `${pendingCount} Pending` };
      if (!isLead && activeCount > 0) return { ...item, badge: `${activeCount} Active` };
    }
    return item;
  });

  const availableRoles = user?.roles || [user?.role || 'STUDENT'];

  const handleRoleSelect = async (newRole) => {
    setShowRoleDropdown(false);
    if (newRole === activeRole) return;
    
    toast.loading('Switching workspace...', { id: 'role-switch' });
    const success = await updateActiveRole(newRole);
    if (success) {
      toast.success(`Switched to ${newRole.replace('_', ' ')}`, { id: 'role-switch' });
      // The ProtectedRoute/GuestRoute logic will handle navigation automatically if we hit a redirect, 
      // but to force it, we navigate them to the correct dashboard based on newRole.
      if (newRole === 'INNOVATION_LEAD' || newRole === 'MENTOR') {
        navigate('/innovation-lead/dashboard');
      } else if (newRole === 'ORGANIZATION_ADMIN' || newRole === 'ORGANIZATION') {
        navigate('/organization/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast.error('Failed to switch role', { id: 'role-switch' });
    }
  };

  const handleResetOnboarding = () => {
    requireAuth(() => {
      dispatch(resetOnboardingForDemo());
      toast.success('Restarted First Login Experience');
      navigate('/onboarding');
    });
  };

  const handleNavClick = (e, item) => {
    if (item.protected && !isAuthenticated) {
      e.preventDefault();
      requireAuth(item.path);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex overflow-hidden transition-colors duration-250">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? '80px' : '270px' }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="h-screen bg-[var(--bg-card)] border-r border-[var(--border-strong)] flex flex-col z-30 flex-shrink-0 relative select-none shadow-lg"
      >
        {/* Logo & Brand Header */}
        <div className="h-20 flex items-center px-5 border-b border-[var(--border-subtle)] justify-between">
          <Link to="/" className="flex items-center gap-3 overflow-hidden no-underline">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)] flex items-center justify-center shadow-[0_0_20px_rgba(109,93,246,0.4)] flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="text-xl font-extrabold tracking-tight text-[var(--text-strong)] truncate">
                SkillKollab
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Current Active Role Indicator & Quick Switcher */}
        <div className="p-3 border-b border-[var(--border-subtle)] relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            title="Click to switch roles"
            className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-all shadow-sm border cursor-pointer ${
              isLead
                ? 'bg-[rgba(109,93,246,0.15)] border-[var(--color-primary)] text-[var(--color-primary)]'
                : isOrg 
                  ? 'bg-amber-500/15 border-amber-500 text-amber-500'
                  : 'bg-[rgba(14,165,233,0.15)] border-[var(--color-secondary)] text-[var(--color-secondary)]'
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden truncate">
              <span className="text-base flex-shrink-0">{isLead ? '🚀' : isOrg ? '🏢' : '💡'}</span>
              {!collapsed && (
                <span className="truncate">{isLead ? 'Innovation Lead' : isOrg ? 'Organization' : 'Student / Contributor'}</span>
              )}
            </div>
            {!collapsed && <RefreshCcw className={`w-3.5 h-3.5 transition-all duration-300 ${showRoleDropdown ? 'rotate-180 opacity-100' : 'opacity-70 hover:opacity-100'}`} />}
          </button>
          
          <AnimatePresence>
            {showRoleDropdown && !collapsed && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-3 right-3 mt-1 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-xl shadow-xl z-50 overflow-hidden"
              >
                <div className="p-2 space-y-1">
                  {availableRoles.includes('STUDENT') || availableRoles.includes('USER') || availableRoles.includes('CONTRIBUTOR') ? (
                    <button onClick={() => handleRoleSelect('STUDENT')} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-[var(--bg-surface)] ${(!isLead && !isOrg) ? 'bg-[var(--bg-surface)] text-[var(--color-secondary)]' : 'text-[var(--text-strong)]'}`}>
                      💡 Student / Contributor
                    </button>
                  ) : null}
                  
                  {availableRoles.includes('INNOVATION_LEAD') || availableRoles.includes('MENTOR') ? (
                    <button onClick={() => handleRoleSelect('INNOVATION_LEAD')} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-[var(--bg-surface)] ${isLead ? 'bg-[var(--bg-surface)] text-[var(--color-primary)]' : 'text-[var(--text-strong)]'}`}>
                      🚀 Innovation Lead
                    </button>
                  ) : null}
                  
                  {availableRoles.includes('ORGANIZATION_ADMIN') || availableRoles.includes('ORGANIZATION') ? (
                    <button onClick={() => handleRoleSelect('ORGANIZATION_ADMIN')} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-[var(--bg-surface)] ${isOrg ? 'bg-[var(--bg-surface)] text-amber-500' : 'text-[var(--text-strong)]'}`}>
                      🏢 University / Organization
                    </button>
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Link List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && item.path !== '/discover' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={index}
                to={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className={`group flex items-center gap-3.5 px-3.5 py-3 rounded-[12px] text-sm font-semibold transition-all duration-200 relative no-underline ${
                  isActive
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-strong)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-[var(--color-primary)] rounded-r-full"
                  />
                )}

                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-[var(--color-primary)]' : item.accent ? 'text-[var(--color-secondary)]' : 'text-[var(--text-muted)]'
                }`} />

                {!collapsed && (
                  <div className="flex items-center justify-between flex-1 truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[rgba(109,93,246,0.2)] border border-[var(--color-primary)] text-[var(--color-primary)] uppercase">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom User Profile / Sign In Prompt */}
        <div className="p-4 border-t border-[var(--border-subtle)] flex flex-col gap-2 bg-[var(--bg-surface)]">
          {isAuthenticated ? (
            <>
              {!collapsed && (
                <button
                  onClick={handleResetOnboarding}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors flex items-center justify-center gap-1.5 py-1.5 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[var(--color-primary)]" /> Reopen Onboarding Wizard
                </button>
              )}

              <div className="flex items-center gap-3 pt-1">
                <img
                  src={profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={profile?.name || "User"}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[var(--color-primary)] shadow-md flex-shrink-0"
                />
                {!collapsed && (
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-[var(--text-strong)] truncate">{profile?.name || "SkillKollab User"}</p>
                    <p className="text-[11px] font-semibold text-[var(--text-accent)] truncate">Lvl {profile?.level || 1} • {profile?.xp || 0} XP</p>
                  </div>
                )}
                {!collapsed && (
                  <button
                    onClick={logout}
                    title="Log out"
                    className="w-8 h-8 rounded-lg bg-[var(--bg-card)] hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center text-[var(--text-muted)] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center">
              <button
                onClick={() => openAuthModal(location.pathname)}
                className="btn-sk-primary w-full justify-center text-xs py-2.5 font-bold shadow-md cursor-pointer"
              >
                <LogIn size={16} />
                {!collapsed && <span>Sign In / Join</span>}
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[var(--bg-main)] relative">
        {/* Top Header / Navbar */}
        <header className="h-20 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/85 backdrop-blur-xl px-6 sm:px-8 flex items-center justify-between z-20 sticky top-0">
          {/* Left Search Box */}
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search challenges, skills, AI subagents, code..."
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-full pl-10 pr-14 py-2 text-sm text-[var(--text-strong)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all shadow-inner"
              />
              <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-[var(--bg-card)] border border-[var(--border-subtle)] px-2 py-0.5 rounded text-[10px] font-mono text-[var(--text-muted)]">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right Action Icons, Theme Switcher & Notifications */}
          <div className="flex items-center gap-3.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-strong)] transition-all cursor-pointer shadow-sm hover:scale-105"
              title="Toggle Light/Dark Theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} className="text-indigo-600" />}
            </button>

            {/* Quick Role Toggle (Header) */}
            <div className="hidden sm:block relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] text-sm font-medium text-[var(--text-strong)] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                title="Switch Role"
              >
                <span>{isLead ? 'Innovation Lead' : isOrg ? 'Organization' : 'Contributor'}</span>
                <RefreshCcw className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    requireAuth('/notifications');
                    return;
                  }
                  setShowNotifications(!showNotifications);
                }}
                className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-strong)] transition-all relative shadow-sm hover:border-[var(--color-primary)] cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {isAuthenticated && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[var(--color-secondary)] rounded-full ring-2 ring-[var(--bg-main)] animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-4 shadow-2xl z-50 backdrop-blur-2xl text-[var(--text-primary)]"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                      <span className="text-sm font-bold text-[var(--text-strong)] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[var(--color-primary)]" /> Live Notifications
                      </span>
                      <span className="sk-badge-primary">0 New</span>
                    </div>
                    <div className="py-6 text-center">
                      <p className="text-[13px] text-[var(--text-muted)]">No new notifications.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isAuthenticated && (
              <button 
                onClick={() => openAuthModal(location.pathname)} 
                className="btn-sk-primary text-xs px-4 py-2 font-bold whitespace-nowrap cursor-pointer ml-1"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Viewport content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
