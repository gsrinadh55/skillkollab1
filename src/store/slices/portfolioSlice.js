import { createSlice } from '@reduxjs/toolkit';

const INITIAL_COMPLETED_PROJECTS = [];

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState: {
    list: INITIAL_COMPLETED_PROJECTS,
    projects: INITIAL_COMPLETED_PROJECTS,
    selectedProjectId: null,
    filterCategory: 'All'
  },
  reducers: {
    addProjectToPortfolio: (state, action) => {
      const newProj = {
        id: `proj-${Date.now()}`,
        title: action.payload.title,
        role: action.payload.role || 'Lead Contributor',
        category: action.payload.category || 'AI & Web3',
        description: action.payload.description || 'Verified production case study.',
        skills: action.payload.skills || ['React.js', 'Tailwind', 'AI'],
        outcomes: action.payload.outcomes || 'Verified Production Metric',
        likes: 1,
        comments: 0,
        isLiked: true,
        image: action.payload.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
        rating: action.payload.rating || '5.0 ⭐ Verified Excellence'
      };
      state.list.unshift(newProj);
      state.projects.unshift(newProj);
    },
    setSelectedProject: (state, action) => {
      state.selectedProjectId = action.payload;
    },
    toggleLikeProject: (state, action) => {
      const id = action.payload;
      const p = state.list.find(x => x.id === id) || state.projects.find(x => x.id === id);
      if (p) {
        p.isLiked = !p.isLiked;
        p.likes += p.isLiked ? 1 : -1;
      }
    }
  }
});

export const { 
  addProjectToPortfolio, 
  setSelectedProject,
  toggleLikeProject 
} = portfolioSlice.actions;

export const addPortfolioProject = addProjectToPortfolio;

export default portfolioSlice.reducer;
