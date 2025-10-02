import React, { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import '../../styles/global.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerformanceInsightsProps {
  cpoId: string;
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({ cpoId }) => {
  const [earningsData, setEarningsData] = useState<number[]>([]);
  const [assignmentTypeData, setAssignmentTypeData] = useState<number[]>([]);

  useEffect(() => {
    // Mock data - replace with actual API call
    setEarningsData([2800, 3200, 3500, 3100, 3800, 4250]);
    setAssignmentTypeData([12, 8, 15, 5]); // close_protection, event_security, residential, executive
  }, [cpoId]);

  // Earnings line chart
  const earningsChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Earnings',
        data: earningsData,
        borderColor: 'rgba(10, 31, 68, 1)',
        backgroundColor: 'rgba(10, 31, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(10, 31, 68, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const earningsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(10, 31, 68, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context: any) => `£${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
          callback: (value: any) => `£${value}`,
        },
      },
    },
  };

  // Assignment type doughnut chart
  const assignmentChartData = {
    labels: ['Close Protection', 'Event Security', 'Residential', 'Executive'],
    datasets: [
      {
        data: assignmentTypeData,
        backgroundColor: [
          'rgba(10, 31, 68, 0.9)',
          'rgba(212, 175, 55, 0.9)',
          'rgba(16, 185, 129, 0.9)',
          'rgba(59, 130, 246, 0.9)',
        ],
        borderColor: [
          'rgba(10, 31, 68, 1)',
          'rgba(212, 175, 55, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const assignmentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#374151',
          font: {
            size: 11,
          },
          padding: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(10, 31, 68, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: any) => ` ${context.label}: ${context.parsed} assignments`,
        },
      },
    },
  };

  const totalAssignments = assignmentTypeData.reduce((a, b) => a + b, 0);

  return (
    <div>
      <h3 className="mb-md">Performance Insights</h3>

      {/* Earnings Trend */}
      <div className="card mb-md">
        <h4 className="mb-sm">Earnings Trend (Last 6 Months)</h4>
        <p className="text-sm text-secondary mb-md">
          Track your monthly earnings growth
        </p>
        <div style={{ height: '220px' }}>
          <Line data={earningsChartData} options={earningsChartOptions} />
        </div>
      </div>

      {/* Assignment Breakdown */}
      <div className="card">
        <h4 className="mb-sm">Assignments by Type</h4>
        <p className="text-sm text-secondary mb-md">
          Total: {totalAssignments} assignments completed
        </p>
        <div style={{ height: '280px', display: 'flex', justifyContent: 'center' }}>
          <Doughnut data={assignmentChartData} options={assignmentChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default PerformanceInsights;
