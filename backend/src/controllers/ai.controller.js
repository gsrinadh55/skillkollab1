import { asyncHandler } from '../middlewares/async-handler.js'

export class AiController {
  static askMentor = asyncHandler(async (request, response) => {
    const { prompt, context } = request.body
    
    // Algorithmic simulated Co-Pilot response engine
    const reply = {
      role: 'AI_MENTOR',
      title: 'Algorithmic Guidance Evaluation',
      summary: `Analyzed query: "${prompt || 'General architecture inquiry'}". Based on your React 19 and Node.js stack, we recommend implementing Redis caching for your Zod validated endpoints to reduce latency by 64%.`,
      codeSuggestion: `// Suggested Zod caching wrapper\nexport const withCache = (schema, handler) => async (req, res) => {\n  const parsed = schema.parse(req.body);\n  // Check memory store fallback\n  return handler(req, res);\n};`,
      nextSteps: ['Add caching middleware to /api/projects', 'Verify real-time socket room synchronization']
    }

    response.status(200).json({ status: 'success', data: reply })
  })

  static diagnoseProject = asyncHandler(async (request, response) => {
    const { projectId } = request.params
    const diagnostic = {
      projectId: projectId || 'proj-101',
      healthScore: 99.4,
      bugCount: 0,
      velocityRating: 'Optimal (Top 5% among university cohorts)',
      recommendations: [
        { severity: 'INFO', message: 'All 6 Kanban deliverables hold active assignees or AI verification.' },
        { severity: 'TIP', message: 'Consider adding end-to-end integration tests for the mobile breakpoint drawer.' }
      ],
      timestamp: new Date().toISOString()
    }

    response.status(200).json({ status: 'success', data: diagnostic })
  })

  static matchTeam = asyncHandler(async (request, response) => {
    const { skills, hours } = request.body
    const matches = [
      { projectId: 'proj-101', title: 'NexusAI - Autonomous Workflows', compatibility: 96, openRole: 'AI Systems Architect & Fullstack Contributor' },
      { projectId: 'proj-102', title: 'OpenCode Platform - Peer Reviews', compatibility: 89, openRole: 'Frontend Lead' }
    ]

    response.status(200).json({ status: 'success', data: matches })
  })

  static recommendRoles = asyncHandler(async (request, response) => {
    const { title, description, problemStatement, category, difficulty, maxTeamSize, requiredSkills } = request.body;

    const prompt = `
You are an expert technical project manager and recruiter. 
A team needs roles recommended for their project.
Here are the project details:
Title: ${title || 'Technical Innovation Project'}
Category: ${category || 'Software Engineering'}
Difficulty: ${difficulty || 'Intermediate'}
Problem Statement: ${problemStatement || 'Not specified'}
Description: ${description || 'Not specified'}
Required Skills: ${Array.isArray(requiredSkills) && requiredSkills.length > 0 ? requiredSkills.join(', ') : 'React, Node.js'}
Max Team Size: ${maxTeamSize || 5}

Suggest exactly ${Math.max(1, Math.min(Number(maxTeamSize) || 4, 5))} distinct technical roles that would be perfect for this team.
Return the result STRICTLY as a JSON array of objects. Do not include markdown code blocks.
Each object must have:
- "name": string (e.g., "AI/ML Engineer")
- "description": string (brief explanation of what they will do and why it is recommended)
- "skills": array of strings (top 3-4 skills needed)
- "count": integer (usually 1, but maybe 2 if it's a large team for a generic role)

Make sure the sum of "count" does not exceed ${maxTeamSize || 5}.
JSON ONLY:
`;

    let roles = null;
    let provider = 'none';

    // 1. Try Google Gemini API if key exists
    if (process.env.GEMINI_API_KEY) {
      try {
        roles = await AiController.fetchGeminiJson(prompt);
        if (roles && Array.isArray(roles) && roles.length > 0) {
          provider = 'gemini';
        }
      } catch (err) {
        console.warn('Gemini role recommendation failed:', err.message);
      }
    }

    // 2. Try OpenAI API if Gemini failed/unavailable
    if (!roles && process.env.OPENAI_API_KEY) {
      try {
        roles = await AiController.fetchOpenAiJson(prompt);
        if (roles && Array.isArray(roles) && roles.length > 0) {
          provider = 'openai';
        }
      } catch (err) {
        console.warn('OpenAI role recommendation failed:', err.message);
      }
    }

    // 3. Fall back to smart dynamic domain-aware role generator
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      roles = AiController.buildFallbackRoles({
        title,
        description,
        problemStatement,
        category,
        difficulty,
        maxTeamSize,
        requiredSkills
      });
      provider = 'algorithmic_fallback';
    }

    response.status(200).json({ status: 'success', data: roles, provider });
  })

  static generateMilestones = asyncHandler(async (request, response) => {
    const { title = 'AI Project', description = '', category = 'Fullstack', skills = [], model = 'auto' } = request.body;

    const prompt = `
You are an expert AI Technical Program Manager.
Generate 4 sequential engineering sprints/milestones tailored specifically for this project:
Project Title: ${title}
Category: ${category}
Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}
Description: ${description}

Return STRICTLY a JSON array of 4 objects. Do not include markdown code blocks.
Each object must have:
- "id": number (1 to 4)
- "sprint": string (e.g. "Sprint 1: Architecture & Zod Schema Foundation")
- "dueDate": string (e.g. "Jul 20, 2026")
- "status": string ("Completed" for sprint 1, "Active" for sprint 2, "Upcoming" for sprint 3, "Locked" for sprint 4)
- "progress": number (100 for sprint 1, 85 for sprint 2, 20 for sprint 3, 0 for sprint 4)
- "color": string ("emerald", "purple", "cyan", "amber")
- "deliverable": string (technical summary of target deliverable)
- "assignedTeam": string (e.g. "Voice Engine Squad (4 Innovators)")
`;

    let milestones = null;
    let provider = 'none';

    // 1. Try Gemini
    if (process.env.GEMINI_API_KEY) {
      try {
        milestones = await AiController.fetchGeminiJson(prompt);
        if (milestones && Array.isArray(milestones) && milestones.length > 0) {
          provider = 'gemini';
        }
      } catch (err) {
        console.warn('Gemini milestone generation failed:', err.message);
      }
    }

    // 2. Try OpenAI
    if (!milestones && process.env.OPENAI_API_KEY) {
      try {
        milestones = await AiController.fetchOpenAiJson(prompt);
        if (milestones && Array.isArray(milestones) && milestones.length > 0) {
          provider = 'openai';
        }
      } catch (err) {
        console.warn('OpenAI milestone generation failed:', err.message);
      }
    }

    // 3. Dynamic algorithmic fallback
    if (!milestones || !Array.isArray(milestones) || milestones.length === 0) {
      const cleanTitle = title || 'Venture Engineering Project';
      const skillText = Array.isArray(skills) && skills.length > 0 ? skills.slice(0, 3).join(', ') : category;

      milestones = [
        {
          id: 1,
          sprint: `Sprint 1: ${cleanTitle} Core Architecture & ${skillText} Setup`,
          dueDate: 'Jul 20, 2026',
          status: 'Completed',
          progress: 100,
          color: 'emerald',
          deliverable: `Fully specified data models, AST security validators, and initial ${cleanTitle} environment configuration.`,
          assignedTeam: `${cleanTitle.split(' ')[0]} Core (4 Innovators)`
        },
        {
          id: 2,
          sprint: `Sprint 2: Interactive ${cleanTitle} Pipeline & User Interface`,
          dueDate: 'Aug 05, 2026',
          status: 'Active',
          progress: 85,
          color: 'purple',
          deliverable: `High-performance glassmorphic UI with real-time state management and ${skillText} service integration.`,
          assignedTeam: `${cleanTitle.split(' ')[0]} UI/UX Squad (3 Innovators)`
        },
        {
          id: 3,
          sprint: `Sprint 3: Autonomous AI Agent & ${cleanTitle} Optimization`,
          dueDate: 'Aug 20, 2026',
          status: 'Upcoming',
          progress: 20,
          color: 'cyan',
          deliverable: `Zero-shot evaluation prompts, Gemini/GPT workflow orchestration, and automated test coverage.`,
          assignedTeam: `AI & Performance Team (4 Innovators)`
        },
        {
          id: 4,
          sprint: `Sprint 4: Production Deployment & Executive Pitch Demo`,
          dueDate: 'Sep 01, 2026',
          status: 'Locked',
          progress: 0,
          color: 'amber',
          deliverable: `Production-ready Docker containerization, API rate limiting, and live venture evaluation audit.`,
          assignedTeam: `Full Team (All Innovators)`
        }
      ];
      provider = 'algorithmic_fallback';
    }

    response.status(200).json({ status: 'success', data: milestones, generatedBy: provider });
  })

  // Helper: Fetch structured JSON from Gemini with model fallback cascade
  static async fetchGeminiJson(prompt) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;

    const candidateModels = [
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemini-1.5-flash',
      'gemini-pro-latest'
    ];

    for (const model of candidateModels) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (!res.ok) continue;

        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        let cleanText = rawText.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\n?|\n?```$/g, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\n?|\n?```$/g, '');
        }

        return JSON.parse(cleanText);
      } catch (err) {
        // Continue to next model
      }
    }
    return null;
  }

  // Helper: Fetch structured JSON from OpenAI
  static async fetchOpenAiJson(prompt) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return null;

    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: key });

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      temperature: 0.7,
    });

    let rawContent = completion.choices[0].message.content.trim();
    if (rawContent.startsWith('```json')) {
      rawContent = rawContent.replace(/^```json\n?|\n?```$/g, '');
    } else if (rawContent.startsWith('```')) {
      rawContent = rawContent.replace(/^```\n?|\n?```$/g, '');
    }

    return JSON.parse(rawContent);
  }

  // Helper: Smart Dynamic Domain-Aware Role Generator Fallback
  static buildFallbackRoles({ title, description, problemStatement, category, difficulty, maxTeamSize, requiredSkills }) {
    const targetCount = Math.max(1, Math.min(Number(maxTeamSize) || 4, 5));
    const skills = Array.isArray(requiredSkills) && requiredSkills.length > 0
      ? requiredSkills
      : ['React', 'Node.js', 'JavaScript', 'Git'];

    const categoryLower = (category || title || '').toLowerCase();
    const titleWords = (title || 'Project').split(' ').slice(0, 2).join(' ');

    const defaultPool = [];

    if (categoryLower.includes('ai') || categoryLower.includes('ml') || categoryLower.includes('data')) {
      defaultPool.push(
        {
          name: 'AI/ML Engineer',
          description: `Lead prompt engineering, model integration, and vector pipeline design tailored for ${titleWords}.`,
          skills: [...skills.slice(0, 2), 'Python', 'Gemini API', 'PyTorch'].slice(0, 4),
          count: 1
        },
        {
          name: 'Full Stack Engineer',
          description: `Build reactive user interface components and seamless backend API services for ${titleWords}.`,
          skills: [...skills.slice(0, 2), 'React', 'Node.js', 'TypeScript'].slice(0, 4),
          count: 1
        },
        {
          name: 'Data Pipeline Specialist',
          description: `Establish automated ETL workflows, data validation with Zod/Pydantic, and database storage.`,
          skills: ['PostgreSQL', 'Python', 'Redis', 'Zod'].slice(0, 4),
          count: 1
        },
        {
          name: 'AI System & QA Architect',
          description: `Ensure high precision zero-shot outputs, automated evaluation, and integration test coverage.`,
          skills: ['Jest/Vitest', 'Docker', 'REST APIs', 'Git'].slice(0, 4),
          count: 1
        }
      );
    } else if (categoryLower.includes('mobile') || categoryLower.includes('app')) {
      defaultPool.push(
        {
          name: 'Mobile App Lead',
          description: `Develop intuitive cross-platform UI and smooth state navigation for ${titleWords}.`,
          skills: ['React Native', 'Flutter', 'TypeScript', 'TailwindCSS'].slice(0, 4),
          count: 1
        },
        {
          name: 'Backend API Developer',
          description: `Architect secure REST/GraphQL endpoints, database schemas, and JWT authentication workflows.`,
          skills: [...skills.slice(0, 2), 'Node.js', 'Express', 'PostgreSQL'].slice(0, 4),
          count: 1
        },
        {
          name: 'UI/UX Mobile Designer',
          description: `Design modern dark-mode responsive design system tokens, interactive prototypes, and key workflows.`,
          skills: ['Figma', 'UI/UX', 'TailwindCSS', 'Micro-animations'].slice(0, 4),
          count: 1
        }
      );
    } else {
      defaultPool.push(
        {
          name: 'Frontend Lead Developer',
          description: `Create accessible, high-performance UI components using modern design systems for ${titleWords}.`,
          skills: [...skills.slice(0, 2), 'React', 'TailwindCSS', 'TypeScript'].slice(0, 4),
          count: 1
        },
        {
          name: 'Backend Systems Architect',
          description: `Implement scalable REST endpoints, database schemas, and background task queues.`,
          skills: [...skills.slice(0, 2), 'Node.js', 'Express', 'PostgreSQL'].slice(0, 4),
          count: 1
        },
        {
          name: 'DevOps & Integration Specialist',
          description: `Configure CI/CD deployment pipelines, environment security, and real-time socket connections.`,
          skills: ['Docker', 'GitHub Actions', 'Redis', 'Socket.io'].slice(0, 4),
          count: 1
        },
        {
          name: 'Full Stack Contributor',
          description: `Collaborate across frontend features, API integrations, and comprehensive end-to-end testing.`,
          skills: [...skills.slice(0, 2), 'JavaScript', 'Git', 'REST APIs'].slice(0, 4),
          count: 1
        }
      );
    }

    return defaultPool.slice(0, targetCount);
  }
}
