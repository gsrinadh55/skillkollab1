import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, Building2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function OrganizationVerificationRejected() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const orgName = user?.organization?.name || "Your Organization";
  const reason = user?.organization?.verificationReason || "The provided documents did not meet our verification standards or were incomplete.";

  return (
    <div className="app-shell flex flex-col min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      <div className="ambient ambient-right" aria-hidden="true" />
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="sk-glass-card max-w-lg w-full p-8 text-center border-red-500/20"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-[var(--text-strong)] mb-4">
            Organization Verification Rejected
          </h2>
          
          <div className="bg-[var(--bg-main)] rounded-xl p-6 mb-6 border border-[var(--border-strong)]">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Building2 className="text-[var(--text-strong)]" size={24} />
              <span className="font-semibold text-lg">{orgName}</span>
            </div>
            
            <div className="text-left bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-red-500 font-semibold mb-2">
                <AlertTriangle size={18} /> Reason for Rejection
              </div>
              <p className="text-sm text-red-400 m-0">
                {reason}
              </p>
            </div>
            
            <p className="text-[var(--text-secondary)] text-sm mb-0">
              Your organization account verification was unsuccessful. You cannot access the Organization Portal until this is resolved.
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/signup/organization/re-verify')}
            className="btn-sk-primary w-full py-3 flex items-center justify-center gap-2"
          >
            Resubmit Documents <ArrowRight size={18} />
          </button>
          
        </motion.div>
      </div>
    </div>
  );
}

export default OrganizationVerificationRejected;
