import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Hash, MessageSquare, Sparkles, User, Search, Paperclip, 
  Smile, Bot, CheckCheck, Circle, ShieldAlert, Pin, Code2, Heart, ThumbsUp, Flame, Rocket, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import toast from 'react-hot-toast';

import { usersService } from '../../services/firebase/users';

import { api } from '../../services/api';
import socketService from '../../services/socket';

export function MessagesPage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPinnedDrawer, setShowPinnedDrawer] = useState(false);
  const [realUsers, setRealUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchUsersAndChannels = async () => {
      try {
        const users = await usersService.getAllUsers();
        const otherUsers = users.filter(u => u.uid !== user?.uid).map(u => ({
          id: u.uid,
          name: u.name || 'Anonymous User',
          title: u.role ? u.role.replace('_', ' ') : 'User',
          status: 'online',
          avatar: u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        }));
        setRealUsers(otherUsers);
        
        // Try fetching channels if applicable (e.g. from workspace). For now, use an empty array if none.
        setChannels([]);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsersAndChannels();
  }, [user]);

  // Load message history when selecting a user/channel
  useEffect(() => {
    if (!selectedChannel || !user) return;
    
    let isMounted = true;
    const loadHistory = async () => {
      try {
        let res;
        if (selectedChannel.isUser) {
          res = await api.get(`/messages/direct/${selectedChannel.id}`);
        } else {
          res = await api.get(`/messages/channel/${selectedChannel.id}`);
        }
        
        if (isMounted && res.status === 'success') {
          const formatted = res.data.map(m => ({
            id: m.id,
            sender: m.sender?.name || 'Unknown',
            role: m.sender?.role || 'USER',
            isMe: m.senderId === user.uid,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: m.content,
            avatar: m.sender?.avatarUrl,
            reactions: m.reactions || {}
          }));
          setMessages(formatted);
        }
      } catch (err) {
        console.error('Error loading history:', err);
        if (isMounted) setMessages([]);
      }
    };
    loadHistory();

    // Join room for real-time
    const roomId = selectedChannel.isUser ? selectedChannel.id : selectedChannel.id; // Usually requires exact conversation ID, simplified here for demo
    socketService.emit(selectedChannel.isUser ? 'join_user' : 'join_channel', { userId: roomId, channelId: roomId });

    return () => {
      isMounted = false;
    };
  }, [selectedChannel, user]);

  // Handle incoming real-time messages
  useEffect(() => {
    const handleNewMessage = (m) => {
      // Format incoming Socket message if needed
      const formatted = {
        id: m.id || `msg-${Date.now()}`,
        sender: m.sender?.name || 'Unknown',
        role: m.sender?.role || 'USER',
        isMe: m.senderId === user?.uid,
        time: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: m.content || m.text,
        avatar: m.sender?.avatarUrl,
        reactions: m.reactions || {}
      };
      
      // Check if it belongs to the active channel/DM
      // (Requires accurate room check, simplified here)
      setMessages(prev => {
        if (prev.find(msg => msg.id === formatted.id)) return prev;
        return [...prev, formatted];
      });
    };

    socketService.on('receive_message', handleNewMessage);
    socketService.on('receive_direct_message', handleNewMessage);
    
    return () => {
      socketService.off('receive_message', handleNewMessage);
      socketService.off('receive_direct_message', handleNewMessage);
    };
  }, [user, selectedChannel]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleReaction = (msgId, emoji) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        const currentCount = m.reactions?.[emoji] || 0;
        const nextReactions = { ...m.reactions, [emoji]: currentCount + 1 };
        return { ...m, reactions: nextReactions };
      }
      return m;
    }));
    toast.success(`Reacted with ${emoji}`);
  };

  const togglePin = (msgId) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        const pinned = !m.isPinned;
        toast.success(pinned ? 'Message pinned to channel drawer!' : 'Message unpinned');
        return { ...m, isPinned: pinned };
      }
      return m;
    }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChannel) return;

    const currentText = inputText;
    setInputText('');

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const myMsg = {
      id: tempId,
      sender: `${user?.name || 'User'} (You)`,
      role: user?.role || 'STUDENT',
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: currentText,
      reactions: {}
    };
    setMessages((prev) => [...prev, myMsg]);

    try {
      if (selectedChannel.isUser) {
        await api.post(`/messages/direct/${selectedChannel.id}`, { content: currentText });
      } else {
        await api.post(`/messages/channel/${selectedChannel.id}`, { content: currentText });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message');
      // Optionally remove temp message on failure
      setMessages((prev) => prev.filter(m => m.id !== tempId));
    }
  };

  const pinnedMessages = messages.filter(m => m.isPinned);

  return (
    <DashboardLayout>
      <div className="h-[82vh] max-w-7xl mx-auto rounded-3xl sk-glass-card border border-[var(--border-strong)] overflow-hidden flex flex-col md:flex-row shadow-2xl bg-[var(--bg-card)]">
        
        {/* Discord/Slack Sidebar */}
        <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-[var(--border-strong)] bg-[var(--bg-surface)] flex flex-col justify-between shrink-0">
          <div className="p-5 border-b border-[var(--border-subtle)]">
            <strong className="text-base font-extrabold text-[var(--text-strong)] flex items-center gap-2 mb-1">
              <MessageSquare className="w-5 h-5 text-[var(--color-primary)]" />
              <span>Sprint Discussions</span>
            </strong>
            <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              NexusAI Venture • 6 Online
            </span>
          </div>

          {/* Channel Lists */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-6 custom-scrollbar">
            <div>
              <span className="text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider px-2 block mb-2">
                TEXT CHANNELS
              </span>
              <div className="space-y-1">
                {channels.length === 0 ? (
                  <div className="text-[10px] text-[var(--text-muted)] px-2 font-medium">No active text channels in your workspaces.</div>
                ) : (
                  channels.map((ch) => {
                    const isActive = selectedChannel?.id === ch.id;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => setSelectedChannel(ch)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-[var(--color-primary)]/20 to-transparent text-[var(--text-accent)] border border-[var(--color-primary)]/30'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-strong)] hover:bg-[var(--bg-card)]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {ch.isAi ? <Sparkles size={16} className="text-[var(--color-secondary)] shrink-0" /> : <Hash size={16} className="shrink-0 opacity-70" />}
                          <span className="truncate">{ch.name}</span>
                        </div>
                        {ch.unread > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] shadow-sm animate-pulse">
                            {ch.unread}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider px-2 block mb-2">
                DIRECT MESSAGES (USERS)
              </span>
              <div className="space-y-1.5">
                {realUsers.length === 0 ? (
                  <div className="text-xs text-[var(--text-muted)] px-2">No other users found.</div>
                ) : (
                  realUsers.map((dm) => {
                    const isActive = selectedChannel?.id === dm.id;
                    return (
                      <button
                        key={dm.id}
                        onClick={() => setSelectedChannel({ id: dm.id, name: dm.name, desc: dm.title || 'Direct Message', isUser: true, avatar: dm.avatar })}
                        className={`w-full text-left flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-[var(--color-primary)]/20 to-transparent border border-[var(--color-primary)]/30'
                            : 'hover:bg-[var(--bg-card)] border border-transparent'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <img src={dm.avatar} alt={dm.name} className="w-8 h-8 rounded-lg object-cover border border-[var(--border-strong)] shadow-sm" />
                          <span className={`w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-[var(--bg-surface)] ${dm.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        </div>
                        <div className="overflow-hidden">
                          <strong className={`text-xs font-extrabold block truncate ${isActive ? 'text-[var(--text-accent)]' : 'text-[var(--text-strong)]'}`}>{dm.name}</strong>
                          <span className={`text-[10px] block truncate ${isActive ? 'text-[var(--color-primary)]/80' : 'text-[var(--text-muted)]'}`}>{dm.title}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="p-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] text-xs text-[var(--text-secondary)] flex items-center gap-2 font-medium">
            <Sparkles size={15} className="text-[var(--color-secondary)] shrink-0" />
            <span>Tip: Mention <strong>@ai</strong> for code stubs.</span>
          </div>
        </div>

        {/* Main Chat Stream */}
        <div className="flex-1 flex flex-col bg-[var(--bg-card)] relative overflow-hidden">
          
          {/* Top Channel Header */}
          <div className="p-4 sm:px-6 sm:py-5 border-b border-[var(--border-strong)] bg-[var(--bg-surface)] flex items-center justify-between shadow-sm">
            {selectedChannel ? (
              <>
                <div className="flex items-center gap-2.5 truncate">
                  {selectedChannel.isAi ? (
                    <Sparkles size={20} className="text-[var(--color-secondary)] shrink-0" />
                  ) : selectedChannel.isUser ? (
                    <img src={selectedChannel.avatar} alt={selectedChannel.name} className="w-6 h-6 rounded-md object-cover border border-[var(--border-strong)] shrink-0" />
                  ) : (
                    <Hash size={20} className="text-[var(--text-muted)] shrink-0" />
                  )}
                  <div className="truncate">
                    <strong className="text-base sm:text-lg font-extrabold text-[var(--text-strong)] mr-2">{selectedChannel.name}</strong>
                    <span className="text-xs text-[var(--text-secondary)] hidden sm:inline-block">— {selectedChannel.desc}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5 text-[var(--text-muted)]">
                Select a channel or user to start messaging
              </div>
            )}

            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => setShowPinnedDrawer(!showPinnedDrawer)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  showPinnedDrawer ? 'bg-[var(--color-secondary)] text-white border-[var(--color-secondary)]' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-strong)] border-[var(--border-strong)]'
                }`}
              >
                <Pin size={14} className={showPinnedDrawer ? 'fill-current' : ''} />
                <span className="hidden sm:inline">Pinned</span>
                <span className="ml-1 px-1.5 py-0.2 rounded bg-black/30 font-mono text-[10px]">{pinnedMessages.length}</span>
              </button>

              <span className="sk-badge-secondary text-[11px] hidden md:inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-current" /> Socket.IO Sync
              </span>
            </div>
          </div>

          {/* Message Feed & Pinned Drawer Layout */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl transition-all border shadow-sm group ${
                    m.isAi 
                      ? 'bg-[rgba(109,93,246,0.06)] border-[var(--color-primary)]/40' 
                      : m.isMe 
                      ? 'bg-[rgba(14,165,233,0.04)] border-[var(--color-secondary)]/30 ml-auto' 
                      : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'
                  } max-w-[88%] sm:max-w-[78%]`}
                >
                  {m.isAi ? (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-xl shrink-0 shadow-md">
                      🤖
                    </div>
                  ) : m.avatar ? (
                    <img src={m.avatar} alt="Avatar" className="w-10 h-10 rounded-2xl object-cover border border-[var(--border-strong)] shrink-0 shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm">
                      {m.sender.charAt(0)}
                    </div>
                  )}

                  <div className="flex-1 overflow-hidden space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className={`text-xs sm:text-sm font-extrabold ${m.isAi ? 'text-[var(--text-accent)]' : m.isMe ? 'text-[var(--color-secondary)]' : 'text-[var(--text-strong)]'}`}>
                        {m.sender}
                      </strong>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        {m.role}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] ml-auto font-mono">{m.time}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal leading-relaxed whitespace-pre-wrap">
                      {m.text}
                    </p>

                    {/* Code Snippet Block */}
                    {m.codeSnippet && (
                      <div className="p-3.5 rounded-xl bg-[#08090E] border border-[var(--border-strong)] font-mono text-[11px] text-cyan-300 overflow-x-auto my-2 space-y-1 shadow-inner">
                        <div className="text-[10px] text-[var(--text-muted)] font-extrabold uppercase pb-1 border-b border-white/10 flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><Code2 size={13} className="text-cyan-400" /> TypeScript / Socket.IO</span>
                          <span>Copy</span>
                        </div>
                        <pre className="leading-relaxed">{m.codeSnippet}</pre>
                      </div>
                    )}

                    {/* Emoji Reactions Deck */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                      {['👍', '🔥', '🚀', '❤️'].map(emoji => {
                        const count = m.reactions?.[emoji];
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(m.id, emoji)}
                            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                              count > 0 ? 'bg-[var(--color-primary)]/15 border-[var(--color-primary)] text-[var(--text-strong)]' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] opacity-70 hover:opacity-100'
                            }`}
                          >
                            <span>{emoji}</span>
                            {count > 0 && <span className="text-[10px] font-mono">{count}</span>}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => togglePin(m.id)}
                        title="Pin Message"
                        className={`ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-amber-400 cursor-pointer ${m.isPinned ? 'opacity-100 text-amber-400' : ''}`}
                      >
                        <Pin size={14} className={m.isPinned ? 'fill-current' : ''} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-3 p-4 bg-[rgba(109,93,246,0.1)] rounded-2xl border border-dashed border-[var(--color-primary)] w-fit animate-pulse">
                  <span className="text-xl">🤖</span>
                  <span className="text-xs font-bold text-[var(--text-accent)]">
                    AI Co-Pilot is synthesizing AST boundaries & drafting code answer...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Pinned Messages Drawer */}
            {showPinnedDrawer && (
              <div className="w-72 sm:w-80 border-l border-[var(--border-strong)] bg-[var(--bg-surface)] p-5 flex flex-col h-full shrink-0 animate-fadeIn overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
                  <h3 className="text-sm font-extrabold text-[var(--text-strong)] flex items-center gap-2">
                    <Pin size={16} className="text-[var(--color-secondary)] fill-current" /> Pinned Drawer
                  </h3>
                  <button onClick={() => setShowPinnedDrawer(false)} className="text-[var(--text-muted)] hover:text-[var(--text-strong)] cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  {pinnedMessages.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)] text-center py-6">No pinned announcements in this channel yet.</p>
                  ) : (
                    pinnedMessages.map(p => (
                      <div key={p.id} className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-strong)] space-y-2 text-xs">
                        <div className="flex justify-between font-extrabold text-[var(--text-strong)]">
                          <span>{p.sender.split(' ')[0]}</span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">{p.time}</span>
                        </div>
                        <p className="text-[var(--text-secondary)] line-clamp-3 leading-relaxed font-normal">{p.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Message Composer Bar */}
          <form onSubmit={handleSend} className="p-4 sm:p-5 border-t border-[var(--border-strong)] bg-[var(--bg-surface)] flex gap-3 items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={selectedChannel ? `Message ${selectedChannel.isUser ? '@' : '#'}${selectedChannel.name}...` : 'Select a conversation...'}
                disabled={!selectedChannel}
                className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-strong)] text-[var(--text-strong)] placeholder-[var(--text-muted)] text-xs sm:text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all"
              />
            </div>

            <button type="submit" disabled={!selectedChannel} className="btn-sk-primary px-6 py-3.5 font-extrabold text-xs sm:text-sm rounded-xl flex items-center gap-2 cursor-pointer shadow-md shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
              <span>Send</span>
              <Send size={16} />
            </button>
          </form>

        </div>
      </div>
    </DashboardLayout>
  );
}
export default MessagesPage;
