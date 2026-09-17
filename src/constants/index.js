export const ROLES = {
  USER: 'USER',
  MENTOR: 'MENTOR',
  ADMIN: 'ADMIN',
}

export const TEAM_ROLES = {
  OWNER: 'OWNER',
  MEMBER: 'MEMBER',
  MENTOR: 'MENTOR',
}

export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  BLOCKED: 'BLOCKED',
  DONE: 'DONE',
}

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]: 'To Do',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.REVIEW]: 'In Review',
  [TASK_STATUS.BLOCKED]: 'Blocked',
  [TASK_STATUS.DONE]: 'Completed',
}

export const PROJECT_CATEGORIES = [
  'Web Apps',
  'Mobile Apps',
  'AI & ML Tools',
  'Design Systems',
  'Open Source Infrastructure',
  'Hackathon MVPs',
  'Web3 & Crypto',
  'Developer Tools',
  'EdTech Solutions',
  'FinTech Platforms'
]

export const AI_MODULES_DATA = [
  {
    id: 'mentor',
    title: 'AI Mentor & Co-Pilot',
    tagline: 'Instant code reviews, architectural advice & 24/7 technical guidance.',
    iconName: 'BrainCircuit',
    color: '#5b7cff',
  },
  {
    id: 'team-builder',
    title: 'AI Team Matchmaker',
    tagline: 'Algorithmic compatibility matching for founders, engineers, and designers.',
    iconName: 'Users',
    color: '#00c4a1',
  },
  {
    id: 'project-doctor',
    title: 'AI Project Doctor',
    tagline: 'Automated sprint health checks, bottleneck diagnosis, and blocker elimination.',
    iconName: 'ShieldCheck',
    color: '#a855f7',
  },
  {
    id: 'roadmap-generator',
    title: 'AI Roadmap Generator',
    tagline: 'Dynamic project sprint breakdowns and learning milestone timelines.',
    iconName: 'Layers3',
    color: '#f59e0b',
  },
]

export const DUMMY_PROJECTS = [
  {
    id: 'proj-101',
    title: 'NexusAI - Autonomous Workflows for Designers',
    slug: 'nexus-ai',
    summary: 'Building a visual drag-and-drop workflow canvas powered by generative AI models to accelerate prototype generation for mobile UI teams.',
    category: 'AI & ML Tools',
    difficulty: 'Advanced',
    status: 'ACTIVE',
    remoteOnly: true,
    techStack: ['React', 'TypeScript', 'Tailwind', 'Node.js', 'Python', 'OpenAI'],
    completionRate: 68,
    members: [
      { name: 'Elena Rostova', role: 'Lead Developer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
      { name: 'Marcus Chen', role: 'AI Specialist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
      { name: 'Sarah Jenkins', role: 'UI/UX Designer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' }
    ],
    milestonesCount: 5,
    openRoles: ['Frontend Engineer', 'QA Tester']
  },
  {
    id: 'proj-102',
    title: 'OpenCode Platform - Student Peer Code Reviews',
    slug: 'opencode-platform',
    summary: 'A real-time collaborative IDE wrapper that connects computer science undergraduates with alumni mentors for weekly asynchronous live code feedback.',
    category: 'EdTech Solutions',
    difficulty: 'Intermediate',
    status: 'DISCOVERING',
    remoteOnly: true,
    techStack: ['Next.js', 'Socket.IO', 'Prisma', 'PostgreSQL', 'Docker'],
    completionRate: 34,
    members: [
      { name: 'David Kim', role: 'Project Founder', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
      { name: 'Aaliyah Patel', role: 'Backend Dev', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' }
    ],
    milestonesCount: 4,
    openRoles: ['FullStack Developer', 'Product Manager', 'DevOps Engineer']
  },
  {
    id: 'proj-103',
    title: 'Verve - Micro-Habit Gamification Engine',
    slug: 'verve-habits',
    summary: 'Transforming personal discipline and daily routine objectives into collaborative guild battles with achievement NFTs and verifiable consistency streaks.',
    category: 'Mobile Apps',
    difficulty: 'Beginner Friendly',
    status: 'ACTIVE',
    remoteOnly: false,
    hybridFriendly: true,
    techStack: ['React Native', 'Expo', 'Firebase', 'Zustand', 'Figma'],
    completionRate: 82,
    members: [
      { name: 'Lucas Rossi', role: 'Mobile Lead', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
      { name: 'Chloe Wang', role: 'UI Illustrator', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
      { name: 'Omar Al-Hassan', role: 'Frontend Dev', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' }
    ],
    milestonesCount: 6,
    openRoles: ['React Native Junior Dev']
  }
]
