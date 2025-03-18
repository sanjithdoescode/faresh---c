import React from 'react';
import { SystemHealth } from './SystemHealth';
import { MetricsPanel } from './MetricsPanel';
import { UserStats } from './UserStats';
import { TransactionStats } from './TransactionStats';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="admin-dashboard">
      <h1>Farm Connect Admin Dashboard</h1>
      <div className="dashboard-grid">
        <SystemHealth />
        <MetricsPanel />
        <UserStats />
        <TransactionStats />
      </div>
    </div>
  );
}; 