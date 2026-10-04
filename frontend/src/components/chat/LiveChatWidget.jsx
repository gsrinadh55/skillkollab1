import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, X, Send, Bot, Sparkles, Hash, Minus, Maximize2, Pin, Code2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'AI Co-Pilot',
      role: 'AI_BOT',
      isAi: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: 'Hello! Welcome to SkillKollab. How can I help you accelerate your development journey today?',
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const myMsg = {
      id: `msg-${Date.now()}`,
      sender: user?.name ? `${user.name} (You)` : 'Guest (You)',
      role: user?.role || 'GUEST',
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputText,
    };

    setMessages((prev) => [...prev, myMsg]);
    const promptText = inputText;
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const aiReply = {
        id: `ai-${Date.now()}`,
        sender: 'AI Co-Pilot',
        role: 'AI_BOT',
        isAi: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `🤖 Autonomous Response: I'm currently in demo mode on the landing page. To experience full real-time collaboration, please sign in and join a workspace!`,
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-2xl flex items-center justify-center z-50 transition-all hover:-translate-y-1 group"
          >
            <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Widget Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[360px] h-[540px] sm:w-[400px] sm:h-[600px] bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[var(--color-primary)] to-[#5c3ce6] text-white flex items-center justify-between shrink-0">
              <div className="flex flex-col">
                <span className="font-bold flex items-center gap-2">
                  <Sparkles size={16} /> Live AI Assistant
                </span>
                <span className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/messages')}
                  className="p-1.5 hover:bg-white/20 rounded transition-colors"
                  title="Open Full App"
                >
                  <Maximize2 size={16} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded transition-colors"
                >
                  <Minus size={16} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-surface)]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 w-full ${m.isMe ? 'justify-end' : ''}`}
                >
                  {!m.isMe && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-sm shrink-0 shadow-sm text-white">
                      🤖
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[80%] ${m.isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                      m.isMe 
                        ? 'bg-[var(--color-primary)] text-white rounded-tr-sm' 
                        : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-strong)] rounded-tl-sm'
                    }`}>
                      {m.text}
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] mt-1 font-mono px-1">
                      {m.time}
                    </span>
                  </div>

                  {m.isMe && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {m.sender.charAt(0)}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 w-fit">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-sm shrink-0 shadow-sm text-white">
                    🤖
                  </div>
                  <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-tl-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-[var(--bg-card)] border-t border-[var(--border-strong)] flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-strong)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="w-10 h-10 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
