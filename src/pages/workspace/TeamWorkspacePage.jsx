import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Terminal, MessageSquare, CheckSquare, FolderGit2, FileText, 
  Video, Send, Plus, UploadCloud, CheckCircle2, AlertTriangle, Sparkles, 
  ChevronRight, MoreVertical, GitPullRequest, GitCommit, Users2, Unlock,
  Bot, LayoutGrid, Play, RefreshCw, PenTool, Eraser, Circle, Square, Share2,
  ArrowLeft, ArrowRight, Check, ExternalLink, Code2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { moveTask, addTask, addDocument } from '../../store/slices/workspaceSlice';
import { LiveCodeEditor } from '../../components/workspace/LiveCodeEditor';
import { useAuth } from '../../context/AuthContext';
import { challengesService } from '../../services/firebase/challenges';
import { teamsService } from '../../services/firebase/teams';
import { useTeamMembers } from '../../hooks/firebase/useTeam';
import { usersService } from '../../services/firebase/users';
import { WorkspaceSelector } from './WorkspaceSelector';
import { api } from '../../services/api';
import socketService from '../../services/socket';

export function TeamWorkspacePage() {
  const { user, profile } = useAuth();
  const { kanbanTasks, sharedDocuments, githubCommits } = useSelector((state) => state.workspace);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const [challenge, setChallenge] = useState(null);
  const [team, setTeam] = useState(null);
  const [realMembers, setRealMembers] = useState([]);
  const [loadingContext, setLoadingContext] = useState(true);

  // 7-Tab Workspace Layout
  const [activeTab, setActiveTab] = useState('kanban'); 
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [channelMessages, setChannelMessages] = useState([]);
  
  // Modal states
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

  const [whiteboardTool, setWhiteboardTool] = useState('pen');

  useEffect(() => {
    if (!id) {
      setLoadingContext(false);
      return;
    }

    const fetchContext = async () => {
      setLoadingContext(true);
      try {
        const challengeData = await challengesService.getChallengeById(id);
        setChallenge(challengeData);
        const teamData = await teamsService.getTeamByChallengeId(id);
        setTeam(teamData);
        if (teamData) {
          const membersData = await teamsService.getTeamMembers(teamData.id);
          const populatedMembers = await Promise.all(membersData.map(async (m) => {
             const userProfile = await usersService.getUserProfile(m.userId);
             return {
                userId: m.userId,
                name: userProfile?.name || 'Unknown',
                avatar: userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                role: m.role || 'Member'
             };
          }));
          setRealMembers(populatedMembers);
        }
      } catch (err) {
        console.error("Failed to load workspace context:", err);
      } finally {
        setLoadingContext(false);
      }
    };
    fetchContext();
  }, [id]);

  // Check access: Is the user the challenge creator, OR are they an active team member?
  const isCreator = challenge?.creatorId === user?.uid || challenge?.ownerId === user?.uid || challenge?.leadId === user?.uid;
  const isMember = realMembers.some(m => m.userId === user?.uid);
  const hasAccess = isCreator || isMember;

  // Load Channel Messages and Connect Socket
  useEffect(() => {
    if (!hasAccess || !id || !user) return;
    
    // For simplicity, we map the workspace ID to a general channel ID
    const channelId = `workspace-${id}-general`;

    let isMounted = true;
    const loadHistory = async () => {
      try {
        const res = await api.get(`/messages/channel/${channelId}`);
        if (isMounted && res.status === 'success') {
          const formatted = res.data.map(m => ({
            id: m.id,
            user: m.sender?.name || 'Unknown',
            avatar: m.sender?.avatarUrl,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: m.content
          }));
          setChannelMessages(formatted);
        }
      } catch (err) {
        console.error('Failed to load workspace chat history', err);
      }
    };
    loadHistory();

    socketService.emit('join_channel', { channelId });

    const handleNewMessage = (m) => {
      const formatted = {
        id: m.id || `msg-${Date.now()}`,
        user: m.sender?.name || 'Unknown',
        avatar: m.sender?.avatarUrl,
        timestamp: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: m.content || m.text
      };
      setChannelMessages(prev => {
        if (prev.find(msg => msg.id === formatted.id)) return prev;
        return [...prev, formatted];
      });
    };

    socketService.on('receive_message', handleNewMessage);

    return () => {
      isMounted = false;
      socketService.off('receive_message', handleNewMessage);
      socketService.emit('leave_channel', { channelId });
    };
  }, [hasAccess, id, user]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const channelId = `workspace-${id}-general`;
    const promptText = chatInput;
    setChatInput('');

    // Optimistic Update
    const tempId = `temp-${Date.now()}`;
    setChannelMessages(prev => [...prev, {
      id: tempId,
      user: profile?.name || 'You',
      avatar: profile?.avatarUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: promptText
    }]);

    try {
      await api.post(`/messages/channel/${channelId}`, { content: promptText });
    } catch (err) {
      toast.error('Failed to send message');
      setChannelMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const handleTaskMove = (taskId, currentColumn, nextColumn) => {
    dispatch(moveTask({ taskId, column: nextColumn }));
    toast.success(`Moved task to ${nextColumn.toUpperCase()}`);
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    dispatch(addTask({
      title: newTaskTitle,
      assignee: newTaskAssignee || profile?.name || 'User',
      priority: newTaskPriority,
      column: 'todo',
    }));
    setNewTaskTitle('');
    setNewTaskPriority('Medium');
    setNewTaskAssignee('');
    setShowNewTaskModal(false);
    toast.success('New sprint task added to Kanban queue!');
  };

  const handleUploadSim = () => {
    dispatch(addDocument({
      name: `architecture_spec_v3_${Math.floor(Math.random() * 100)}.pdf`,
      uploadedBy: profile?.name || 'User',
      size: '3.1 MB',
      date: 'Just now'
    }));
    toast.success('File encrypted and uploaded to Shared Documents.');
  };

  if (!id) {
    return <WorkspaceSelector />;
  }

  if (loadingContext) {
    return (
      <DashboardLayout>
        <div className="h-[82vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="h-[82vh] flex flex-col items-center justify-center text-center p-6 max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="p-10 border border-rose-500/30 shadow-lg flex flex-col items-center relative overflow-hidden rounded-[24px] bg-[var(--bg-card)]"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-6 text-rose-500 border border-rose-100 dark:border-rose-500/20">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-strong)] tracking-tight mb-2">
              Protected Team Workspace
            </h1>
            <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed mb-8">
              In accordance with SkillKollab’s collaborative security model, you cannot access this team's private Kanban board, source repository, or chat rooms until an <strong>Innovation Lead accepts your application</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <button
                onClick={() => navigate('/applications')}
                className="w-full sm:w-1/2 py-3 bg-[var(--bg-card)] border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-[12px] font-semibold transition-colors"
              >
                Check Application Status
              </button>

              {/* Removed Demo unlock */}
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // Helper for priority styling
  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'Urgent':
        return 'bg-[#FEF2F2] dark:bg-red-500/10 text-[#DC2626] border border-red-100 dark:border-red-500/20';
      case 'High':
        return 'bg-[#FFF1F2] dark:bg-rose-500/10 text-[#E11D48] border border-rose-100 dark:border-rose-500/20';
      case 'Medium':
      case 'Low':
      default:
        return 'bg-[#F1EEFF] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-16 max-w-7xl mx-auto">
        {/* Top Workspace Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-[18px] bg-[var(--bg-card)] border border-[var(--color-primary)]/20 shadow-[0_4px_20px_rgba(30,41,59,0.04)]">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-[var(--bg-surface)] border border-[var(--border-strong)] flex items-center justify-center shrink-0">
              <Terminal className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" /> LIVE • DEMO SPRINT
                </span>
                <span className="text-xs font-medium text-[var(--text-secondary)]">Team: Team Name</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-strong)] tracking-tight">
                Autonomous AI Security Profiler
              </h1>
            </div>
          </div>

          {/* Active Members & Sprint Switcher */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-5">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-secondary)] font-medium hidden sm:inline">Online Team:</span>
              <div className="flex -space-x-2">
                {realMembers.map((mem, i) => (
                  <img key={i} title={`${mem.name} (${mem.role})`} src={mem.avatar} alt={mem.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-[var(--bg-card)] shadow-sm" />
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab('meetings');
                toast.success('Joined secure team standup huddle!');
              }}
              className="px-5 py-2.5 rounded-[12px] bg-[#10B981] text-white font-semibold text-sm flex items-center gap-2 shadow-sm hover:bg-[#059669] transition-colors"
            >
              <Video className="w-4 h-4" /> Start Live Meet
            </button>
          </div>
        </div>

        {/* Navigation Tab Pills */}
        <div className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-[14px] bg-[var(--bg-card)] border border-[var(--border-strong)] hide-scrollbar shadow-sm">
          {[
            { id: 'kanban', label: 'Kanban Board', icon: CheckSquare },
            { id: 'chat', label: 'Chat', icon: MessageSquare },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'github', label: 'GitHub Sync', icon: FolderGit2 },
            { id: 'meetings', label: 'Video Standups', icon: Video },
            { id: 'ai-review', label: 'AI Coach', icon: Bot },
            { id: 'whiteboard', label: 'Whiteboard', icon: PenTool },
            { id: 'code', label: 'Code', icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-[10px] text-[13px] font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-strong)] hover:bg-[#F8F7FF] dark:hover:bg-[var(--bg-surface)] border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: KANBAN BOARD */}
        {activeTab === 'kanban' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-[18px] font-bold text-[var(--text-strong)] flex items-center gap-2">
                  Sprint 3 Workflow <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
                </h2>
                <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
                  Drag tasks between stages or use the arrow controls to update progress.
                </p>
              </div>
              <button
                onClick={() => setShowNewTaskModal(true)}
                className="px-5 py-2.5 rounded-[12px] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] font-semibold text-sm flex items-center gap-2 shadow-[0_4px_14px_rgba(109,74,255,0.2)] transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              {[
                { col: 'todo', label: 'TO DO', color: 'text-[#64748B]', bg: 'bg-[var(--bg-surface)]' },
                { col: 'inProgress', label: 'IN PROGRESS', color: 'text-[var(--color-primary)]', bg: 'bg-[var(--bg-surface)]' },
                { col: 'review', label: 'UNDER AI REVIEW', color: 'text-[#7C5CFF]', bg: 'bg-[#FAF8FF] dark:bg-[var(--bg-surface)]', indicator: '✦ AI Review' },
                { col: 'done', label: 'COMPLETED', color: 'text-[#10B981]', bg: 'bg-[var(--bg-surface)]' },
              ].map((column) => {
                const colTasks = kanbanTasks.filter((t) => t.column === column.col);

                return (
                  <div key={column.col} className={`p-4 rounded-[16px] border border-[var(--border-strong)] flex flex-col min-h-[250px] ${column.bg}`}>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)]">
                      <span className={`text-[12px] font-bold tracking-wider ${column.color} flex items-center gap-1.5`}>
                        {column.indicator && <span className="text-xs">{column.indicator}</span>}
                        {!column.indicator && column.label}
                      </span>
                      <span className="text-[11px] font-semibold bg-[var(--bg-card)] border border-[var(--border-strong)] text-[var(--text-secondary)] px-2 py-0.5 rounded-md">
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-3">
                      {colTasks.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-6 opacity-60">
                          <CheckSquare className="w-8 h-8 text-[var(--text-muted)] mb-2" />
                          <p className="text-[12px] font-medium text-[var(--text-secondary)]">No tasks here yet</p>
                        </div>
                      ) : (
                        colTasks.map((task) => (
                          <div key={task.id} className="p-3.5 rounded-[14px] bg-[var(--bg-card)] border border-[var(--border-strong)] hover:border-[#C4B5FD] dark:hover:border-[var(--color-primary)] shadow-[0_2px_8px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_20px_rgba(109,74,255,0.10)] hover:-translate-y-[2px] transition-all flex flex-col justify-between group">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[6px] ${getPriorityBadge(task.priority)}`}>
                                  {task.priority}
                                </span>
                                {column.col === 'done' && (
                                  <span className="flex items-center gap-1 text-[#10B981] text-[10px] font-bold">
                                    <Check className="w-3.5 h-3.5" /> Done
                                  </span>
                                )}
                                {column.col === 'review' && (
                                  <span className="text-[var(--color-secondary)] text-[10px] font-bold border border-[var(--color-secondary)]/20 px-1.5 py-0.5 rounded-md bg-[var(--color-secondary)]/5">
                                    AI checking...
                                  </span>
                                )}
                              </div>
                              <h4 className="text-[13px] font-semibold text-[var(--text-strong)] leading-snug mb-3">{task.title}</h4>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-[10px] font-bold border border-[var(--color-primary)]/20">
                                  {task.assignee.charAt(0)}
                                </div>
                                <span className="text-[11px] font-medium text-[var(--text-secondary)] truncate max-w-[90px]">{task.assignee}</span>
                              </div>
                              <div className="flex gap-1">
                                {column.col !== 'todo' && (
                                  <button
                                    onClick={() => handleTaskMove(task.id, column.col, column.col === 'done' ? 'review' : column.col === 'review' ? 'inProgress' : 'todo')}
                                    title="Move to previous stage"
                                    className="w-6 h-6 rounded-full bg-[var(--bg-card)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[#F1EEFF] dark:hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 transition-colors"
                                  >
                                    <ArrowLeft className="w-3 h-3" />
                                  </button>
                                )}
                                {column.col !== 'done' && (
                                  <button
                                    onClick={() => handleTaskMove(task.id, column.col, column.col === 'todo' ? 'inProgress' : column.col === 'inProgress' ? 'review' : 'done')}
                                    title="Move to next stage"
                                    className="w-6 h-6 rounded-full bg-[var(--bg-card)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[#F1EEFF] dark:hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 transition-colors"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: TEAM CHAT ROOM */}
        {activeTab === 'chat' && (
          <div className="border border-[var(--border-strong)] rounded-[18px] overflow-hidden h-[620px] flex flex-col shadow-sm bg-[var(--bg-card)] animate-fadeIn">
            <div className="p-4 bg-[var(--bg-surface)] border-b border-[var(--border-strong)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[15px] font-bold text-[var(--text-strong)]">#general-sync</span>
                <span className="text-xs text-[var(--text-muted)] hidden sm:inline">Encrypted chat</span>
              </div>
              <button 
                onClick={() => navigate('/messages')}
                className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
              >
                Open Full Chat ↗
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[var(--bg-card)]">
              {channelMessages.map((msg) => {
                const isMe = msg.user === profile?.name || msg.user === 'You' || msg.user === 'User';
                const isAi = msg.user === 'AI Co-Pilot' || msg.user === 'AI Mentor & Co-Pilot';
                return (
                  <div key={msg.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    {isAi ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-sm shrink-0 shadow-sm text-white border border-[var(--border-strong)]">
                        🤖
                      </div>
                    ) : (
                      <img src={msg.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'} alt={msg.user} className="w-8 h-8 rounded-full object-cover border border-[var(--border-strong)] shrink-0" />
                    )}
                    <div className={`p-3.5 rounded-2xl max-w-md ${
                      isMe ? 'bg-[var(--color-primary)] text-white rounded-tr-sm' : isAi ? 'bg-[rgba(109,93,246,0.06)] border border-[var(--color-primary)]/40 text-[var(--text-primary)] rounded-tl-sm' : 'bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-tl-sm'
                    }`}>
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className={`text-[12px] font-bold ${isMe ? 'text-white' : isAi ? 'text-[var(--text-accent)]' : 'text-[var(--text-strong)]'}`}>{msg.user}</span>
                        <span className={`text-[10px] ${isMe ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>{msg.timestamp}</span>
                      </div>
                      <p className="text-[13px] leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
              
              {isTyping && (
                <div className="flex items-center gap-3 w-fit animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-sm shrink-0 shadow-sm text-white border border-[var(--border-strong)]">
                    🤖
                  </div>
                  <div className="p-3 rounded-2xl bg-[rgba(109,93,246,0.1)] border border-dashed border-[var(--color-primary)] flex gap-1">
                    <span className="text-[12px] font-bold text-[var(--text-accent)]">AI Co-Pilot is generating response...</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendChat} className="p-4 bg-[var(--bg-surface)] border-t border-[var(--border-strong)] flex gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message team..."
                className="flex-1 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-[12px] px-4 py-2.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-[2px] focus:ring-[var(--color-primary)]/10 transition-all"
              />
              <button
                type="submit"
                className="bg-[var(--color-primary)] text-white px-5 py-2.5 font-semibold text-[13px] rounded-[10px] hover:bg-[var(--color-primary-hover)] flex items-center gap-1.5 transition-colors"
              >
                Send <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: SHARED DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="p-6 sm:p-8 border border-[var(--border-strong)] rounded-[18px] space-y-6 shadow-sm bg-[var(--bg-card)] animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h3 className="text-[18px] font-bold text-[var(--text-strong)] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[var(--color-primary)]" /> Project Documents
                </h3>
                <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Secure technical RFCs and presentation assets.</p>
              </div>
              <button
                onClick={handleUploadSim}
                className="bg-[var(--bg-surface)] hover:bg-[#F1EEFF] dark:hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 px-5 py-2.5 rounded-[12px] text-[13px] font-semibold flex items-center gap-2 transition-colors"
              >
                <UploadCloud className="w-4 h-4" /> Upload File
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sharedDocuments.map((doc) => (
                <div key={doc.id} className="p-5 rounded-[16px] bg-[var(--bg-card)] border border-[var(--border-strong)] hover:border-[#C4B5FD] transition-colors flex flex-col justify-between shadow-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-[14px] font-semibold text-[var(--text-strong)] truncate">{doc.name}</h4>
                      <span className="text-[12px] text-[var(--text-secondary)] block mt-0.5">{doc.size} • {doc.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-[12px]">
                    <span className="text-[var(--text-secondary)] font-medium">By: <strong className="text-[var(--text-strong)]">{doc.uploadedBy}</strong></span>
                    <button 
                      onClick={() => toast.success(`Downloading ${doc.name}...`)}
                      className="text-[var(--color-primary)] font-semibold hover:underline"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: GITHUB REPOSITORY SYNC */}
        {activeTab === 'github' && (
          <div className="p-6 sm:p-8 border border-[var(--border-strong)] rounded-[18px] space-y-6 shadow-sm bg-[var(--bg-card)] animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-strong)]">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[var(--text-strong)]">
                    organization-name/project-repo
                  </h3>
                  <span className="text-[12px] text-[#10B981] font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Active Sync • Branch: main
                  </span>
                </div>
              </div>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:bg-gray-50 dark:hover:bg-slate-800 text-[var(--text-primary)] px-5 py-2.5 rounded-[12px] text-[13px] font-semibold transition-colors flex items-center gap-2"
              >
                Open GitHub <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-3">
              <h4 className="text-[13px] font-bold text-[var(--text-strong)]">Recent Commits</h4>
              <div className="space-y-3">
                {githubCommits.map((commit) => (
                  <div key={commit.id} className="p-4 rounded-[14px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <GitCommit className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
                      <div className="truncate">
                        <p className="text-[14px] font-semibold text-[var(--text-strong)] truncate">{commit.message}</p>
                        <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 font-mono">
                          {commit.sha} by <span className="font-medium text-[var(--text-primary)]">{commit.author}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[12px] text-[var(--text-muted)] font-mono shrink-0">{commit.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: VIDEO STANDUPS HUDDLE */}
        {activeTab === 'meetings' && (
          <div className="p-8 sm:p-12 border border-[var(--border-strong)] rounded-[18px] shadow-sm bg-[var(--bg-card)] animate-fadeIn text-center">
            <div className="max-w-xl mx-auto space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mx-auto mb-2 border border-[#10B981]/20">
                <Video size={32} />
              </div>
              <h2 className="text-[24px] font-bold text-[var(--text-strong)] tracking-tight">
                Live Video Collaboration
              </h2>
              <p className="text-[var(--text-secondary)] text-[14px] leading-relaxed">
                Connect directly with your team in low-latency WebRTC rooms with screen sharing and spatial audio.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button 
                  onClick={() => toast.success('Launch simulated WebRTC room')} 
                  className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white px-8 py-3 rounded-[12px] text-[14px] font-semibold transition-colors"
                >
                  Join Room (2 waiting)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AUTONOMOUS AI CODE REVIEWER */}
        {activeTab === 'ai-review' && (
          <div className="p-6 sm:p-8 border border-[var(--border-strong)] rounded-[18px] space-y-6 shadow-sm bg-[var(--bg-card)] animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-[18px] font-bold text-[var(--text-strong)] flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[var(--color-primary)]" /> AI Code Quality Inspector
                </h3>
                <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Automated static code evaluation and security checks.</p>
              </div>
              <button onClick={() => toast.success('Re-running codebase scan...')} className="bg-[var(--bg-surface)] hover:bg-[#F1EEFF] dark:hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold flex items-center gap-2 transition-colors">
                <RefreshCw size={14} /> Re-scan
              </button>
            </div>

            <div className="space-y-3 font-mono text-sm">
              {[
                { test: 'AST Boundary Security Check', status: 'PASS', time: '14ms' },
                { test: 'Zod Validator Integration', status: 'PASS', time: '8ms' },
                { test: 'Frontend Rendering Performance', status: 'WARN', time: '42ms' },
                { test: 'LLM Prompt Injection Defense', status: 'SECURE', time: '112ms' },
              ].map((t, index) => (
                <div key={index} className="p-4 rounded-[14px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${t.status === 'WARN' ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`} />
                    <strong className="text-[var(--text-strong)] font-medium text-[13px]">{t.test}</strong>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[var(--text-muted)]">{t.time}</span>
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      t.status === 'WARN' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20' : 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: COLLABORATIVE WHITEBOARD */}
        {activeTab === 'whiteboard' && (
          <div className="p-6 sm:p-8 border border-[var(--border-strong)] rounded-[18px] space-y-5 shadow-sm bg-[var(--bg-card)] animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-[18px] font-bold text-[var(--text-strong)] flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-[var(--color-primary)]" /> Collaborative Whiteboard
                </h3>
              </div>

              <div className="flex items-center gap-1.5 bg-[var(--bg-surface)] p-1 rounded-[10px] border border-[var(--border-strong)]">
                {[
                  { id: 'pen', icon: PenTool },
                  { id: 'box', icon: Square },
                  { id: 'circle', icon: Circle },
                  { id: 'erase', icon: Eraser },
                ].map(tl => {
                  const TlIcon = tl.icon;
                  return (
                    <button
                      key={tl.id}
                      onClick={() => setWhiteboardTool(tl.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        whiteboardTool === tl.id ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-strong)] hover:bg-[var(--bg-card)]'
                      }`}
                    >
                      <TlIcon size={16} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div 
              onClick={() => toast.success(`Added node to canvas!`)}
              className="h-80 rounded-[14px] bg-[var(--bg-main)] border border-dashed border-[var(--border-strong)] relative overflow-hidden cursor-crosshair flex flex-col items-center justify-center text-center p-6 group hover:border-[var(--color-primary)]/50 transition-colors"
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--text-muted) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />
              <LayoutGrid size={32} className="text-[var(--text-muted)] group-hover:text-[var(--color-primary)] transition-colors mb-2" />
              <span className="text-[13px] text-[var(--text-secondary)] font-medium">Click to interact with the simulated architecture canvas.</span>
            </div>
          </div>
        )}

        {/* TAB 8: LIVE CODE EDITOR */}
        {activeTab === 'code' && (
          <div className="animate-fadeIn">
            <LiveCodeEditor />
          </div>
        )}

        {/* Add Task Modal */}
        <AnimatePresence>
          {showNewTaskModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="p-6 rounded-[20px] border border-[var(--border-strong)] max-w-md w-full bg-[var(--bg-card)] space-y-5 shadow-2xl">
                <h3 className="text-[18px] font-bold text-[var(--text-strong)]">Add Task</h3>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-[var(--text-strong)] mb-1.5">Task Title *</label>
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="e.g. Update user dashboard styling"
                      className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[10px] p-2.5 text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-[2px] focus:ring-[var(--color-primary)]/10"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[var(--text-strong)] mb-1.5">Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[10px] p-2.5 text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[var(--text-strong)] mb-1.5">Assign To</label>
                    <input
                      type="text"
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      placeholder="e.g. David Chen"
                      className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[10px] p-2.5 text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-[2px] focus:ring-[var(--color-primary)]/10"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-3">
                    <button type="button" onClick={() => setShowNewTaskModal(false)} className="px-5 py-2.5 rounded-[10px] text-[13px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]">Cancel</button>
                    <button type="submit" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-6 py-2.5 text-[13px] font-semibold rounded-[10px] transition-colors">Add Task</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
export default TeamWorkspacePage;
