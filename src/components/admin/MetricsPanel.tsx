import React, { useEffect, useState } from 'react';
import { LineChart } from '../charts/LineChart';
import { MetricData } from '../../types/monitoring';

export const MetricsPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`/api/metrics?range=${timeRange}`);
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, [timeRange]);

  return (
    <div className="metrics-panel">
      <div className="panel-header">
        <h2>System Metrics</h2>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value as '1h' | '24h' | '7d')}
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>
      <div className="charts-grid">
        <LineChart
          data={metrics.filter(m => m.name === 'cpu_usage')}
          title="CPU Usage"
          yAxisLabel="%"
        />
        <LineChart
          data={metrics.filter(m => m.name === 'memory_usage')}
          title="Memory Usage"
          yAxisLabel="MB"
        />
        <LineChart
          data={metrics.filter(m => m.name === 'request_count')}
          title="Request Count"
          yAxisLabel="Requests"
        />
      </div>
    </div>
  );
}; 