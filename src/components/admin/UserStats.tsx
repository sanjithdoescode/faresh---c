import React, { useEffect, useState } from 'react';

interface UserStatsData {
  totalFarmers: number;
  totalConsumers: number;
  activeUsers: number;
  newUsersToday: number;
}

export const UserStats: React.FC = () => {
  const [stats, setStats] = useState<UserStatsData>({
    totalFarmers: 0,
    totalConsumers: 0,
    activeUsers: 0,
    newUsersToday: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/users/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="user-stats-panel">
      <h2>User Statistics</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Farmers</h3>
          <div className="stat-value">{stats.totalFarmers}</div>
        </div>
        <div className="stat-card">
          <h3>Consumers</h3>
          <div className="stat-value">{stats.totalConsumers}</div>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <div className="stat-value">{stats.activeUsers}</div>
        </div>
        <div className="stat-card">
          <h3>New Today</h3>
          <div className="stat-value">{stats.newUsersToday}</div>
        </div>
      </div>
    </div>
  );
}; 