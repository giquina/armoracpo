import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { FaPoundSign, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import '../../styles/global.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface EarningsSummaryProps {
  cpoId: string;
}

const EarningsSummary: React.FC<EarningsSummaryProps> = ({ cpoId }) => {
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [lastMonthEarnings, setLastMonthEarnings] = useState(0);
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    // Mock data - replace with actual API call
    setMonthlyEarnings(4250);
    setLastMonthEarnings(3800);
    setWeeklyData([950, 1100, 1050, 1150]);
  }, [cpoId]);

  const percentageChange = lastMonthEarnings > 0
    ? ((monthlyEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
    : 0;
  const isIncrease = percentageChange >= 0;

  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Weekly Earnings',
        data: weeklyData,
        borderColor: 'rgba(212, 175, 55, 1)',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(212, 175, 55, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
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

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-md">
        <div>
          <p className="text-sm text-secondary mb-xs">This Month's Earnings</p>
          <div className="flex items-center gap-sm">
            <FaPoundSign color="var(--armora-gold)" size={28} />
            <h1
              className="font-display"
              style={{
                fontSize: 'var(--armora-text-4xl)',
                fontWeight: 'var(--armora-weight-extrabold)',
                color: 'var(--armora-navy)',
                margin: 0,
                lineHeight: 1,
              }}
            >
              {monthlyEarnings.toLocaleString()}
            </h1>
          </div>
        </div>

        {/* Comparison Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--armora-space-xs)',
            padding: 'var(--armora-space-sm) var(--armora-space-md)',
            borderRadius: 'var(--armora-radius-full)',
            backgroundColor: isIncrease
              ? 'rgba(16, 185, 129, 0.1)'
              : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${
              isIncrease ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
            }`,
          }}
        >
          {isIncrease ? (
            <FaArrowUp color="var(--armora-success)" size={14} />
          ) : (
            <FaArrowDown color="var(--armora-danger)" size={14} />
          )}
          <span
            className="text-sm font-semibold"
            style={{
              color: isIncrease ? 'var(--armora-success)' : 'var(--armora-danger)',
            }}
          >
            {Math.abs(percentageChange).toFixed(1)}%
          </span>
        </div>
      </div>

      <p className="text-sm text-secondary mb-lg">
        vs. last month: £{lastMonthEarnings.toLocaleString()}
      </p>

      {/* Weekly Breakdown Chart */}
      <div style={{ height: '180px', marginTop: 'var(--armora-space-md)' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default EarningsSummary;
