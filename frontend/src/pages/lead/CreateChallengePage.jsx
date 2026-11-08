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
import { api } from '../../services/api';
import { challengesService } from '../../services/firebase/challenges';
import { teamsService } from '../../services/firebase/teams';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

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

export function CreateChallengePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftId, setDraftId] = useState(null);

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
    // Step 7: AI Team Recommendation (no form fields, just state)
    aiRecommendationsFetched: false
  });

  // Local UI State
  const [newSkill, setNewSkill] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [isFetchingRecommendations, setIsFetchingRecommendations] = useState(false);
  
  // New Role Form
  const [newRole, setNewRole] = useState({ name: '', count: 1, skills: '', description: '' });
  const [isAddingRole, setIsAddingRole] = useState(false);

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setStep(s => Math.min(8, s + 1));
  const handleBack = () => setStep(s => Math.max(1, s - 1));

  const getDefaultRoles = () => {
    const skills = formData.requiredSkills.length > 0 ? formData.requiredSkills : ['React', 'Node.js', 'Python'];
    const titleWords = formData.title ? formData.title.split(' ')[0] : 'Project';
    
    return [
      {
        roleId: `role_${Date.now()}_0`,
        name: 'Full Stack Lead Developer',
        description: `Lead component development, state management, and backend API integrations for ${titleWords}.`,
        whyRecommended: 'Essential for driving end-to-end feature delivery and user workflows.',
        skills: skills.slice(0, 3),
        count: 1,
        filledSlots: 0,
        status: 'OPEN',
        recommendationSource: 'PROJECT_ANALYSIS'
      },
      {
        roleId: `role_${Date.now()}_1`,
        name: 'AI/ML Systems Engineer',
        description: `Design data pipelines, prompt evaluation strategies, and intelligence features for ${titleWords}.`,
        whyRecommended: 'Recommended for smart data processing, API connectors, and model evaluation.',
        skills: [...skills.slice(0, 1), 'Python', 'REST APIs', 'Gemini API'].slice(0, 4),
        count: 1,
        filledSlots: 0,
        status: 'OPEN',
        recommendationSource: 'PROJECT_ANALYSIS'
      },
      {
        roleId: `role_${Date.now()}_2`,
        name: 'UI/UX Product Designer',
        description: `Craft modern glassmorphic interface designs, micro-animations, and responsive layouts.`,
        whyRecommended: 'Ensures intuitive user experience, accessible design systems, and rapid prototyping.',
        skills: ['Figma', 'UI/UX', 'Tailwind CSS', 'Wireframing'],
        count: 1,
        filledSlots: 0,
        status: 'OPEN',
        recommendationSource: 'PROJECT_ANALYSIS'
      }
    ];
  };

  React.useEffect(() => {
    if (step === 7 && formData.roles.length === 0) {
      updateForm('roles', getDefaultRoles());
    }
  }, [step]);

  const generateAIRoles = async () => {
    setIsFetchingRecommendations(true);
    
    try {
      const response = await api.post('/ai/recommend-roles', {
        title: formData.title,
        description: formData.description,
        problemStatement: formData.problemStatement,
        category: formData.category,
        difficulty: formData.difficulty,
        maxTeamSize: formData.maxTeamSize,
        requiredSkills: formData.requiredSkills
      });

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const aiRoles = response.data.data.map((r, idx) => ({
          roleId: `role_${Date.now()}_${idx}`,
          name: r.name,
          description: r.description,
          whyRecommended: r.description,
          skills: r.skills || [],
          count: r.count || 1,
          filledSlots: 0,
          status: 'OPEN',
          recommendationSource: 'AI_PROJECT_ANALYSIS'
        }));
        updateForm('roles', aiRoles);
      } else {
        updateForm('roles', getDefaultRoles());
      }
    } catch (error) {
      console.warn('Error fetching AI role recommendations, using default roles:', error);
      updateForm('roles', getDefaultRoles());
    } finally {
      setIsFetchingRecommendations(false);
    }
  };

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
      setIsAddingRole(false);
    }
  };

  const handleRemoveRole = (index) => {
    updateForm('roles', formData.roles.filter((_, i) => i !== index));
  };

  const handleSaveToServer = async (status) => {
    if (isSubmitting) return;

    if (!user) {
      toast.error('Authentication error. Please sign in again.');
      return;
    }

    // Validation
    if (status === 'PUBLISHED') {
      if (!formData.title || formData.title.length < 5) {
        toast.error('Please enter a challenge title (min 5 characters).');
        setStep(1); return;
      }
      if (!formData.description || formData.description.length < 20) {
        toast.error('Detailed description is required (min 20 characters).');
        setStep(1); return;
      }
      if (!formData.problemStatement || formData.problemStatement.length < 30) {
        toast.error('Problem statement is required (min 30 characters).');
        setStep(1); return;
      }
      if (!formData.category) {
        toast.error('Category is required.');
        setStep(1); return;
      }
      if (formData.roles.length === 0) {
        toast.error('Please add at least one role for published challenges.');
        setStep(7); return;
      }
    } else {
      if (!formData.title || formData.title.length < 5) {
        toast.error('Please enter a challenge title (min 5 characters) to save a draft.');
        return;
      }
    }

    setIsSubmitting(true);
    const toastId = toast.loading(status === 'DRAFT' ? 'Saving draft...' : 'Publishing challenge...');

    try {
      const currentUserId = user?.uid || user?.id || user?._id;
      const currentUserName = user?.name || user?.displayName || user?.email?.split('@')[0] || 'Innovation Lead';
      const currentUserAvatar = user?.avatarUrl || user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

      const challengeData = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.description ? formData.description.slice(0, 160) : '',
        problemStatement: formData.problemStatement,
        category: formData.category,
        industry: formData.industry || 'Technology',
        difficulty: formData.difficulty,
        expectedOutcome: formData.expectedOutcome || '',
        impactArea: formData.impactArea || '',
        sdgGoals: formData.sdgGoals || [],
        impactDescription: formData.impactDescription || '',
        requiredSkills: formData.requiredSkills || [],
        minTeamSize: formData.minTeamSize || 2,
        maxTeamSize: formData.maxTeamSize || 5,
        startDate: formData.startDate || '',
        endDate: formData.endDate || '',
        workMode: formData.workModel || 'Remote',
        workModel: formData.workModel || 'Remote',
        sprintDuration: formData.sprintDuration || '4 Weeks',
        rewardType: formData.rewardType || 'Bounty',
        rewardAmount: formData.rewardAmount || '',
        additionalRecognition: formData.additionalRecognition || '',
        status: status,
        creatorId: currentUserId,
        ownerId: currentUserId,
        leadId: currentUserId,
        creatorName: currentUserName,
        creatorAvatar: currentUserAvatar,
        organization: formData.organization || user?.profile?.organization || currentUserName,
        applicantCount: 0,
        views: 0,
        bookmarksCount: 0,
        roles: formData.roles.map(r => ({
          name: r.name,
          count: r.count || 1,
          skills: r.skills || [],
          description: r.description || ''
        }))
      };

      // 1. Save to Firebase Firestore (source of truth for challenges)
      let savedChallengeId = null;
      try {
        if (draftId) {
          await challengesService.updateChallenge(draftId, challengeData);
          savedChallengeId = draftId;
        } else {
          savedChallengeId = await challengesService.createChallenge(challengeData);
        }
      } catch (fbErr) {
        console.warn('Firebase createChallenge error:', fbErr);
      }

      // 2. Automatically create Team in Firebase for published challenges
      if (savedChallengeId && status === 'PUBLISHED') {
        try {
          await teamsService.createTeam(savedChallengeId, currentUserId, `${formData.title} Team`);
        } catch (teamErr) {
          console.warn('Team creation error:', teamErr);
        }
      }

      // 3. Save / sync to backend API concurrently
      try {
        const apiPayload = {
          ...challengeData,
          id: savedChallengeId || undefined,
          roles: formData.roles
        };
        if (draftId) {
          await api.put(`/projects/${draftId}`, apiPayload);
        } else {
          const apiRes = await api.post('/projects', apiPayload);
          if (!savedChallengeId) {
            savedChallengeId = apiRes.data?.id || apiRes.data?.data?.id || apiRes.id;
          }
        }
      } catch (apiErr) {
        console.warn('API save notice:', apiErr);
      }

      if (status === 'DRAFT') {
        if (!draftId && savedChallengeId) setDraftId(savedChallengeId);
        toast.success('Challenge saved as draft.', { id: toastId });
      } else {
        toast.success('🎉 Challenge published successfully!', { id: toastId });
        navigate('/my-challenges');
      }
    } catch (error) {
      console.error('Error saving challenge:', error);
      const errorMsg = error.message || error.response?.data?.message || 'Could not save the challenge. Please try again.';
      toast.error(errorMsg, { id: toastId });
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
            
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Minimum Team Size</label>
                <input type="number" min="1" value={formData.minTeamSize} onChange={e => updateForm('minTeamSize', parseInt(e.target.value))} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-strong)]">Maximum Team Size</label>
                <input type="number" min={formData.minTeamSize} value={formData.maxTeamSize} onChange={e => updateForm('maxTeamSize', parseInt(e.target.value))} className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] outline-none" />
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
              <Sparkles className="w-5 h-5 text-amber-500" /> AI Team & Role Recommendation
            </h3>
            
            {isFetchingRecommendations ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <LoadingSpinner text="Analyzing project and generating optimal roles..." />
              </div>
            ) : formData.roles.length === 0 ? (
              <div className="p-12 text-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border-strong)]">
                <Users className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
                <h4 className="text-lg font-bold text-[var(--text-strong)]">No roles generated.</h4>
                <p className="text-sm text-[var(--text-secondary)] mt-1">We couldn't generate roles based on your inputs.</p>
                <button type="button" onClick={generateAIRoles} className="mt-4 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg text-sm font-semibold hover:bg-[var(--bg-card-hover)] transition-colors">
                  Try Again
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-4 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">AI Analysis Complete</h4>
                    <p className="text-xs mt-1">Based on your project requirements, we recommend the following team structure. You can edit, remove, or add custom roles.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.roles.map((role, i) => (
                    <div key={role.roleId || i} className="bg-[var(--bg-card)] border border-[var(--border-strong)] p-5 rounded-2xl flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-bold text-[var(--text-strong)]">{role.name}</h4>
                          <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded mt-1 inline-block">
                            Match to Project: 98%
                          </span>
                        </div>
                        <span className="text-xs font-bold bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full">
                          {role.count} Slot(s)
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Why this role:</p>
                          <p className="text-sm text-[var(--text-secondary)]">{role.whyRecommended || role.description}</p>
                        </div>
                        
                        {role.skills && role.skills.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">Required Skills:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {role.skills.map(s => (
                                <span key={s} className="text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2 py-1 rounded">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--border-subtle)]">
                        <button type="button" className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)] transition-colors">
                          Edit Role
                        </button>
                        <button type="button" onClick={() => handleRemoveRole(i)} className="text-xs font-semibold px-3 py-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors">
                          Remove Role
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                  <button type="button" onClick={() => setIsAddingRole(!isAddingRole)} className="px-4 py-2 text-sm font-bold rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)] transition-colors flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> {isAddingRole ? 'Cancel Custom Role' : 'Add Custom Role'}
                  </button>
                  <button type="button" onClick={() => { updateForm('roles', []); generateAIRoles(); }} className="px-4 py-2 text-sm font-bold rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)] transition-colors flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Regenerate Recommendations
                  </button>
                </div>

                {isAddingRole && (
                  <form onSubmit={handleAddRole} className="mt-4 p-5 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl space-y-4">
                    <h4 className="text-sm font-bold text-[var(--text-strong)]">Add Custom Role</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold mb-1 block text-[var(--text-strong)]">Role Name *</label>
                        <input type="text" required value={newRole.name} onChange={e => setNewRole({...newRole, name: e.target.value})} className="w-full bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none" placeholder="e.g. UX Designer" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold mb-1 block text-[var(--text-strong)]">Number of Slots *</label>
                        <input type="number" min="1" required value={newRole.count} onChange={e => setNewRole({...newRole, count: parseInt(e.target.value) || 1})} className="w-full bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-semibold mb-1 block text-[var(--text-strong)]">Required Skills (comma separated)</label>
                        <input type="text" value={newRole.skills} onChange={e => setNewRole({...newRole, skills: e.target.value})} className="w-full bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none" placeholder="e.g. Figma, React, Prototyping" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-semibold mb-1 block text-[var(--text-strong)]">Role Description</label>
                        <textarea rows="2" value={newRole.description} onChange={e => setNewRole({...newRole, description: e.target.value})} className="w-full bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] outline-none" placeholder="Briefly describe what this role will do..." />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button type="submit" className="px-4 py-2 bg-[var(--color-primary)] text-white hover:bg-indigo-600 transition-colors text-sm font-bold rounded-lg shadow-sm">Save Role</button>
                    </div>
                  </form>
                )}
              </div>
            )}
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
                  <p className="text-sm text-[var(--text-strong)] font-semibold">{formData.workModel || 'Not specified'} • {formData.sprintDuration || 'Not specified'}</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Reward</h5>
                  <p className="text-sm text-[var(--text-strong)] font-semibold">
                    {formData.rewardType || 'Not specified'} 
                    {formData.rewardAmount && formData.rewardAmount.trim() !== '00\\' ? ` - ${formData.rewardAmount}` : ''}
                  </p>
                </div>
                </div>
              
              <div>
                <h5 className="text-sm font-bold text-[var(--text-strong)] mb-2">Required Skills</h5>
                <div className="flex flex-wrap gap-1.5">
                  {formData.requiredSkills.length > 0 ? (
                    formData.requiredSkills.map(s => <span key={s} className="text-xs px-2 py-1 rounded bg-[var(--bg-card)] border border-[var(--border-strong)]">{s}</span>)
                  ) : (
                    <span className="text-xs text-[var(--text-muted)] italic">Not specified</span>
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
                onClick={() => handleSaveToServer('DRAFT')}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-xl font-bold bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && !draftId ? 'Saving...' : 'Save Draft'}
              </button>
              <button 
                onClick={() => handleSaveToServer('PUBLISHED')}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-xl font-bold bg-[var(--color-primary)] text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Challenge'}
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-strong)] tracking-tight">Create a New Challenge</h1>
          <p className="text-[var(--text-secondary)] mt-1">Publish a verified real-world problem and find the right student innovators to solve it.</p>
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

export default CreateChallengePage;
