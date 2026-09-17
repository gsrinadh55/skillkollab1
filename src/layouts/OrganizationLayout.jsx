import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, FolderGit2, Users2, Building2, TerminalSquare, MessageSquare, 
  FileText, CalendarCheck, Award, Briefcase, User, Settings, Search, 
  Bell, ChevronLeft, ChevronRight, LogOut, CheckCircle2, ChevronDown, ChevronUp, PieChart, Coins
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const ORG_NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/organization/dashboard' },
  { 
    label: 'Challenges', icon: FolderGit2, 
    subItems: [
      { label: 'All Challenges', path: '/organization/challenges' },
      { label: 'Create Challenge', path: '/organization/challenges/create' },
      { label: 'Drafts', path: '/organization/challenges/drafts' },
      { label: 'Published', path: '/organization/challenges/published' },
    ]
  },
  { 
    label: 'Applications', icon: Users2, 
    subItems: [
      { label: 'New Applications', path: '/organization/applications/new' },
      { label: 'Shortlisted', path: '/organization/applications/shortlisted' },
      { label: 'Accepted', path: '/organization/applications/accepted' },
      { label: 'Rejected', path: '/organization/applications/rejected' },
    ]
  },
  { label: 'Student Teams', icon: Users2, path: '/organization/teams' },
  { label: 'Projects', icon: Briefcase, path: '/organization/projects' },
  { label: 'Grants & Rewards', icon: Coins, path: '/organization/grants' },
  { label: 'Reviews', icon: FileText, path: '/organization/reviews' },
  { label: 'Analytics', icon: PieChart, path: '/organization/analytics' },
  { label: 'Organization Profile', icon: Building2, path: '/organization/profile' },
  { label: 'Verification', icon: CheckCircle2, path: '/organization/verification' },
  { label: 'Settings', icon: Settings, path: '/organization/settings' },
];

export function OrganizationLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [orgData, setOrgData] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, requireAuth, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await api.get('/organizations/me');
        if (res.data.data) {
          setOrgData(res.data.data);
        }
      } catch (e) {
        console.error("Failed to fetch organization", e);
      }
    };
    fetchOrg();
  }, []);

  const toggleSubmenu = (label) => {
    setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex overflow-hidden transition-colors duration-250">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? '80px' : '280px' }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="h-screen bg-[var(--bg-card)] border-r border-[var(--border-strong)] flex flex-col z-30 flex-shrink-0 relative select-none shadow-lg"
      >
        {/* Logo & Brand Header */}
        <div className="h-20 flex items-center px-5 border-b border-[var(--border-subtle)] justify-between">
          <Link to="/organization/dashboard" className="flex items-center gap-3 overflow-hidden no-underline">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-extrabold tracking-tight text-[var(--text-strong)] truncate leading-tight">
                SkillKollab<br/><span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Organization Portal</span>
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

        {/* Navigation Link List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {ORG_NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            
            if (item.subItems && !collapsed) {
              const isActive = item.subItems.some(sub => location.pathname === sub.path);
              const isExpanded = expandedMenus[item.label] || isActive;
              
              return (
                <div key={index} className="mb-1">
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className={`w-full group flex items-center justify-between px-3.5 py-3 rounded-[12px] text-sm font-semibold transition-all duration-200 relative ${
                      isActive ? 'text-emerald-600' : 'text-[var(--text-secondary)] hover:text-[var(--text-strong)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-[var(--text-muted)]" /> : <ChevronDown size={16} className="text-[var(--text-muted)]" />}
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pl-12 pr-3 flex flex-col gap-1 overflow-hidden"
                      >
                        {item.subItems.map((sub, sIdx) => {
                          const isSubActive = location.pathname === sub.path;
                          return (
                            <NavLink
                              key={sIdx}
                              to={sub.path}
                              className={`py-2 text-xs font-semibold rounded-lg px-3 transition-colors ${
                                isSubActive ? 'bg-emerald-50 text-emerald-700 dark:text-emerald-400' : 'text-[var(--text-secondary)] hover:text-[var(--text-strong)] hover:bg-[var(--bg-surface)]'
                              }`}
                            >
                              {sub.label}
                            </NavLink>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            const isActive = location.pathname === item.path || (item.path !== '/organization/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={index}
                to={item.path || '#'}
                className={`group flex items-center gap-3.5 px-3.5 py-3 rounded-[12px] text-sm font-semibold transition-all duration-200 relative no-underline ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-strong)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="orgActiveNavIndicator"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-full"
                  />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-emerald-500' : 'text-[var(--text-muted)]'
                }`} />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom User / Org Profile */}
        <div className="p-4 border-t border-[var(--border-subtle)] flex flex-col gap-2 bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[var(--border-strong)] flex items-center justify-center p-1 overflow-hidden shrink-0">
              {orgData?.logo ? (
                <img src={orgData.logo} alt="Org" className="w-full h-full object-contain" />
              ) : (
                <Building2 size={20} className="text-slate-400" />
              )}
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-[var(--text-strong)] truncate">{orgData?.name || user?.name || "Organization"}</p>
                {orgData?.verificationStatus === 'VERIFIED' ? (
                  <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12}/> Verified</p>
                ) : (
                  <p className="text-[10px] font-bold text-amber-500">Pending Verification</p>
                )}
              </div>
            )}
            {!collapsed && (
              <button onClick={() => { logout(); navigate('/'); }} className="w-8 h-8 rounded-lg bg-[var(--bg-card)] hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center text-[var(--text-muted)] transition-colors cursor-pointer">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[var(--bg-main)] relative">
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}

export default OrganizationLayout;
