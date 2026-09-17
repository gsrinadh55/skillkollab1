import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User } from 'lucide-react';
import api from '../../services/api';
import io from 'socket.io-client';

export function DirectChatModal({ isOpen, onClose, targetUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Note: Replace 'usr-1' with the actual logged-in user ID from AuthContext later
  const currentUserId = 'usr-1'; 

  useEffect(() => {
    if (isOpen && targetUser) {
      // Fetch message history
      const fetchHistory = async () => {
        try {
          const res = await api.get(`/messages/direct/${targetUser.id}`);
          setMessages(res.data.data || []);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) {
          console.error('Failed to fetch direct messages', err);
        }
      };
      fetchHistory();

      // Setup socket
      const newSocket = io('http://localhost:4000'); // Note: env.SOCKET_URL in production
      setSocket(newSocket);

      newSocket.on('connect', () => {
        newSocket.emit('join_user', { userId: currentUserId });
      });

      newSocket.on('receive_direct_message', (msg) => {
        // Only append if the message belongs to this conversation
        if (
          (msg.senderId === currentUserId && msg.receiverId === targetUser.id) ||
          (msg.senderId === targetUser.id && msg.receiverId === currentUserId)
        ) {
          setMessages(prev => [...prev, msg]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, targetUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    try {
      const res = await api.post(`/messages/direct/${targetUser.id}`, { body: newMessage });
      const savedMsg = res.data.data;
      
      socket.emit('direct_message', { receiverId: targetUser.id, message: savedMsg });
      
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && targetUser && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-4 right-4 w-[360px] h-[480px] bg-[var(--bg-main)] shadow-2xl rounded-2xl z-50 flex flex-col border border-[var(--border-subtle)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <img src={targetUser.avatarUrl || `https://ui-avatars.com/api/?name=${targetUser.name}&background=random`} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h3 className="font-bold text-[var(--text-strong)] text-sm">{targetUser.name}</h3>
                <p className="text-xs text-[var(--text-secondary)] truncate w-40">{targetUser.bio || 'Connected User'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-subtle)]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] space-y-2">
                <User size={32} className="opacity-20" />
                <p className="text-sm">Say hi to {targetUser.name}</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${
                      isMe 
                        ? 'bg-[var(--color-primary)] text-white rounded-br-sm' 
                        : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-strong)] rounded-bl-sm'
                    }`}>
                      {msg.body}
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] mt-1 ml-1 mr-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[var(--bg-main)] border-t border-[var(--border-subtle)]">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input 
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full px-4 py-2 text-sm text-[var(--text-strong)] focus:outline-none focus:border-[var(--color-primary)] placeholder-[var(--text-muted)]"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
              >
                <Send size={16} className="ml-1" />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
