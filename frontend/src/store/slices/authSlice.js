import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    activeRole: null, 
    onboardingCompleted: false,
    profile: null,
  },
  reducers: {
    setActiveRole: (state, action) => {
      state.activeRole = action.payload;
    },
    completeOnboardingWizard: (state, action) => {
      state.onboardingCompleted = true;
      if (action.payload) {
        state.activeRole = action.payload;
      }
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    addXp: (state, action) => {
      if (state.profile) {
        state.profile.xp = (state.profile.xp || 0) + action.payload;
        if (!state.profile.nextLevelXp) state.profile.nextLevelXp = 500;
        if (!state.profile.level) state.profile.level = 1;
        while (state.profile.xp >= state.profile.nextLevelXp) {
          state.profile.level += 1;
          state.profile.nextLevelXp = Math.floor(state.profile.nextLevelXp * 1.25);
        }
      }
    },
    resetOnboardingForDemo: (state) => {
      state.onboardingCompleted = false;
    }
  }
});

export const { setActiveRole, completeOnboardingWizard, updateProfile, addXp, resetOnboardingForDemo } = authSlice.actions;
export default authSlice.reducer;
