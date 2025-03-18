import React, { useEffect, useState } from 'react';
import { LineChart } from '../charts/LineChart';

interface TransactionData {
  id: string;
  amount: number;
  timestamp: Date;
}

interface TransactionStatsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  recentTransactions: TransactionData[];
}

export const TransactionStats: React.FC = () => {
  const [stats, setStats] = useState<TransactionStatsData>({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    recentTransactions: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/transactions/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch transaction stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="transaction-stats-panel">
      <h2>Transaction Overview</h2>
      <div className="stats-summary">
        <div className="stat-item">
          <label>Total Orders</label>
          <span>{stats.totalOrders}</span>
        </div>
        <div className="stat-item">
          <label>Total Revenue</label>
          <span>₹{stats.totalRevenue.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <label>Average Order Value</label>
          <span>₹{stats.averageOrderValue.toLocaleString()}</span>
        </div>
      </div>
      <div className="transaction-chart">
        <LineChart
          data={stats.recentTransactions.map(t => ({
            name: 'transaction_amount',
            value: t.amount,
            timestamp: t.timestamp
          }))}
          title="Recent Transactions"
          yAxisLabel="Amount (₹)"
        />
      </div>
    </div>
  );
}; 