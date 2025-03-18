import React, { useEffect, useState } from 'react';
import { HealthStatus } from '../../types/monitoring';

interface SystemHealthProps {
  onStatusChange?: (status: HealthStatus) => void;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ onStatusChange }) => {
  const [health, setHealth] = useState<HealthStatus>({
    serverStatus: 'HEALTHY',
    databaseLatency: 0,
    apiLatency: 0,
    errorRate: 0
  });

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setHealth(data);
        onStatusChange?.(data);
      } catch (error) {
        console.error('Failed to fetch health status:', error);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [onStatusChange]);

  return (
    <div className="system-health-panel">
      <h2>System Health</h2>
      <div className={`status-indicator ${health.serverStatus.toLowerCase()}`}>
        {health.serverStatus}
      </div>
      <div className="metrics-grid">
        <div className="metric">
          <label>Database Latency</label>
          <span>{health.databaseLatency}ms</span>
        </div>
        <div className="metric">
          <label>API Latency</label>
          <span>{health.apiLatency}ms</span>
        </div>
        <div className="metric">
          <label>Error Rate</label>
          <span>{health.errorRate}%</span>
        </div>
      </div>
    </div>
  );
}; 