import { createSlice } from '@reduxjs/toolkit';

const INITIAL_APPLICATIONS = [];

const applicationsSlice = createSlice({
  name: 'applications',
  initialState: {
    list: INITIAL_APPLICATIONS,
    selectedApplicationId: null,
    filterStatus: 'All',
    workspaceUnlocked: false,
  },
  reducers: {
    submitNewApplication: (state, action) => {
      const newApp = {
        id: `app_${Date.now()}`,
        challengeId: action.payload.challengeId,
        challengeTitle: action.payload.challengeTitle || 'Innovative Collaboration Solution',
        candidateName: action.payload.candidateName || 'User',
        roleApplied: action.payload.roleApplied,
        aiMatchScore: Math.floor(Math.random() * (99 - 88 + 1)) + 88,
        status: 'Pending',
        appliedDate: 'Just now',
        workspaceUnlocked: false,
        ...action.payload
      };
      state.list.unshift(newApp);
    },
    acceptCandidateApplication: (state, action) => {
      const id = action.payload;
      const app = state.list.find(a => a.id === id);
      if (app) {
        app.status = 'Accepted';
        app.workspaceUnlocked = true;
      }
      state.workspaceUnlocked = true;
    },
    rejectCandidateApplication: (state, action) => {
      const id = action.payload;
      const app = state.list.find(a => a.id === id);
      if (app) {
        app.status = 'Rejected';
        app.workspaceUnlocked = false;
      }
    },
    scheduleInterview: (state, action) => {
      const id = action.payload;
      const app = state.list.find(a => a.id === id);
      if (app) {
        app.status = 'Interview';
      }
    },
    setApplicationFilter: (state, action) => {
      state.filterStatus = action.payload;
    },
    grantDemoWorkspaceAccess: (state) => {
      state.workspaceUnlocked = true;
      state.list.forEach(a => { a.workspaceUnlocked = true; a.status = 'Accepted'; });
    }
  }
});

export const { 
  submitNewApplication, 
  acceptCandidateApplication, 
  rejectCandidateApplication, 
  scheduleInterview, 
  setApplicationFilter,
  grantDemoWorkspaceAccess
} = applicationsSlice.actions;
export default applicationsSlice.reducer;
