import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, CheckCircle2, UploadCloud, Link as LinkIcon, FolderGit2, Globe, Calendar, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { applicationsService } from '../../../services/firebase/applications';
import { useApplications } from '../../../hooks/firebase/useApplications';
import { rolesService } from '../../../services/firebase/roles';

const applicationSchema = z.object({
  roleApplied: z.string().min(1, 'Please select a targeted open role'),
  introduction: z.string().min(20, 'Introduction must be at least 20 characters describing your passion'),
  portfolioUrl: z.string().url('Please enter a valid URL (https://...)').or(z.literal('')),
  githubUrl: z.string().url('Please enter a valid GitHub profile URL').or(z.literal('')),
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL').or(z.literal('')),
  availability: z.string().min(1, 'Please specify your weekly commitment hours'),
  expectedContribution: z.string().min(15, 'Describe how your skill set solves this problem statement'),
});

export function ApplicationFormModal({ challenge, isOpen, onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { onboardingCompleted, user } = useAuth();
  
  const { applications } = useApplications({ challengeId: challenge?.id });
  const existingApp = challenge ? applications.find(a => a.studentId === user?.uid) : null;
  
  const [dbRoles, setDbRoles] = useState([]);
  
  React.useEffect(() => {
    const loadRoles = async () => {
      if (challenge?.id) {
        try {
          const roles = await rolesService.getOpenRolesForChallenge(challenge.id);
          setDbRoles(roles);
        } catch (error) {
          console.error('Error fetching roles:', error);
        }
      }
    };
    if (isOpen) {
      loadRoles();
    }
  }, [challenge?.id, isOpen]);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      roleApplied: '',
      introduction: user?.profile?.bio || '',
      portfolioUrl: user?.profile?.portfolioUrl || '',
      githubUrl: user?.profile?.githubUrl || '',
      linkedinUrl: user?.profile?.linkedinUrl || '',
      availability: '',
      expectedContribution: ''
    }
  });

  if (!isOpen || !challenge) return null;

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Find the specific role to calculate match score
      const targetRole = dbRoles.find(r => r.id === data.roleApplied);
      let roleMatchScore = 0;
      
      if (targetRole && targetRole.required_skills && user?.profile?.skills) {
        const required = targetRole.required_skills.map(s => s.toLowerCase());
        const userSkills = user.profile.skills.map(s => s.toLowerCase());
        
        let matchCount = 0;
        required.forEach(s => {
          if (userSkills.includes(s)) matchCount++;
        });
        
        roleMatchScore = required.length > 0 ? Math.round((matchCount / required.length) * 100) : 100;
      }
      
      await applicationsService.submitApplication({
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        challengeCreatorId: challenge.creatorId || challenge.ownerId || challenge.leadId || null,
        studentId: user?.uid,
        studentName: user?.name || 'Student Innovator',
        studentAvatar: user?.avatarUrl || null,
        roleId: data.roleApplied,
        roleApplied: targetRole ? targetRole.role_name : '',
        roleMatchScore,
        introduction: data.introduction,
        portfolioUrl: data.portfolioUrl,
        githubUrl: data.githubUrl,
        linkedinUrl: data.linkedinUrl,
        availability: data.availability,
        expectedContribution: data.expectedContribution,
      });
      
      reset();
      onClose();
      toast.success('🎉 Application successfully submitted to Innovation Lead! Status: Pending review.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    if (existingApp) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
          </div>
          <h3 className="text-xl font-bold text-[#172033] mb-2">You've already applied to this challenge.</h3>
          <p className="text-[14px] text-[#64748B] mb-6">Your application is currently being reviewed by the innovation lead.</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-[12px] font-bold text-[#475569] uppercase tracking-wider">Application Status:</span>
            <span className={`text-[12px] font-bold uppercase ${
              existingApp.status === 'ACCEPTED' ? 'text-[#10B981]' : 
              existingApp.status === 'REJECTED' ? 'text-[#EF4444]' : 'text-[#F59E0B]'
            }`}>{existingApp.status || 'PENDING'}</span>
          </div>
        </div>
      );
    }

    if (!onboardingCompleted) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-[#F59E0B]" />
          </div>
          <h3 className="text-xl font-bold text-[#172033] mb-2">Complete your profile before applying</h3>
          <p className="text-[14px] text-[#64748B] mb-6">We need a bit more information about your skills and experience to match you with this challenge.</p>
          <button
            onClick={() => {
              onClose();
              sessionStorage.setItem('skillkollab_pending_redirect', `/projects/${challenge.id}?action=apply`);
              navigate('/onboarding');
            }}
            className="inline-flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-[12px] px-[22px] py-[12px] transition-all cursor-pointer"
          >
            Complete Profile
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Role Selection */}
        <div>
          <label className="block text-[14px] font-semibold text-[#172033] mb-2">Select Target Open Role *</label>
          <select 
            {...register('roleApplied')}
            className="w-full bg-[var(--bg-main)] border border-[var(--border-strong)] rounded-[12px] px-4 h-[46px] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary)]/10 transition-shadow cursor-pointer"
          >
            <option value="" disabled>Select a role</option>
            {dbRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.role_name} ({role.available_slots} slots available)
              </option>
            ))}
          </select>
          {errors.roleApplied && <p className="text-[13px] text-[#EF4444] mt-1 font-medium">{errors.roleApplied.message}</p>}
        </div>

        {/* Introduction & Pitch */}
        <div>
          <label className="block text-[14px] font-semibold text-[#172033] mb-1">Personal Introduction & Mission Motivation *</label>
          <textarea 
            {...register('introduction')}
            rows={3}
            placeholder="Briefly introduce yourself and why you want to collaborate on this specific problem statement..."
            className="w-full bg-[var(--bg-main)] border border-[var(--border-strong)] rounded-[12px] p-3 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary)]/10 transition-shadow"
          />
          {errors.introduction && <p className="text-[13px] text-[#EF4444] mt-1 font-medium">{errors.introduction.message}</p>}
        </div>

        {/* Resume Info */}
        <div className="p-4 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UploadCloud className="w-8 h-8 text-[#7C3AED]" />
            <div>
              <p className="text-[14px] font-semibold text-[#172033]">Resume / Academic CV</p>
              <p className="text-[12px] text-[#64748B]">
                {user?.profile?.resumeUrl ? 'Resume securely attached from profile.' : 'No resume attached in profile.'}
              </p>
            </div>
          </div>
          {user?.profile?.resumeUrl && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0] uppercase">Verified</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#172033] mb-1 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-[#7C3AED]" /> Portfolio Website
            </label>
            <input 
              {...register('portfolioUrl')}
              type="url"
              placeholder="https://yourportfolio.dev"
              className="w-full bg-[var(--bg-main)] border border-[var(--border-strong)] rounded-[10px] px-3 py-2.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary)]/10 transition-shadow"
            />
            {errors.portfolioUrl && <p className="text-[12px] text-[#EF4444] mt-1 font-medium">{errors.portfolioUrl.message}</p>}
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#172033] mb-1 flex items-center gap-1">
              <FolderGit2 className="w-3.5 h-3.5 text-[#7C3AED]" /> GitHub Profile
            </label>
            <input 
              {...register('githubUrl')}
              type="url"
              placeholder="https://github.com/username"
              className="w-full bg-[var(--bg-main)] border border-[var(--border-strong)] rounded-[10px] px-3 py-2.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary)]/10 transition-shadow"
            />
            {errors.githubUrl && <p className="text-[12px] text-[#EF4444] mt-1 font-medium">{errors.githubUrl.message}</p>}
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#172033] mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-[#7C3AED]" /> LinkedIn Profile
            </label>
            <input 
              {...register('linkedinUrl')}
              type="url"
              placeholder="https://linkedin.com/in/username"
              className="w-full bg-[var(--bg-main)] border border-[var(--border-strong)] rounded-[10px] px-3 py-2.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary)]/10 transition-shadow"
            />
            {errors.linkedinUrl && <p className="text-[12px] text-[#EF4444] mt-1 font-medium">{errors.linkedinUrl.message}</p>}
          </div>
        </div>

        {/* Availability & Contribution Plan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[14px] font-semibold text-[#172033] mb-1">Weekly Commitment Availability *</label>
            <input 
              {...register('availability')}
              type="text"
              placeholder="e.g. 15-20 hours/week"
              className="w-full bg-[var(--bg-main)] border border-[var(--border-strong)] rounded-[10px] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary)]/10 transition-shadow"
            />
            {errors.availability && <p className="text-[13px] text-[#EF4444] mt-1 font-medium">{errors.availability.message}</p>}
          </div>
          <div>
            <label className="block text-[14px] font-semibold text-[#172033] mb-1">Expected Deliverable Contribution *</label>
            <input 
              {...register('expectedContribution')}
              type="text"
              placeholder="What will you build or optimize in Sprint 1?"
              className="w-full bg-[var(--bg-main)] border border-[var(--border-strong)] rounded-[10px] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary)]/10 transition-shadow truncate"
            />
            {errors.expectedContribution && <p className="text-[13px] text-[#EF4444] mt-1 font-medium">{errors.expectedContribution.message}</p>}
          </div>
        </div>

        {/* Screening Questions */}
        <div className="p-4 rounded-[14px] border border-[#C4B5FD]" style={{ background: 'linear-gradient(135deg, #F5F3FF, #ECFEFF)' }}>
          <p className="text-[13px] font-bold text-[#7C3AED] mb-1 flex items-center gap-1.5">
            <span>⚡ AI Skill Profile Evaluation Notice</span>
          </p>
          <p className="text-[12px] text-[#64748B] leading-relaxed">
            Your Stanford Computer Science profile and GitHub commit history will be automatically analyzed by our LLM matcher to generate an instant <strong>AI Match Score</strong> for the Innovation Lead.
          </p>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto bg-[var(--bg-main)] text-[var(--text-secondary)] border border-[var(--border-strong)] rounded-[10px] px-5 py-2.5 text-[14px] font-semibold hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-[12px] px-[22px] py-[12px] transition-all hover:-translate-y-[1px] hover:shadow-[0_6px_18px_rgba(124,58,237,0.25)] border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span>Submitting Application...</span>
            ) : (
              <>
                <span>Submit Application</span>
                <Send className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </div>
      </form>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--color-primary)]/30 p-6 sm:p-8 rounded-[18px] shadow-[var(--shadow-glow-primary)] max-h-[90vh] overflow-y-auto relative"
        >
          {/* Close Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6">
            <div>
              <span className="text-[13px] font-bold text-[#7C3AED] uppercase tracking-[0.05em] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Official Candidate Submission
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#172033] mt-1">Apply to Join Innovation Team</h2>
              <p className="text-[14px] text-[#64748B] truncate max-w-md mt-0.5">{challenge.title}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[var(--bg-main)] border border-[var(--border-strong)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 flex items-center justify-center text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {renderContent()}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
