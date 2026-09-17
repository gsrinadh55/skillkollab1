import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ArrowLeft, CheckCircle2, Sparkles, PlusCircle, Trash2, Tag, 
  Briefcase, Users, FileText, Gift, Calendar, Rocket, ShieldCheck, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { challengesService } from '../../services/firebase/challenges';

const CATEGORIES = [
  'AI', 'Healthcare', 'Climate', 'FinTech', 'Education', 'IoT', 
  'Cyber Security', 'Blockchain', 'Robotics', 'Other'
];

const SDGS = [
  'SDG 1 - No Poverty', 'SDG 2 - Zero Hunger', 'SDG 3 - Good Health',
  'SDG 4 - Quality Education', 'SDG 5 - Gender Equality', 'SDG 6 - Clean Water',
  'SDG 7 - Clean Energy', 'SDG 8 - Decent Work', 'SDG 9 - Industry & Innovation',
  'SDG 10 - Reduced Inequalities', 'SDG 11 - Sustainable Cities', 'SDG 12 - Responsible Consumption',
  'SDG 13 - Climate Action', 'SDG 14 - Life Below Water', 'SDG 15 - Life on Land',
  'SDG 16 - Strong Institutions', 'SDG 17 - Partnerships for the Goals'
];

export function ManageChallengePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    title: '',
    organization: user?.profile?.organization || user?.name || '',
    category: CATEGORIES[0],
    industry: '',
    difficulty: 'Intermediate',
    problemStatement: '',
    description: '',
    expectedOutcome: '',
    
    // Step 2
    impactArea: '',
    sdgGoals: [],
    impactDescription: '',

    // Step 3
    requiredSkills: [],

    // Step 4
    minTeamSize: 2,
    maxTeamSize: 5,
    roles: [],

    // Step 5
    startDate: '',
    endDate: '',
    workModel: 'Remote',
    sprintDuration: '2 weeks',

    // Step 6
    rewardType: 'Stipend',
    rewardAmount: '',
    additionalRecognition: '',

    // Step 7
    applicationDeadline: '',
    requireResume: false,
    requirePortfolio: false,
    requireGithub: false,
    allowStudents: true
  });

  const [loadingChallenge, setLoadingChallenge] = useState(true);

  React.useEffect(() => {
    const loadChallenge = async () => {
      try {
        const data = await challengesService.getChallengeById(id);
        if (data) {
          setFormData({
            title: data.title || '',
            organization: data.organization || user?.profile?.organization || user?.name || '',
            category: data.category || CATEGORIES[0],
            industry: data.industry || '',
            difficulty: data.difficulty || 'Intermediate',
            problemStatement: data.problemStatement || '',
            description: data.description || '',
            expectedOutcome: data.expectedOutcome || '',
            impactArea: data.impactArea || '',
            sdgGoals: data.sdgGoals || [],
            impactDescription: data.impactDescription || '',
            requiredSkills: data.requiredSkills || [],
            minTeamSize: data.minTeamSize || 2,
            maxTeamSize: data.maxTeamSize || 5,
            roles: data.roles || [],
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            workModel: data.workModel || 'Remote',
            sprintDuration: data.sprintDuration || '2 weeks',
            rewardType: data.rewardType || 'Stipend',
            rewardAmount: data.rewardAmount || '',
            additionalRecognition: data.additionalRecognition || '',
            applicationDeadline: data.applicationDeadline || '',
            requireResume: data.requireResume || false,
            requirePortfolio: data.requirePortfolio || false,
            requireGithub: data.requireGithub || false,
            allowStudents: data.allowStudents !== undefined ? data.allowStudents : true
          });
        }
      } catch (err) {
        toast.error("Failed to load challenge data.");
      } finally {
        setLoadingChallenge(false);
      }
    };
    loadChallenge();
  }, [id, user]);

  // Local UI State
  const [newSkill, setNewSkill] = useState('');
  
  // New Role Form
  const [newRole, setNewRole] = useState({ name: '', count: 1, skills: '', description: '' });

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setStep(s => Math.min(8, s + 1));
  const handleBack = () => setStep(s => Math.max(1, s - 1));

  // Skills
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !formData.requiredSkills.includes(newSkill.trim())) {
      updateForm('requiredSkills', [...formData.requiredSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    updateForm('requiredSkills', formData.requiredSkills.filter(s => s !== skill));
  };

  // Roles
  const handleAddRole = (e) => {
    e.preventDefault();
    if (newRole.name.trim()) {
      updateForm('roles', [...formData.roles, { ...newRole, skills: newRole.skills.split(',').map(s => s.trim()).filter(Boolean) }]);
      setNewRole({ name: '', count: 1, skills: '', description: '' });
    }
  };

  const handleRemoveRole = (index) => {
    updateForm('roles', formData.roles.filter((_, i) => i !== index));
  };

  const handleSaveToFirebase = async (status) => {
    if (!user || !user.uid) {
      toast.error('Authentication error. Please sign in again.');
      return;
    }

    // Basic Validation before publish
    if (status === 'PUBLISHED') {
      if (!formData.title || !formData.problemStatement || !formData.category) {
        toast.error('Please fill out all required fields before publishing.');
        setStep(1);
        return;
      }
    }

    setIsSubmitting(true);
    const toastId = toast.loading(status === 'DRAFT' ? 'Saving draft...' : 'Publishing challenge...');

    try {
      const challengeData = {
        ...formData,
        status,
        creatorId: user.uid,
        creatorName: user.name || 'Innovation Lead',
        creatorAvatar: user.avatarUrl || null,
        applicantCount: 0,
        views: 0,
        bookmarksCount: 0
      };

      await challengesService.updateChallenge(id, challengeData);
      
      toast.success('Challenge updated successfully!', { id: toastId });
      navigate('/my-challenges');
    } catch (error) {
      console.error('Error saving challenge:', error);
      toast.error('Failed to save challenge.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Steps
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-[var(--text-strong)] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--color-primary)]" /> Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Challenge Title <span className="text-rose-500">*</span></label>
                <input type="text" value={formData.title} onChange={e => updateForm('title', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors" placeholder="e.g. Autonomous AI Code Review" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Organization / Company</label>
                <input type="text" value={formData.organization} onChange={e => updateForm('organization', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Category <span className="text-rose-500">*</span></label>
                <select value={formData.category} onChange={e => updateForm('category', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Industry</label>
                <input type="text" value={formData.industry} onChange={e => updateForm('industry', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors" placeholder="e.g. HealthTech, EdTech" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Difficulty <span className="text-rose-500">*</span></label>
                <select value={formData.difficulty} onChange={e => updateForm('difficulty', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Problem Statement <span className="text-rose-500">*</span></label>
                <textarea rows={3} value={formData.problemStatement} onChange={e => updateForm('problemStatement', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors" placeholder="What specific problem are you trying to solve?" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Detailed Description <span className="text-rose-500">*</span></label>
                <textarea rows={5} value={formData.description} onChange={e => updateForm('description', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors" placeholder="Provide background context and detailed requirements..." />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Expected Outcome <span className="text-rose-500">*</span></label>
                <textarea rows={3} value={formData.expectedOutcome} onChange={e => updateForm('expectedOutcome', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors" placeholder="What deliverables or results are expected at the end of this challenge?" />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-[var(--text-strong)] flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Impact & SDG
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Impact Area</label>
                <input type="text" value={formData.impactArea} onChange={e => updateForm('impactArea', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors" placeholder="e.g. Carbon Reduction, Accessibility" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Sustainable Development Goals (SDGs)</label>
                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl max-h-60 overflow-y-auto custom-scrollbar">
                  {SDGS.map(sdg => (
                    <label key={sdg} className="flex items-center gap-3 p-2 hover:bg-[var(--bg-card-hover)] rounded-lg cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.sdgGoals.includes(sdg)}
                        onChange={(e) => {
                          if (e.target.checked) updateForm('sdgGoals', [...formData.sdgGoals, sdg]);
                          else updateForm('sdgGoals', formData.sdgGoals.filter(s => s !== sdg));
                        }}
                        className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--border-strong)] bg-transparent"
                      />
                      <span className="text-sm text-[var(--text-primary)]">{sdg}</span>
                    </label>
                  ))}
                </div>
                {formData.sdgGoals.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.sdgGoals.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 text-[11px] font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Impact Description</label>
                <textarea rows={4} value={formData.impactDescription} onChange={e => updateForm('impactDescription', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors" placeholder="How does this project contribute to the selected SDGs or impact areas?" />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-[var(--text-strong)] flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-500" /> Required Skills
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">Add technical and soft skills required for the overall project.</p>
            
            <form onSubmit={handleAddSkill} className="flex gap-3">
              <input 
                type="text" 
                value={newSkill} 
                onChange={e => setNewSkill(e.target.value)} 
                className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors" 
                placeholder="e.g. React.js, Python, Figma" 
              />
              <button type="submit" className="px-5 py-3 rounded-xl font-bold bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:bg-[var(--color-primary)] hover:text-white hover:border-transparent transition-all cursor-pointer">
                Add Skill
              </button>
            </form>

            <div className="p-6 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl min-h-[150px] flex flex-wrap gap-3 items-start content-start">
              {formData.requiredSkills.length === 0 ? (
                <span className="text-sm text-[var(--text-muted)] italic">No skills added yet.</span>
              ) : (
                formData.requiredSkills.map(skill => (
                  <span key={skill} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-strong)] text-sm font-semibold shadow-sm">
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-[var(--text-muted)] hover:text-rose-500 cursor-pointer transition-colors">
                      &times;
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-[var(--text-strong)] flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" /> Team Requirements
            </h3>
            
            <div className="grid grid-cols-2 gap-5 mb-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Minimum Team Size</label>
                <input type="number" min="1" value={formData.minTeamSize} onChange={e => updateForm('minTeamSize', parseInt(e.target.value))} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Maximum Team Size</label>
                <input type="number" min={formData.minTeamSize} value={formData.maxTeamSize} onChange={e => updateForm('maxTeamSize', parseInt(e.target.value))} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] outline-none" />
              </div>
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-6 space-y-4">
              <h4 className="text-md font-bold text-[var(--text-strong)]">Add Required Roles</h4>
              
              <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-2xl space-y-4 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Role Name</label>
                    <input type="text" value={newRole.name} onChange={e => setNewRole({...newRole, name: e.target.value})} className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" placeholder="e.g. Frontend Developer" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Positions</label>
                    <input type="number" min="1" value={newRole.count} onChange={e => setNewRole({...newRole, count: parseInt(e.target.value)})} className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Role-Specific Skills (comma separated)</label>
                  <input type="text" value={newRole.skills} onChange={e => setNewRole({...newRole, skills: e.target.value})} className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" placeholder="e.g. React, UI/UX" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Role Description</label>
                  <textarea rows={2} value={newRole.description} onChange={e => setNewRole({...newRole, description: e.target.value})} className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" placeholder="What will this person do?" />
                </div>
                <button type="button" onClick={handleAddRole} className="w-full py-2.5 rounded-xl font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors cursor-pointer text-sm flex items-center justify-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Add Role Requirement
                </button>
              </div>

              {/* Roles List */}
              <div className="space-y-3 mt-5">
                {formData.roles.map((r, i) => (
                  <div key={i} className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card)]">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h5 className="font-bold text-sm text-[var(--text-strong)]">{r.name}</h5>
                        <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">{r.count} Position(s)</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{r.description}</p>
                      {r.skills && r.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {r.skills.map(s => <span key={s} className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)]">{s}</span>)}
                        </div>
                      )}
                    </div>
                    <button onClick={() => handleRemoveRole(i)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg self-start cursor-pointer transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-[var(--text-strong)] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-500" /> Timeline & Work Model
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Expected Start Date</label>
                <input type="date" value={formData.startDate} onChange={e => updateForm('startDate', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Expected End Date</label>
                <input type="date" value={formData.endDate} onChange={e => updateForm('endDate', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Work Model</label>
                <select value={formData.workModel} onChange={e => updateForm('workModel', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] outline-none">
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Sprint Duration</label>
                <select value={formData.sprintDuration} onChange={e => updateForm('sprintDuration', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] outline-none">
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="4 weeks">4 weeks</option>
                  <option value="8 weeks">8 weeks</option>
                  <option value="12 weeks">12 weeks</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-[var(--text-strong)] flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-500" /> Reward & Recognition
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Reward Type</label>
                <select value={formData.rewardType} onChange={e => updateForm('rewardType', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] outline-none">
                  <option value="Grant">Grant</option>
                  <option value="Stipend">Stipend</option>
                  <option value="Research Fellowship">Research Fellowship</option>
                  <option value="Internship">Internship</option>
                  <option value="Equity">Equity</option>
                  <option value="Certificate">Certificate</option>
                  <option value="Mentorship">Mentorship</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Reward Amount (Optional)</label>
                <input type="text" value={formData.rewardAmount} onChange={e => updateForm('rewardAmount', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] outline-none" placeholder="e.g. $5,000 or 'Negotiable'" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Additional Recognition</label>
                <textarea rows={3} value={formData.additionalRecognition} onChange={e => updateForm('additionalRecognition', e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] outline-none" placeholder="E.g. Featured in newsletter, letter of recommendation..." />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-[var(--text-strong)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Application Settings
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Application Deadline <span className="text-rose-500">*</span></label>
                <input type="date" value={formData.applicationDeadline} onChange={e => updateForm('applicationDeadline', e.target.value)} className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] outline-none" />
              </div>

              <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
                <h4 className="text-sm font-bold text-[var(--text-strong)]">Submission Requirements</h4>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-10 h-6 rounded-full transition-colors relative ${formData.allowStudents ? 'bg-[var(--color-primary)]' : 'bg-[var(--border-strong)]'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${formData.allowStudents ? 'left-5' : 'left-1'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.allowStudents} onChange={e => updateForm('allowStudents', e.target.checked)} />
                  <span className="text-sm font-medium">Allow students to apply</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-10 h-6 rounded-full transition-colors relative ${formData.requireResume ? 'bg-[var(--color-primary)]' : 'bg-[var(--border-strong)]'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${formData.requireResume ? 'left-5' : 'left-1'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.requireResume} onChange={e => updateForm('requireResume', e.target.checked)} />
                  <span className="text-sm font-medium">Require Resume / CV</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-10 h-6 rounded-full transition-colors relative ${formData.requirePortfolio ? 'bg-[var(--color-primary)]' : 'bg-[var(--border-strong)]'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${formData.requirePortfolio ? 'left-5' : 'left-1'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.requirePortfolio} onChange={e => updateForm('requirePortfolio', e.target.checked)} />
                  <span className="text-sm font-medium">Require Portfolio link</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-10 h-6 rounded-full transition-colors relative ${formData.requireGithub ? 'bg-[var(--color-primary)]' : 'bg-[var(--border-strong)]'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${formData.requireGithub ? 'left-5' : 'left-1'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.requireGithub} onChange={e => updateForm('requireGithub', e.target.checked)} />
                  <span className="text-sm font-medium">Require GitHub profile</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center pb-4 border-b border-[var(--border-subtle)]">
              <Rocket className="w-12 h-12 text-[var(--color-primary)] mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-[var(--text-strong)]">Final Review</h3>
              <p className="text-sm text-[var(--text-secondary)]">Review your challenge details before publishing.</p>
            </div>
            
            <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-2xl p-6 space-y-6">
              <div>
                <span className="text-xs font-bold text-[var(--color-primary)] uppercase bg-[var(--color-primary)]/10 px-2 py-1 rounded mb-2 inline-block">{formData.category} • {formData.difficulty}</span>
                <h4 className="text-xl font-bold text-[var(--text-strong)]">{formData.title || 'Untitled Challenge'}</h4>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{formData.organization}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-bold text-[var(--text-strong)] mb-1">Problem Statement</h5>
                <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-card)] p-3 rounded-lg border border-[var(--border-subtle)]">{formData.problemStatement || 'Not provided'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Team Size</h5>
                  <p className="text-sm text-[var(--text-strong)] font-semibold">{formData.minTeamSize} - {formData.maxTeamSize} Members</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Timeline & Work</h5>
                  <p className="text-sm text-[var(--text-strong)] font-semibold">{formData.workModel} • {formData.sprintDuration}</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Reward</h5>
                  <p className="text-sm text-[var(--text-strong)] font-semibold">{formData.rewardType} {formData.rewardAmount ? `- ${formData.rewardAmount}` : ''}</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Deadline</h5>
                  <p className="text-sm text-[var(--text-strong)] font-semibold text-rose-500">{formData.applicationDeadline || 'None set'}</p>
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-bold text-[var(--text-strong)] mb-2">Required Skills</h5>
                <div className="flex flex-wrap gap-1.5">
                  {formData.requiredSkills.length > 0 ? (
                    formData.requiredSkills.map(s => <span key={s} className="text-xs px-2 py-1 rounded bg-[var(--bg-card)] border border-[var(--border-strong)]">{s}</span>)
                  ) : (
                    <span className="text-xs text-[var(--text-muted)] italic">No specific skills</span>
                  )}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-bold text-[var(--text-strong)] mb-2">Roles ({formData.roles.length})</h5>
                {formData.roles.length > 0 ? (
                  <div className="space-y-2">
                    {formData.roles.map((r, i) => (
                      <div key={i} className="flex justify-between items-center bg-[var(--bg-card)] p-2 rounded-lg border border-[var(--border-subtle)]">
                        <span className="text-sm font-semibold">{r.name}</span>
                        <span className="text-xs font-bold bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded">{r.count} Position(s)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-[var(--text-muted)] italic">No specific roles defined</span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button 
                onClick={() => navigate(`/projects/${id}`)}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-xl font-bold bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer disabled:opacity-50"
              >
                View Challenge
              </button>
              <button 
                onClick={() => navigate(`/applications`)}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-xl font-bold bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer disabled:opacity-50"
              >
                View Applications
              </button>
              <button 
                onClick={() => handleSaveToFirebase('PUBLISHED')}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-xl font-bold bg-[var(--color-primary)] text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-strong)] tracking-tight">Manage Challenge</h1>
          <p className="text-[var(--text-secondary)] mt-1">Update challenge details, rewards, and requirements.</p>
        </div>

        {/* Wizard Container */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-xl overflow-hidden">
          {/* Progress Bar Header */}
          <div className="flex items-center px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="flex-1">
              <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">Step {step} of 8</span>
              <div className="flex gap-1 mt-2">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className={`h-1.5 rounded-full flex-1 transition-colors ${i <= step ? 'bg-[var(--color-primary)]' : 'bg-[var(--border-strong)]'}`} />
                ))}
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="p-6 sm:p-8 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Footer Controls */}
          {step < 8 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <button 
                onClick={handleBack}
                disabled={step === 1 || isSubmitting}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-sm ${step === 1 ? 'opacity-0 pointer-events-none' : 'bg-white dark:bg-slate-800 border border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)] cursor-pointer'}`}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-[var(--color-primary)] text-white hover:bg-indigo-600 shadow-md hover:shadow-lg transition-all cursor-pointer text-sm"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ManageChallengePage;
