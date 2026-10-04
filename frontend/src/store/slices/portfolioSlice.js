import { createSlice } from '@reduxjs/toolkit';

const INITIAL_COMPLETED_PROJECTS = [
  {
    id: 'proj-1',
    title: 'AI Voice Lead Pipeline & Automated Sales Engine',
    role: 'Lead Architect & Systems Engineer',
    category: 'AI & Web3',
    description: 'Autonomous multi-modal voice processing pipeline featuring Whisper speech-to-text, ElevenLabs synthesis, and real-time Zod API socket synchronization.',
    outcomes: '🔥 10k+ Calls Synthesized • 99.4% Latency Reduction',
    skills: ['React 19', 'Node.js', 'Whisper AI', 'WebSockets', 'Zod', 'Redis'],
    likes: 342,
    comments: 48,
    isLiked: false,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    rating: '5.0 ⭐ Verified Excellence',
    githubUrl: 'https://github.com/gsrinadh55/skillkollab1',
    liveUrl: 'https://skillkollab.dev'
  },
  {
    id: 'proj-2',
    title: 'NexusAI Autonomous Code Auditor & LangChain Guardrails',
    role: 'Fullstack AI Lead',
    category: 'Developer Tools',
    description: 'Zero-shot vulnerability detection prompt suite and automated AST code remediation engine with live Monaco code editor integration.',
    outcomes: '⚡ 4,200+ Repos Audited • 0 Critical Exploits Passed',
    skills: ['LangChain', 'Python', 'FastAPI', 'Monaco Editor', 'Docker'],
    likes: 289,
    comments: 31,
    isLiked: true,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    rating: '4.9 ⭐ Production Grade',
    githubUrl: 'https://github.com',
    liveUrl: '#'
  },
  {
    id: 'proj-3',
    title: 'EcoChain Carbon Credit Protocol & Verification Ledger',
    role: 'Smart Contract Developer',
    category: 'CleanTech',
    description: 'Decentralized carbon offset verification marketplace using zero-knowledge proofs and IoT telemetry data feeds.',
    outcomes: '🌱 14,000 Metric Tons Carbon Offsets Verified',
    skills: ['Solidity', 'Web3.js', 'Hardhat', 'React', 'Ethers.js'],
    likes: 195,
    comments: 24,
    isLiked: false,
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800',
    rating: '5.0 ⭐ Verified Green',
    githubUrl: 'https://github.com',
    liveUrl: '#'
  },
  {
    id: 'proj-4',
    title: 'YieldPulse Decentralized Algo-Trading & Liquidity Vault',
    role: 'FinTech Systems Contributor',
    category: 'FinTech',
    description: 'High-frequency algorithmic liquidity pool management tool with real-time risk assessment and automated stop-loss protection.',
    outcomes: '💰 $2.4M Total Value Locked (TVL)',
    skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'GraphQL'],
    likes: 210,
    comments: 19,
    isLiked: false,
    image: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800',
    rating: '4.8 ⭐ Top Rated',
    githubUrl: 'https://github.com',
    liveUrl: '#'
  }
];

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
