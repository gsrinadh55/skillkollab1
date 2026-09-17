import React from 'react';
import { InnovationLeadDashboard } from '../dashboard/components/InnovationLeadDashboard';
import { DashboardLayout } from '../../layouts/DashboardLayout';

export function InnovationLeadDashboardPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <InnovationLeadDashboard />
      </div>
    </DashboardLayout>
  );
}

export default InnovationLeadDashboardPage;
