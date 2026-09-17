import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { X, Users, Check, XCircle, MessageSquare } from 'lucide-react';
import { 
  fetchAllConnections, 
  acceptConnectionRequest, 
  declineConnectionRequest 
} from '../../store/slices/connectionsSlice';

export function ConnectionsPanel({ isOpen, onClose, onOpenChat }) {
  const dispatch = useDispatch();
  const { sentRequests, receivedRequests, activeConnections, loading } = useSelector(state => state.connections);
  const [activeTab, setActiveTab] = useState('received'); // 'received', 'sent', 'connections'

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAllConnections());
    }
  }, [isOpen, dispatch]);

  const handleAccept = async (id) => {
    await dispatch(acceptConnectionRequest(id));
  };

  const handleDecline = async (id) => {
    await dispatch(declineConnectionRequest(id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-[var(--bg-main)] shadow-2xl z-50 flex flex-col border-l border-[var(--border-subtle)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <h2 className="text-lg font-bold text-[var(--text-strong)] flex items-center gap-2">
                <Users size={18} className="text-[var(--color-primary)]" />
                Network
              </h2>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center p-2 border-b border-[var(--border-subtle)] gap-1">
              {['received', 'sent', 'connections'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md capitalize transition-colors ${
                    activeTab === tab 
                      ? 'bg-[var(--color-primary)] text-white' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  {tab} 
                  {tab === 'received' && receivedRequests.length > 0 && ` (${receivedRequests.length})`}
                  {tab === 'connections' && activeConnections.length > 0 && ` (${activeConnections.length})`}
                </button>
              ))}
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex justify-center p-8 text-[var(--text-muted)] animate-pulse">
                  Loading...
                </div>
              ) : (
                <>
                  {activeTab === 'received' && (
                    <>
                      {receivedRequests.length === 0 ? (
                        <p className="text-sm text-[var(--text-muted)] text-center mt-10">No pending requests.</p>
                      ) : (
                        receivedRequests.map(req => (
                          <div key={req.id} className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                              <img src={req.requester?.avatarUrl || `https://ui-avatars.com/api/?name=${req.requester?.name || 'U'}&background=random`} alt="" className="w-10 h-10 rounded-full" />
                              <div>
                                <p className="text-sm font-bold text-[var(--text-strong)]">{req.requester?.name || 'Unknown'}</p>
                                <p className="text-[10px] text-[var(--text-secondary)]">Wants to connect</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleAccept(req.id)} className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title="Accept">
                                <Check size={16} />
                              </button>
                              <button onClick={() => handleDecline(req.id)} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Decline">
                                <XCircle size={16} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </>
                  )}

                  {activeTab === 'sent' && (
                    <>
                      {sentRequests.length === 0 ? (
                        <p className="text-sm text-[var(--text-muted)] text-center mt-10">No sent requests.</p>
                      ) : (
                        sentRequests.map(req => (
                          <div key={req.id} className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                              <img src={req.receiver?.avatarUrl || `https://ui-avatars.com/api/?name=${req.receiver?.name || 'U'}&background=random`} alt="" className="w-10 h-10 rounded-full" />
                              <div>
                                <p className="text-sm font-bold text-[var(--text-strong)]">{req.receiver?.name || 'Unknown'}</p>
                                <p className="text-[10px] text-amber-500 font-semibold">Pending Response</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </>
                  )}

                  {activeTab === 'connections' && (
                    <>
                      {activeConnections.length === 0 ? (
                        <p className="text-sm text-[var(--text-muted)] text-center mt-10">You have no connections yet.</p>
                      ) : (
                        activeConnections.map(conn => {
                          const isRequester = conn.requesterId === 'usr-1'; // TODO replace with current user
                          const otherUser = isRequester ? conn.receiver : conn.requester;
                          return (
                            <div key={conn.id} className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-between shadow-sm">
                              <div className="flex items-center gap-3">
                                <img src={otherUser?.avatarUrl || `https://ui-avatars.com/api/?name=${otherUser?.name || 'U'}&background=random`} alt="" className="w-10 h-10 rounded-full" />
                                <div>
                                  <p className="text-sm font-bold text-[var(--text-strong)]">{otherUser?.name || 'Unknown'}</p>
                                  <p className="text-[10px] text-emerald-500 font-semibold">Connected</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  onClose();
                                  onOpenChat(otherUser);
                                }} 
                                className="p-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white rounded-lg transition-colors" 
                                title="Chat"
                              >
                                <MessageSquare size={16} />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
