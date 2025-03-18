import React from 'react';
import { MetricsChart } from './MetricsChart';
import { TrendAnalysis } from './TrendAnalysis';
import { ReportGenerator } from './ReportGenerator';

export const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="analytics-dashboard">
      <h1>Analytics Dashboard</h1>
      <div className="analytics-grid">
        <MetricsChart />
        <TrendAnalysis />
        <ReportGenerator />
      </div>
    </div>
  );
}; 