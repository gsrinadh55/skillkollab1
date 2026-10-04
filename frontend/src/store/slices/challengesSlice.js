import { createSlice } from '@reduxjs/toolkit';

const MOCK_CHALLENGES = [];

const challengesSlice = createSlice({
  name: 'challenges',
  initialState: {
    list: MOCK_CHALLENGES,
    activeChallengeId: 'ch-1',
    filters: {
      search: '',
      difficulty: 'All',
      category: 'All',
      techStack: 'All',
      industry: 'All',
      duration: 'All',
      workMode: 'All',
      experienceLevel: 'All'
    },
    myPublishedChallenges: [],
    aiSuggestions: []
  },
  reducers: {
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        difficulty: 'All',
        category: 'All',
        techStack: 'All',
        industry: 'All',
        duration: 'All',
        workMode: 'All',
        experienceLevel: 'All'
      };
    },
    toggleBookmark: (state, action) => {
      const id = action.payload;
      const ch = state.list.find(c => c.id === id);
      if (ch) {
        ch.isBookmarked = !ch.isBookmarked;
        ch.bookmarksCount += ch.isBookmarked ? 1 : -1;
      }
    },
    setActiveChallenge: (state, action) => {
      state.activeChallengeId = action.payload;
    },
    addPublishedChallenge: (state, action) => {
      state.myPublishedChallenges.unshift(action.payload);
      state.list.unshift({ ...action.payload, views: 1, bookmarksCount: 0, acceptanceRate: '0%' });
    }
  }
});

export const { setFilter, resetFilters, toggleBookmark, setActiveChallenge, addPublishedChallenge } = challengesSlice.actions;
export default challengesSlice.reducer;
