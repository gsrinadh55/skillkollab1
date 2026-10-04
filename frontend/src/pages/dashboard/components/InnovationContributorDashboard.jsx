import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Lightbulb, Sparkles, Trophy, Award, Briefcase, ChevronRight, 
  CheckCircle2, Clock, Users, ArrowRight, Zap, ShieldCheck, Terminal, TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

// We will use profile.activityData if available, otherwise it's empty

export function InnovationContributorDashboard() {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.auth);
  const { list: challenges } = useSelector((state) => state.challenges);
  const { statuses } = useSelector((state) => state.connections || { statuses: {} });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Use recommended teammates from profile or connection slice, otherwise empty array
  const recommendedTeammates = profile?.recommendedTeammates || [];

  useEffect(() => {
    // We would import these at top, I'll use direct imports to avoid breaking imports
    import('../../../store/slices/connectionsSlice').then(({ fetchConnectionStatus }) => {
      recommendedTeammates.forEach(tm => {
        dispatch(fetchConnectionStatus(tm.id));
      });
    });

    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const handleApplyClick = (challenge) => {
    toast.success(`Opening application form for ${challenge.title}`);
    navigate(`/projects/${challenge.id}`);
  };

  const handleConnect = async (team) => {
    try {
      const { sendConnectionRequest, acceptConnectionRequest } = await import('../../../store/slices/connectionsSlice');
      
      const status = statuses[team.id]?.status;
      
      if (status === 'PENDING_RECEIVED') {
        // Accept request
        const connId = statuses[team.id]?.connectionId;
        if (connId) {
          await dispatch(acceptConnectionRequest(connId));
          toast.success(`You are now connected with ${team.name}!`);
        }
      } else if (status === 'ACCEPTED') {
        // We will just alert for now, Chat UI will be handled by Navbar or we can open a modal
        // In a real app we might open the direct chat modal here
        toast.success(`Chat feature opening for ${team.name}...`);
        // Alternatively dispatch an action to open chat
      } else {
        // Send request
        await dispatch(sendConnectionRequest(team.id));
        toast.success(`Sent collaboration connect request to ${team.name}!`);
      }
    } catch (err) {
      toast.error('Failed to update connection status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-12 animate-pulse">
        <div className="h-48 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)]" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]" />
          ))}
        </div>
        <div className="h-72 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)]" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 pb-12"
    >
      {/* Welcome Hero Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[var(--bg-card)] via-[rgba(14,165,233,0.15)] to-[var(--bg-card)] border border-[var(--color-secondary)]/40 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="sk-badge-secondary text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              💡 Innovation Contributor Hub
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-strong)] tracking-tight mb-3">
            Discover Challenges. Build Portfolio. Excel.
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base font-normal leading-relaxed">
            Welcome back, <span className="font-bold text-[var(--text-strong)]">{profile?.name || 'Contributor'}</span>. Your verified AI skill profile is ready to match you with new venture prototypes. Let’s collaborate and build real products.
          </p>
        </div>
        <div className="flex sm:flex-col gap-3 z-10 w-full sm:w-auto">
          <button 
            onClick={() => navigate('/discover')}
            className="btn-sk-primary whitespace-nowrap px-6 py-3 font-bold text-sm bg-gradient-to-r from-[var(--color-secondary)] to-emerald-600 shadow-md cursor-pointer hover:scale-105 transition-transform"
          >
            <Sparkles className="w-4 h-4" /> Discover Marketplace
          </button>
          <button 
            onClick={() => navigate('/portfolio')}
            className="btn-sk-secondary whitespace-nowrap px-6 py-3 font-semibold text-sm cursor-pointer hover:scale-105 transition-transform"
          >
            View Behance Portfolio
          </button>
        </div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[var(--color-secondary)] rounded-full blur-3xl opacity-15 pointer-events-none" />
      </div>

      {/* Top Contributor Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Contribution Score', value: `${profile?.xp || 0} XP`, sub: `Lvl ${profile?.level || 1} Pioneer`, text: 'text-[var(--color-secondary)]' },
          { label: 'AI Skill Match', value: profile?.skillMatch || 'N/A', sub: 'Top percentile rankings', text: 'text-[var(--color-primary)]' },
          { label: 'Pending Applications', value: `${profile?.pendingApplications?.length || 0} Active`, sub: 'In review by Lead', text: 'text-amber-400' },
          { label: 'Accepted Teams', value: `${profile?.teams?.length || 0} Team(s)`, sub: 'Workspace enabled', text: 'text-emerald-400' },
          { label: 'Verified Certs', value: `${profile?.certificates?.length || 0} Cert(s)`, sub: 'Verified by institutions', text: 'text-[var(--text-accent)]' },
          { label: 'Portfolio Progress', value: `${profile?.portfolioProjects?.length || 0} Project(s)`, sub: 'Completed and rated', text: 'text-pink-400' },
        ].map((item, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl sk-glass-card border border-[var(--border-strong)] shadow-sm flex flex-col justify-between"
          >
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{item.label}</span>
            <p className={`text-2xl font-extrabold mt-2 my-1 ${item.text}`}>{item.value}</p>
            <span className="text-[11px] font-medium text-[var(--text-secondary)] mt-1 truncate">{item.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* XP Growth & Recommended Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Left 2 Columns: Recommended Challenges */}
        <div className="lg:col-span-2 sk-glass-card p-6 sm:p-7 space-y-6 border border-[var(--border-strong)] shadow-md">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)]">
                <Sparkles className="w-5 h-5 text-[var(--color-secondary)]" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[var(--text-strong)] flex items-center gap-2">
                  Recommended Challenges
                  <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-mono">AI Personalized</span>
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">Curated specifically for your master skills in React, TypeScript, and Tailwind.</p>
              </div>
            </div>
            <Link to="/discover" className="text-xs font-bold text-[var(--color-secondary)] hover:underline flex items-center gap-1">
              View Marketplace <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {challenges.slice(0, 2).map((ch, idx) => {
              const matchScore = idx === 0 ? '98% AI Match' : '94% AI Match';
              const badgeStyle = idx === 0 ? 'sk-badge-primary' : 'sk-badge-secondary';

              return (
                <div key={ch.id} className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--color-secondary)] transition-all duration-300 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <img src={ch.owner?.avatar || ch.logo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} alt={ch.owner?.name} className="w-10 h-10 rounded-xl object-cover border border-[var(--border-strong)]" />
                      <div>
                        <span className="text-xs text-[var(--text-secondary)] font-semibold">{ch.owner?.name || 'Unknown Organizer'}</span>
                        <h3 className="text-base font-extrabold text-[var(--text-strong)] hover:text-[var(--color-secondary)] transition-colors">{ch.title}</h3>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border self-start sm:self-auto ${badgeStyle}`}>
                      ✨ {ch.matchScore || 'New Match'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-4">{ch.problemStatement}</p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)]">
                    <div className="flex flex-wrap gap-1.5">
                      {(ch.requiredSkills || ['React', 'AI', 'Node']).slice(0, 4).map((skill, i) => (
                        <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-strong)]">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleApplyClick(ch)}
                      className="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] text-white shadow-md hover:scale-105 transition-all cursor-pointer"
                    >
                      Inspect & Apply
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recharts Activity Graph */}
          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <h3 className="text-base font-bold text-[var(--text-strong)] mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Contribution XP & Code Commit Velocity
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Your weekly progression through verified sprints and technical deliverables.</p>
            <div className="h-48 w-full">
              {profile?.activityData && profile.activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={profile.activityData}>
                    <defs>
                      <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="week" stroke="var(--text-muted)" tick={{ fontSize: 11 }} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)', borderRadius: '12px', color: 'var(--text-strong)' }} />
                    <Area type="monotone" dataKey="xp" name="Total XP" stroke="var(--color-secondary)" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-muted)] border-2 border-dashed border-[var(--border-subtle)] rounded-2xl">
                  <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm font-medium">No activity data yet.</p>
                  <p className="text-xs">Start contributing to earn XP!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Accepted Teams & Upcoming Deadlines */}
        <div className="space-y-6">
          {/* Accepted Team Workspace card */}
          <div className="sk-glass-card p-6 border border-emerald-500/40 bg-gradient-to-b from-[var(--bg-card)] to-[rgba(16,185,129,0.1)] shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <span className="text-sm font-extrabold text-[var(--text-strong)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Accepted Team Workspace
              </span>
              <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded uppercase font-bold">Active</span>
            </div>
            <div className="py-4">
              {profile?.teams && profile.teams.length > 0 ? (
                // Map over real teams in the future
                <div className="text-center text-sm text-[var(--text-secondary)]">Teams available</div>
              ) : (
                <div className="text-center text-[var(--text-muted)] py-4">
                  <p className="text-xs mb-4">No active workspaces yet. Apply to challenges to join a team!</p>
                  <button 
                    onClick={() => navigate('/discover')}
                    className="w-full py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Terminal className="w-4 h-4" /> Find Challenges
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="sk-glass-card p-6 space-y-3.5 border border-[var(--border-strong)] shadow-sm">
            <h3 className="text-sm font-bold text-[var(--text-strong)] flex items-center gap-2 pb-2.5 border-b border-[var(--border-subtle)]">
              <Clock className="w-4 h-4 text-[var(--text-accent)]" /> Upcoming Sprints & Deadlines
            </h3>
            {profile?.deadlines && profile.deadlines.length > 0 ? (
              // Map over real deadlines in the future
              <div />
            ) : (
              <div className="p-4 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                No upcoming deadlines or meetings.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recommended Teammates & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {/* Recommended Teammates */}
        <div className="sk-glass-card p-6 sm:p-7 space-y-4 border border-[var(--border-strong)] shadow-md">
          <h2 className="text-base font-bold text-[var(--text-strong)] flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-[var(--color-secondary)]" /> Recommended Teammates for Collaboration</span>
            <span className="text-xs text-[var(--text-muted)] font-mono">95%+ Match</span>
          </h2>
          <div className="space-y-3">
            {recommendedTeammates.length > 0 ? (
              recommendedTeammates.map((team, idx) => {
                const status = statuses[team.id]?.status || 'NONE';
                
                let btnText = 'Connect';
                let btnDisabled = false;
                
                if (status === 'PENDING_SENT') {
                  btnText = 'Request Sent';
                  btnDisabled = true;
                } else if (status === 'PENDING_RECEIVED') {
                  btnText = 'Accept';
                } else if (status === 'ACCEPTED') {
                  btnText = 'Chat';
                } else if (status === 'DECLINED') {
                  btnText = 'Connect'; // Can resend
                }

                return (
                  <div key={team.id} className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between hover:bg-[var(--bg-card-hover)] transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={team.avatar} alt={team.name} className="w-10 h-10 rounded-full object-cover border border-[var(--border-strong)]" />
                      <div>
                        <p className="text-xs font-bold text-[var(--text-strong)]">{team.name}</p>
                        <p className="text-[11px] text-[var(--text-secondary)]">{team.role} • {team.school}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleConnect(team)}
                      disabled={btnDisabled}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                        btnDisabled 
                          ? 'bg-[var(--bg-subtle)] text-[var(--text-muted)] cursor-not-allowed border border-transparent' 
                          : status === 'ACCEPTED'
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 cursor-pointer'
                            : 'bg-[var(--bg-card)] hover:bg-[var(--color-primary)] text-[var(--color-primary)] hover:text-white border border-[var(--border-strong)] cursor-pointer'
                      }`}
                    >
                      {btnText}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-[var(--text-muted)] text-xs border border-dashed border-[var(--border-subtle)] rounded-xl">
                We are currently analyzing the network to find the best teammates for your unique skill profile. Check back later!
              </div>
            )}
          </div>
        </div>

        {/* Recent Contributor Activity */}
        <div className="sk-glass-card p-6 sm:p-7 space-y-4 border border-[var(--border-strong)] shadow-md">
          <h2 className="text-base font-bold text-[var(--text-strong)] flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <span className="flex items-center gap-2"><Trophy className="w-4 h-4 text-[var(--text-accent)]" /> Recent Portfolio Achievement Log</span>
            <Link to="/profile" className="text-xs text-[var(--text-accent)] hover:underline font-semibold">Full History</Link>
          </h2>
          <div className="space-y-4 pt-1">
            {profile?.recentActivity && profile.recentActivity.length > 0 ? (
              // Map over real activity in the future
              <div />
            ) : (
              <div className="p-6 text-center text-[var(--text-muted)] text-xs border border-dashed border-[var(--border-subtle)] rounded-xl mt-3">
                Your portfolio journey is just beginning. Complete challenges to earn badges, XP, and ratings!
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default InnovationContributorDashboard;
