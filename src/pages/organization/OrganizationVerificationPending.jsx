import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export function OrganizationVerificationPending() {
  const { user } = useAuth();
  const orgName = user?.organization?.name || "Your Organization";

  return (
    <div className="app-shell flex flex-col min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      <div className="ambient ambient-right" aria-hidden="true" />
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="sk-glass-card max-w-lg w-full p-8 text-center"
        >
          <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-[var(--text-strong)] mb-4">
            🟡 Organization Verification Pending
          </h2>
          
          <div className="bg-[var(--bg-main)] rounded-xl p-6 mb-6 border border-[var(--border-strong)]">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Building2 className="text-emerald-500" size={24} />
              <span className="font-semibold text-lg">{orgName}</span>
            </div>
            <p className="text-[var(--text-secondary)] text-sm mb-0">
              Your organization account is currently under review. 
              We are verifying the documents provided by your authorized representative.
            </p>
          </div>
          
          <p className="text-[var(--text-primary)] mb-8">
            You will receive access to the full Organization Portal after verification. This process typically takes 1-2 business days.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] justify-center">
              <CheckCircle2 size={16} className="text-emerald-500" /> Documents Submitted
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] justify-center">
              <CheckCircle2 size={16} className="text-emerald-500" /> Representative Verified
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-yellow-500 justify-center">
              <Clock size={16} /> Awaiting Final Approval
            </div>
          </div>
          
          {/* Developer Testing Tool to simulate admin approval */}
          <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
            <button 
              onClick={() => {
                try {
                  const storedStr = localStorage.getItem('skillkollab_user');
                  if (storedStr) {
                    const storedUser = JSON.parse(storedStr);
                    if (storedUser.organization) {
                      storedUser.organization.verificationStatus = 'VERIFIED';
                      localStorage.setItem('skillkollab_user', JSON.stringify(storedUser));
                      toast.success('Admin Approval Simulated!');
                      setTimeout(() => {
                        window.location.href = '/organization/dashboard';
                      }, 1000);
                    }
                  }
                } catch (e) {
                  console.error(e);
                }
              }}
              className="text-xs flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-500/20 transition-colors font-bold"
            >
              <ShieldCheck size={14} />
              [Dev Tool] Simulate Admin Approval
            </button>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}

export default OrganizationVerificationPending;
