import React from 'react';
import { OrganizationDashboard } from '../dashboard/components/OrganizationDashboard';
import { OrganizationLayout } from '../../layouts/OrganizationLayout';

export function OrganizationDashboardPage() {
  return (
    <OrganizationLayout>
      <OrganizationDashboard />
    </OrganizationLayout>
  );
}

export default OrganizationDashboardPage;
