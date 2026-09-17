/**
 * authUtils.js
 * Centralized authentication routing logic based on exact roles and verification statuses.
 */

export const redirectAfterLogin = (user, intendedPath = null) => {
  if (!user) {
    return '/login';
  }

  // Prevent redirecting back to auth pages
  if (intendedPath && (intendedPath === '/login' || intendedPath === '/register' || intendedPath.startsWith('/signup'))) {
    intendedPath = null;
  }

  const activeRole = user.activeRole || user.role;

  // Normal Student / Contributor or base USER
  if (activeRole === 'STUDENT' || activeRole === 'USER' || activeRole === 'INNOVATION_CONTRIBUTOR' || activeRole === 'CONTRIBUTOR') {
    if (!user.onboarding) {
      return '/onboarding';
    }
    return intendedPath || '/dashboard';
  }

  // Innovation Lead / Mentor
  if (activeRole === 'INNOVATION_LEAD' || activeRole === 'MENTOR') {
    return intendedPath || '/innovation-lead/dashboard';
  }

  // Organization handling
  if (activeRole === 'ORGANIZATION_ADMIN' || activeRole === 'ORGANIZATION_REVIEWER' || activeRole === 'ORGANIZATION') {
    // If the org has verification status, check it
    if (user.organization) {
      if (user.organization.verificationStatus === 'VERIFIED') {
        return intendedPath || '/organization/dashboard';
      }
      if (user.organization.verificationStatus === 'UNDER_REVIEW') {
        return '/organization/verification-pending';
      }
      if (user.organization.verificationStatus === 'REJECTED') {
        return '/signup/organization/verification';
      }
      // If PENDING or missing
      return '/signup/organization/verification';
    }
    
    // Fallback if organization details aren't populated yet
    return '/signup/organization/verification';
  }

  // Super Admin
  if (activeRole === 'SUPER_ADMIN' || activeRole === 'ADMIN') {
    return intendedPath || '/admin/dashboard';
  }

  // Default fallback
  return intendedPath || '/dashboard';
};
