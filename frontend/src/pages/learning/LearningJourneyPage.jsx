import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, Trophy, Clock, Flame, ShieldCheck, Sparkles, Layers, ArrowRight, Star } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

const BADGES = [
  { id: 'b1', title: 'Consistency Titan', desc: 'Contributed 10+ hours per week for 2 consecutive sprints.', icon: '🏆', unlocked: true, date: 'Jul 26' },
  { id: 'b2', title: 'AI Verified Architect', desc: 'Shipped 5 Kanban sprint milestones verified by AI Project Doctor.', icon: '🤖', unlocked: true, date: 'Jul 28' },
  { id: 'b3', title: 'Sprint Leader', desc: 'Assembled a 4-member collaborative team via the AI Matchmaker.', icon: '🚀', unlocked: false, date: 'Locked' },
  { id: 'b4', title: 'Zero Blocker Code', desc: 'Maintained a 99%+ AI health rating without memory regressions.', icon: '⚡', unlocked: true, date: 'Today' },
  { id: 'b5', title: 'Mentor Pro-Reviewer', desc: 'Received 5-star validation feedback from senior industry mentors.', icon: '🌟', unlocked: false, date: 'Locked' },
  { id: 'b6', title: 'Vercel Ship Master', desc: 'Successfully deployed a verifiable production SaaS app release.', icon: '🚢', unlocked: true, date: 'Sprint 1' },
];

const TIMELINE = [
  { stage: 'Stage 1: Foundation & Onboarding', title: 'Profile Initialization & Intent Discovery', outcome: 'Selected AI & React specializations; generated AI roadmap.', status: 'COMPLETED', xp: 500 },
  { stage: 'Stage 2: Collaborative Team Assembly', title: 'Joined NexusAI Autonomous Workflow Cohort', outcome: 'Collaborated with Dr. Elena Rostova and student engineers.', status: 'COMPLETED', xp: 1200 },
  { stage: 'Stage 3: Interactive Sprint Delivery', title: 'Kanban Synchronization & Socket.IO State', outcome: 'Implemented real-time visual drag-and-drop workspace.', status: 'ACTIVE', xp: 2400 },
  { stage: 'Stage 4: Verification & Portfolio NFT', title: 'Automated AI Diagnostics & Vercel Release', outcome: 'Earn a verifiable cryptographic engineering badge.', status: 'LOCKED', xp: 5000 },
];

export function LearningJourneyPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('roadmap'); // roadmap, badges

  const totalXP = TIMELINE.filter(t => t.status === 'COMPLETED').reduce((acc, c) => acc + c.xp, 0) + 1200;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1060px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Banner Section */}
        <div className="glass-panel glow-border" style={{ padding: '36px 40px', borderRadius: '26px', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
          <div>
            <span style={{ display: 'inline-flex', padding: '4px 14px', borderRadius: '999px', background: 'var(--bg-active)', color: 'var(--accent-primary)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '12px', gap: '6px', alignItems: 'center' }}>
              <Award size={15} /> VERIFIABLE BUILDER CREDENTIALS
            </span>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              Adaptive Learning Roadmaps & Achievements
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.05rem', maxWidth: '580px' }}>
              Track your verifiable software milestone mastery, collect cryptographic badge awards, and build an irresistible proof-of-work portfolio for tech employers.
            </p>
          </div>

          {/* XP & Level Badge Box */}
          <div style={{ padding: '22px 28px', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-strong)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Current Builder Level</span>
            <strong style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>Level 4</strong>
            <span style={{ fontSize: '0.88rem', color: 'var(--accent-secondary)', fontWeight: 700 }}>✨ {totalXP.toLocaleString()} Total XP Earned</span>
            <div style={{ width: '180px', height: '6px', borderRadius: '99px', background: 'var(--border-subtle)', margin: '6px auto 0', overflow: 'hidden' }}>
              <div style={{ width: '72%', height: '100%', background: 'var(--accent-gradient)' }} />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('roadmap')}
            style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'roadmap' ? 'var(--bg-active)' : 'transparent', color: activeTab === 'roadmap' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontSize: '1.02rem', fontWeight: activeTab === 'roadmap' ? 700 : 500, cursor: 'pointer', transition: 'all 150ms ease' }}
          >
            🗺️ Milestone Journey Roadmap
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'badges' ? 'var(--bg-active)' : 'transparent', color: activeTab === 'badges' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontSize: '1.02rem', fontWeight: activeTab === 'badges' ? 700 : 500, cursor: 'pointer', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            🏆 NFT & Achievement Badges
            <span className="badge badge-done" style={{ fontSize: '0.72rem' }}>4 Unlocked</span>
          </button>
        </div>

        {/* Active Tab View */}
        {activeTab === 'roadmap' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {TIMELINE.map((item, index) => (
              <div
                key={index}
                className="glass-panel"
                style={{
                  padding: '26px 30px',
                  borderRadius: '20px',
                  background: item.status === 'ACTIVE' ? 'rgba(91, 124, 255, 0.08)' : 'var(--bg-secondary)',
                  border: item.status === 'ACTIVE' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '18px',
                  opacity: item.status === 'LOCKED' ? 0.65 : 1
                }}
              >
                <div style={{ maxWidth: '640px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {item.stage}
                    </span>
                    <span className={`badge ${item.status === 'COMPLETED' ? 'badge-done' : item.status === 'ACTIVE' ? 'badge-in_progress' : 'badge-blocked'}`}>
                      {item.status === 'COMPLETED' ? '✓ Completed' : item.status === 'ACTIVE' ? '⚡ Sprint 2 In Progress' : '🔒 Locked Milestone'}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                    {item.title}
                  </h3>
                  
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: '1.5' }}>
                    <strong>Deliverable Outcome:</strong> {item.outcome}
                  </p>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-secondary)', fontFamily: 'var(--font-mono)' }}>
                    +{item.xp.toLocaleString()} XP
                  </span>
                  {item.status === 'ACTIVE' && (
                    <Link to="/projects/proj-101/workspace" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.86rem', minHeight: '36px' }}>
                      Continue Kanban Tasks <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {BADGES.map((badge) => (
              <div
                key={badge.id}
                className="glass-panel"
                style={{
                  padding: '28px',
                  borderRadius: '22px',
                  background: 'var(--bg-secondary)',
                  border: badge.unlocked ? '1px solid var(--accent-secondary)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  textAlign: 'center',
                  opacity: badge.unlocked ? 1 : 0.45,
                  boxShadow: badge.unlocked ? '0 4px 20px rgba(0, 196, 161, 0.1)' : 'none',
                  position: 'relative'
                }}
              >
                <span style={{ width: '64px', height: '64px', borderRadius: '20px', background: badge.unlocked ? 'rgba(0, 196, 161, 0.12)' : 'rgba(255,255,255,0.03)', display: 'grid', placeItems: 'center', fontSize: '2.2rem', margin: '0 auto' }}>
                  {badge.icon}
                </span>
                
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                    {badge.title}
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
                    {badge.desc}
                  </p>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: badge.unlocked ? 'var(--accent-secondary)' : 'var(--text-muted)', fontWeight: 700 }}>
                    {badge.unlocked ? '✨ NFT Cryptographically Verified' : '🔒 Milestone Locked'}
                  </span>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{badge.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
export default LearningJourneyPage;
