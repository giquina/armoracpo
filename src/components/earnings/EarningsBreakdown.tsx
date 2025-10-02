import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './EarningsBreakdown.css';

ChartJS.register(ArcElement, Tooltip, Legend);

export interface EarningsBreakdownData {
  byType: { type: string; amount: number; count: number }[];
  totalEarnings: number;
  averagePerAssignment: number;
  highestEarning: number;
}

interface EarningsBreakdownProps {
  data: EarningsBreakdownData;
}

const EarningsBreakdown: React.FC<EarningsBreakdownProps> = ({ data }) => {
  const chartData = {
    labels: data.byType.map(item => item.type),
    datasets: [
      {
        data: data.byType.map(item => item.amount),
        backgroundColor: [
          '#0A1F44',
          '#D4AF37',
          '#1a3a5f',
          '#b8941f',
          '#050f22',
        ],
        borderWidth: 0,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#0A1F44',
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = ((value / data.totalEarnings) * 100).toFixed(1);
            return `${label}: £${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="earnings-breakdown">
      <h3 className="earnings-breakdown__title">Earnings Breakdown</h3>

      <div className="earnings-breakdown__chart">
        <Doughnut data={chartData} options={options} />
      </div>

      <div className="earnings-breakdown__stats">
        <div className="earnings-breakdown__stat">
          <span className="earnings-breakdown__stat-label">Average per Assignment</span>
          <span className="earnings-breakdown__stat-value">
            £{data.averagePerAssignment.toFixed(2)}
          </span>
        </div>
        <div className="earnings-breakdown__stat">
          <span className="earnings-breakdown__stat-label">Highest Earning</span>
          <span className="earnings-breakdown__stat-value">
            £{data.highestEarning.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EarningsBreakdown;
