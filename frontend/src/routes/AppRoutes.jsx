import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AuthModal } from '../components/auth/AuthModal';
import { ShieldAlert } from 'lucide-react';
import { GlobalErrorBoundary } from '../components/common/GlobalErrorBoundary';
import * as Pages from '../pages';
import { redirectAfterLogin } from '../utils/authUtils';

// Guest Route Wrapper (redirects logged-in users away from auth pages)
function GuestRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return null;
  if (isAuthenticated && user) {
    const correctPath = redirectAfterLogin(user);
    return <Navigate to={correctPath} replace />;
  }
  return children;
}

// Protected Route Wrapper with RBAC
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-[var(--bg-main)]"><LoadingSpinner text="Authenticating secure session..." /></div>;
  }

  if (!isAuthenticated) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectUrl}`} state={{ from: location }} replace />;
  }

  const activeRole = user?.activeRole || user?.role;

  if (allowedRoles.length > 0 && activeRole) {
    // Check if user's role is in the allowed list
    const hasRole = allowedRoles.includes(activeRole) || (activeRole === 'ADMIN' || activeRole === 'SUPER_ADMIN'); // Admin bypass
    
    if (!hasRole) {
      // User is authenticated but doesn't have the right role -> redirect to their correct dashboard
      const correctPath = redirectAfterLogin(user);
      return <Navigate to={correctPath} replace />;
    }
  }

  return children;
}

export function AppRoutes() {
  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <AuthModal />
        <Routes>
        {/* Public Marketing & Landing Route */}
        <Route path="/" element={<Pages.LandingPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<GuestRoute><Pages.LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Pages.RegisterPage /></GuestRoute>} />
        <Route path="/signup/role" element={<GuestRoute><Pages.RoleSelectionPage /></GuestRoute>} />
        <Route path="/signup/organization/verification" element={<ProtectedRoute allowedRoles={['ORGANIZATION_ADMIN']}><Pages.SignupOrganizationPage /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<Pages.ForgotPasswordPage />} />
        <Route path="/reset-password" element={<Pages.ResetPasswordPage />} />
        <Route path="/verify-email" element={<Pages.EmailVerificationPage />} />

        {/* AI Onboarding Experience */}
        <Route path="/onboarding" element={<ProtectedRoute><Pages.OnboardingWizardPage /></ProtectedRoute>} />

        {/* Core Dashboards & Innovation Marketplace */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['USER', 'STUDENT', 'CONTRIBUTOR']}><Pages.DashboardPage /></ProtectedRoute>} />
        
        {/* Innovation Lead Routes */}
        <Route path="/innovation-lead/dashboard" element={<ProtectedRoute allowedRoles={['INNOVATION_LEAD', 'MENTOR']}><Pages.InnovationLeadDashboardPage /></ProtectedRoute>} />
        
        {/* Organization / University Portal */}
        <Route path="/organization/dashboard" element={<ProtectedRoute allowedRoles={['ORGANIZATION', 'ORGANIZATION_ADMIN', 'ORGANIZATION_REVIEWER']}><Pages.OrganizationDashboardPage /></ProtectedRoute>} />
        <Route path="/organization/verification-pending" element={<ProtectedRoute allowedRoles={['ORGANIZATION', 'ORGANIZATION_ADMIN', 'ORGANIZATION_REVIEWER']}><Pages.OrganizationVerificationPending /></ProtectedRoute>} />
        <Route path="/organization/verification-rejected" element={<ProtectedRoute allowedRoles={['ORGANIZATION', 'ORGANIZATION_ADMIN', 'ORGANIZATION_REVIEWER']}><Pages.OrganizationVerificationRejected /></ProtectedRoute>} />
        <Route path="/organization/challenges" element={<ProtectedRoute allowedRoles={['ORGANIZATION', 'ORGANIZATION_ADMIN', 'ORGANIZATION_REVIEWER']}><Pages.OrganizationPlaceholderPage title="All Challenges" /></ProtectedRoute>} />
        <Route path="/organization/challenges/create" element={<Navigate to="/create-project" replace />} />
        <Route path="/organization/challenges/drafts" element={<ProtectedRoute allowedRoles={['ORGANIZATION', 'ORGANIZATION_ADMIN', 'ORGANIZATION_REVIEWER']}><Pages.OrganizationPlaceholderPage title="Draft Challenges" /></ProtectedRoute>} />
        <Route path="/organization/challenges/published" element={<ProtectedRoute allowedRoles={['ORGANIZATION', 'ORGANIZATION_ADMIN', 'ORGANIZATION_REVIEWER']}><Pages.OrganizationPlaceholderPage title="Published Challenges" /></ProtectedRoute>} />
        
        <Route path="/organization/applications/new" element={<ProtectedRoute allowedRoles={['ORGANIZATION', 'ORGANIZATION_ADMIN', 'ORGANIZATION_REVIEWER']}><Pages.OrganizationPlaceholderPage title="New Applications" /></ProtectedRoute>} />
        <Route path="/organization/applications/shortlisted" element={<ProtectedRoute allowedRoles={['ORGANIZATION', 'ORGANIZATION_ADMIN', 'ORGANIZATION_REVIEWER']}><Pages.OrganizationPlaceholderPage title="Shortlisted Applications" /></ProtectedRoute>} />
        <Route path="/organization/applications/accepted" element={<ProtectedRoute allowedRoles={['ORGANIZATION', 'ORGANIZATION_ADMIN', 'ORGANIZATION_REVIEWER']}><Pages.OrganizationPlaceholderPage title="Accepted Applications" /></ProtectedRoute>} />
        <Route path="/organization/applications/rejected" element={<ProtectedRoute allowedRoles={['ORGANIZATION', 'ORGANIZATION_ADMIN', 'ORGANIZATION_REVIEWER']}><Pages.OrganizationPlaceholderPage title="Rejected Applications" /></ProtectedRoute>} />
        
        <Route path="/organization/teams" element={<ProtectedRoute allowedRoles={['ORGANIZATION', 'ORGANIZATION_ADMIN', 'ORGANIZATION_REVIEWER']}><Pages.OrganizationPlaceholderPage title="Student Teams" /></ProtectedRoute>} />
        <Route path="/organization/projects" element={<ProtectedRoute allowedRoles={['ORGANIZATION', 'ORGANIZATION_ADMIN', 'ORGANIZATION_REVIEWER']}><Pages.OrganizationPlaceholderPage title="Organization Projects" /></ProtectedRoute>} />
        <Route path="/organization/grants" element={<ProtectedRoute allowedRoles={['ORGANIZATION', 'ORGANIZATION_ADMIN', 'ORGANIZATION_REVIEWER']}><Pages.OrganizationPlaceholderPage title="Grants & Rewards" /></ProtectedRoute>} />
        <Route path="/organization/reviews" element={<ProtectedRoute allowedRoles={['ORGANIZATION', 'ORGANIZATION_ADMIN', 'ORGANIZATION_REVIEWER']}><Pages.OrganizationPlaceholderPage title="Reviews" /></ProtectedRoute>} />
        <Route path="/organization/analytics" element={<ProtectedRoute allowedRoles={['ORGANIZATION', 'ORGANIZATION_ADMIN', 'ORGANIZATION_REVIEWER']}><Pages.OrganizationPlaceholderPage title="Analytics Dashboard" /></ProtectedRoute>} />
        <Route path="/organization/profile" element={<ProtectedRoute allowedRoles={['ORGANIZATION', 'ORGANIZATION_ADMIN', 'ORGANIZATION_REVIEWER']}><Pages.OrganizationPlaceholderPage title="Organization Profile" /></ProtectedRoute>} />
        <Route path="/organization/settings" element={<ProtectedRoute allowedRoles={['ORGANIZATION', 'ORGANIZATION_ADMIN', 'ORGANIZATION_REVIEWER']}><Pages.OrganizationPlaceholderPage title="Settings" /></ProtectedRoute>} />

        <Route path="/organization/*" element={<ProtectedRoute allowedRoles={['ORGANIZATION', 'ORGANIZATION_ADMIN', 'ORGANIZATION_REVIEWER']}><Pages.OrganizationDashboardPage /></ProtectedRoute>} />

        <Route path="/discover" element={<Pages.DiscoverProjectsPage />} />
        <Route path="/create-project" element={<Navigate to="/innovation-lead/create-challenge" replace />} />
        <Route path="/create-challenge" element={<Navigate to="/innovation-lead/create-challenge" replace />} />
        <Route path="/innovation-lead/create-challenge" element={<ProtectedRoute allowedRoles={['INNOVATION_LEAD', 'MENTOR']}><Pages.CreateChallengePage /></ProtectedRoute>} />
        <Route path="/innovation-lead/challenges/:id" element={<ProtectedRoute allowedRoles={['INNOVATION_LEAD', 'MENTOR']}><Pages.ManageChallengePage /></ProtectedRoute>} />
        <Route path="/my-challenges" element={<ProtectedRoute><Pages.MyChallengesPage /></ProtectedRoute>} />
        
        <Route path="/applications" element={<ProtectedRoute><Pages.ApplicationsManagementPage /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<Pages.ProjectDetailsPage />} />
        <Route path="/projects/:id/workspace" element={<ProtectedRoute><Pages.TeamWorkspacePage /></ProtectedRoute>} />
        <Route path="/workspace" element={<ProtectedRoute><Pages.TeamWorkspacePage /></ProtectedRoute>} />
        <Route path="/workspace/:id" element={<ProtectedRoute><Pages.TeamWorkspacePage /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><Pages.DocumentsPage /></ProtectedRoute>} />
        
        {/* Portfolio, Leaderboard, Milestones & Honors */}
        <Route path="/portfolio" element={<ProtectedRoute><Pages.PortfolioPage /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Pages.LeaderboardPage /></ProtectedRoute>} />
        <Route path="/milestones" element={<ProtectedRoute><Pages.MilestonesPage /></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><Pages.AchievementsPage /></ProtectedRoute>} />

        {/* Communication & Real-time */}
        <Route path="/messages" element={<ProtectedRoute><Pages.MessagesPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Pages.NotificationsPage /></ProtectedRoute>} />
        
        {/* AI Modules & Learning Hub */}
        <Route path="/mentor" element={<Pages.AIMentorPage />} />
        <Route path="/learning" element={<ProtectedRoute><Pages.LearningJourneyPage /></ProtectedRoute>} />
        
        {/* Profile & Admin Settings */}
        <Route path="/profile" element={<ProtectedRoute><Pages.UserProfilePage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Pages.AdminDashboardPage /></ProtectedRoute>} />

        {/* Catch-all route redirecting to dashboard if logged in, else landing */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </GlobalErrorBoundary>
  );
}

export default AppRoutes;
