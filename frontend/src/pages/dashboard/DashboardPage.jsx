import React from 'react';
import { InnovationContributorDashboard } from './components/InnovationContributorDashboard';
import { DashboardLayout } from '../../layouts/DashboardLayout';

export function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        <InnovationContributorDashboard />
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;
