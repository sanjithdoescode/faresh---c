import React from 'react';
import { AdminDashboard } from './components/admin/Dashboard';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';

export const App: React.FC = () => {
  return (
    <div className="app">
      <nav className="main-nav">
        {/* Add navigation here */}
      </nav>
      <main>
        <AdminDashboard />
        <AnalyticsDashboard />
      </main>
    </div>
  );
}; 