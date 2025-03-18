import React from 'react';
import { Line } from 'react-chartjs-2';
import { MetricData } from '../../types/monitoring';

interface LineChartProps {
  data: MetricData[];
  title: string;
  yAxisLabel: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, title, yAxisLabel }) => {
  const chartData = {
    labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: title,
        data: data.map(d => d.value),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: title
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: yAxisLabel
        }
      }
    }
  };

  return <Line data={chartData} options={options} />;
}; 