import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, FileText, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { redirectAfterLogin } from '../../utils/authUtils';

export function SignupOrganizationPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Assume we auto-login or register + login
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1
    orgName: '',
    orgType: 'University',
    country: '',
    state: '',
    city: '',
    officialEmail: '',
    website: '',
    description: '',
    // Step 2
    repName: '',
    repDesignation: '',
    repEmail: '',
    repPhone: '',
    // Step 3
    documents: [],
  });

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 4));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Import here to avoid top-level import issues if not needed elsewhere
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../services/firebase');

      if (user?.uid) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'organization.verificationStatus': 'UNDER_REVIEW',
          'organization.details': formData
        });
      }

      // You might also want to submit this to your API
      try {
        await api.post('/organizations/verify', formData);
      } catch (e) {
        console.warn("Backend API not reachable, but Firestore is updated.");
      }

      toast.success("Organization Verification Submitted!");
      navigate('/organization/verification-pending');
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex flex-col min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      <div className="ambient ambient-left" aria-hidden="true" />
      <Navbar />
      <div className="flex-1 py-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[var(--text-strong)]">Organization Verification</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Complete the steps below to verify your institution on SkillKollab.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-subtle)]">
          {[
            { num: 1, label: 'Institution Info', icon: Building2 },
            { num: 2, label: 'Representative', icon: User },
            { num: 3, label: 'Documents', icon: FileText },
            { num: 4, label: 'Review', icon: CheckCircle2 }
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors ${
                  step >= s.num ? 'bg-emerald-500 text-white' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                }`}>
                  <s.icon size={18} />
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${step >= s.num ? 'text-emerald-600' : 'text-[var(--text-muted)]'}`}>{s.label}</span>
              </div>
              {i < 3 && (
                <div className={`h-1 flex-1 mx-2 rounded-full transition-colors ${step > s.num ? 'bg-emerald-500' : 'bg-[var(--border-subtle)]'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-6 md:p-8 shadow-sm">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-lg font-bold text-[var(--text-strong)] mb-4 border-b border-[var(--border-subtle)] pb-2">Organization Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Organization Name</label>
                    <input type="text" className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm" value={formData.orgName} onChange={e => updateForm('orgName', e.target.value)} placeholder="e.g. Stanford University" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Organization Type</label>
                    <select className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm" value={formData.orgType} onChange={e => updateForm('orgType', e.target.value)}>
                      <option>University</option>
                      <option>College</option>
                      <option>Research Institution</option>
                      <option>Government Organization</option>
                      <option>NGO</option>
                      <option>Corporate Organization</option>
                      <option>Startup Incubator</option>
                      <option>Industry Lab</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Official Organization Email</label>
                    <input type="email" className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm" value={formData.officialEmail} onChange={e => updateForm('officialEmail', e.target.value)} placeholder="admin@stanford.edu" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Country</label>
                    <input type="text" className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm" value={formData.country} onChange={e => updateForm('country', e.target.value)} placeholder="United States" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">State / Region</label>
                    <input type="text" className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm" value={formData.state} onChange={e => updateForm('state', e.target.value)} placeholder="California" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">City</label>
                    <input type="text" className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm" value={formData.city} onChange={e => updateForm('city', e.target.value)} placeholder="Stanford" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Official Website</label>
                    <input type="url" className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm" value={formData.website} onChange={e => updateForm('website', e.target.value)} placeholder="https://stanford.edu" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Organization Description</label>
                    <textarea rows="3" className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm" value={formData.description} onChange={e => updateForm('description', e.target.value)} placeholder="Brief overview of the institution..." />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-lg font-bold text-[var(--text-strong)] mb-4 border-b border-[var(--border-subtle)] pb-2">Authorized Representative</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Representative Name</label>
                    <input type="text" className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm" value={formData.repName} onChange={e => updateForm('repName', e.target.value)} />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Designation</label>
                    <input type="text" className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm" value={formData.repDesignation} onChange={e => updateForm('repDesignation', e.target.value)} placeholder="e.g. Director of Innovation" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Official Email</label>
                    <input type="email" className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm" value={formData.repEmail} onChange={e => updateForm('repEmail', e.target.value)} />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Phone Number</label>
                    <input type="tel" className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm" value={formData.repPhone} onChange={e => updateForm('repPhone', e.target.value)} />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-lg font-bold text-[var(--text-strong)] mb-4 border-b border-[var(--border-subtle)] pb-2">Verification Documents</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">Upload official documents to verify your institution. Only authorized admins will review these.</p>
                <div className="border-2 border-dashed border-[var(--border-strong)] rounded-2xl p-8 text-center bg-[var(--bg-surface)]">
                  <FileText className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                  <p className="text-sm font-bold text-[var(--text-strong)]">Drag & drop files or click to browse</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Accepts PDF, JPG, PNG (Max 10MB)</p>
                  <button className="mt-4 px-4 py-2 rounded-xl border border-[var(--border-strong)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors">
                    Browse Files
                  </button>
                  <div className="mt-4 text-left">
                    <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 p-2 rounded-lg"><CheckCircle2 size={14}/> simulated_accreditation.pdf</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-lg font-bold text-[var(--text-strong)] mb-4 border-b border-[var(--border-subtle)] pb-2">Review Information</h3>
                <div className="bg-[var(--bg-surface)] rounded-2xl p-6 border border-[var(--border-subtle)] space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Organization Name</p>
                      <p className="text-sm font-bold text-[var(--text-strong)]">{formData.orgName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Type</p>
                      <p className="text-sm font-bold text-[var(--text-strong)]">{formData.orgType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Location</p>
                      <p className="text-sm font-bold text-[var(--text-strong)]">{formData.city}, {formData.country}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Representative</p>
                      <p className="text-sm font-bold text-[var(--text-strong)]">{formData.repName || 'N/A'} - {formData.repDesignation}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[var(--border-subtle)]">
                    <p className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      I confirm that I am an authorized representative of {formData.orgName || 'this organization'} and the information provided is accurate.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <button 
              onClick={handlePrev}
              disabled={step === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                step === 1 ? 'opacity-50 cursor-not-allowed text-[var(--text-muted)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              <ArrowLeft size={16} /> Back
            </button>
            
            {step < 4 ? (
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-md"
              >
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-md"
              >
                {loading ? 'Submitting...' : 'Submit for Verification'} <CheckCircle2 size={16} />
              </button>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default SignupOrganizationPage;
