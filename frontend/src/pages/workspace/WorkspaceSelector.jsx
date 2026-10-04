import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { challengesService } from '../../services/firebase/challenges';
import { teamsService } from '../../services/firebase/teams';
import { applicationsService } from '../../services/firebase/applications';
import { Briefcase, ArrowRight, Server, ShieldCheck, Terminal } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import api from '../../services/api';

export function WorkspaceSelector() {
  const { user, activeRole } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!user) return;
      const currentUserId = user?.uid || user?.id || user?._id;
      setLoading(true);

      try {
        // 1. Fetch user's team memberships
        let teams = [];
        try {
          if (currentUserId) {
            teams = await teamsService.getUserTeams(currentUserId);
          }
        } catch (e) {
          console.warn("getUserTeams error:", e);
        }

        // 2. Fetch user's submitted applications
        let applications = [];
        try {
          if (currentUserId) {
            applications = await applicationsService.getApplicationsByStudent(currentUserId);
          }
        } catch (e) {
          console.warn("getApplicationsByStudent error:", e);
        }

        // 3. Fetch user's created challenges
        let leadChallenges = [];
        try {
          if (currentUserId) {
            leadChallenges = await challengesService.getChallengesByCreator(currentUserId);
          }
        } catch (e) {
          console.warn("getChallengesByCreator error:", e);
        }

        // 4. Fetch published challenges
        let publishedChallenges = [];
        try {
          publishedChallenges = await challengesService.getPublishedChallenges();
        } catch (e) {
          console.warn("getPublishedChallenges error:", e);
        }

        // 5. Fetch projects from Postgres API
        let apiProjects = [];
        try {
          const res = await api.get('/projects');
          if (res && (res.status === 'success' || Array.isArray(res.data) || Array.isArray(res))) {
            apiProjects = res.data?.data || res.data || res || [];
          }
        } catch (e) {
          console.warn("api.get /projects error:", e);
        }

        const workspaceMap = new Map();

        // Add lead owned challenges
        leadChallenges.forEach(c => {
          if (c && c.id) {
            workspaceMap.set(c.id, {
              id: c.id,
              title: c.title || 'Untitled Challenge',
              description: c.shortDescription || c.summary || c.description || 'No description provided.',
              role: 'Owner'
            });
          }
        });

        // Add API projects owned or participated in
        apiProjects.forEach(p => {
          if (p && p.id) {
            const isOwner = p.ownerId === currentUserId || p.creatorId === currentUserId || (activeRole === 'INNOVATION_LEAD' && p.ownerId === currentUserId);
            if (!workspaceMap.has(p.id)) {
              workspaceMap.set(p.id, {
                id: p.id,
                title: p.title || 'Untitled Project',
                description: p.summary || p.shortDescription || p.description || 'No description provided.',
                role: isOwner ? 'Owner' : 'Contributor'
              });
            }
          }
        });

        // Add challenges from team memberships
        for (const t of teams) {
          const cId = t.challengeId || t.team?.challengeId;
          if (cId && !workspaceMap.has(cId)) {
            let ch = publishedChallenges.find(pc => pc.id === cId);
            if (!ch) {
              try {
                ch = await challengesService.getChallengeById(cId);
              } catch (e) {}
            }
            workspaceMap.set(cId, {
              id: cId,
              title: ch?.title || t.team?.name || 'Sprint Challenge',
              description: ch?.shortDescription || ch?.summary || 'No description provided.',
              role: 'Contributor'
            });
          }
        }

        // Add challenges from submitted applications (ACCEPTED, APPROVED, or PENDING)
        for (const app of applications) {
          const cId = app.challengeId;
          if (cId && !workspaceMap.has(cId)) {
            let ch = publishedChallenges.find(pc => pc.id === cId);
            if (!ch) {
              try {
                ch = await challengesService.getChallengeById(cId);
              } catch (e) {}
            }
            const appRole = app.status === 'ACCEPTED' || app.status === 'APPROVED' ? 'Contributor' : `Applied (${app.status || 'Pending'})`;
            workspaceMap.set(cId, {
              id: cId,
              title: app.challengeTitle || ch?.title || 'Sprint Challenge',
              description: ch?.shortDescription || ch?.summary || 'No description provided.',
              role: appRole
            });
          }
        }

        // Fallback: If map is still empty, list all published challenges so user can enter any active workspace directly
        if (workspaceMap.size === 0 && publishedChallenges.length > 0) {
          publishedChallenges.forEach(c => {
            workspaceMap.set(c.id, {
              id: c.id,
              title: c.title || 'Active Workspace',
              description: c.shortDescription || c.summary || 'No description provided.',
              role: 'Contributor'
            });
          });
        }

        setWorkspaces(Array.from(workspaceMap.values()));
      } catch (error) {
        console.error("Error fetching workspaces:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [user, activeRole]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <LoadingSpinner text="Locating your workspaces..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-16">
        <div className="flex flex-col gap-2 border-b border-[var(--border-subtle)] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-strong)] tracking-tight">Select Workspace</h1>
          </div>
          <p className="text-[15px] text-[var(--text-secondary)] mt-1 max-w-3xl">
            Choose an active challenge workspace to access team chat, files, kanban boards, and live code editors.
          </p>
        </div>

        {workspaces.length === 0 ? (
          <div className="p-12 text-center bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-subtle)]">
            <Briefcase className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[var(--text-strong)]">No Workspaces Found</h3>
            <p className="text-[var(--text-secondary)] mt-2">
              {activeRole === 'INNOVATION_LEAD' 
                ? "You haven't created any challenges yet." 
                : "You haven't been accepted into any challenge teams yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workspaces.map((ws, idx) => (
              <motion.div
                key={ws.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => navigate(`/workspace/${ws.id}`)}
                className="group cursor-pointer p-6 rounded-[20px] bg-[var(--bg-card)] border border-[var(--border-strong)] hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-glow-primary)] transition-all duration-300 relative overflow-hidden flex flex-col h-full"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-[var(--color-primary)]" />
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/10 flex items-center justify-center shadow-inner border border-[var(--color-primary)]/20">
                    <Server className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-strong)] line-clamp-1 pr-8">{ws.title}</h3>
                    <span className="text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-0.5 rounded-full">
                      {ws.role}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-6 flex-grow">
                  {ws.description}
                </p>

                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[var(--border-subtle)]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-[var(--text-muted)] font-medium">Encrypted P2P Environment</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
