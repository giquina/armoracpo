import React from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiTrendingUp, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { StatisticsSectionProps } from './types';
import { IconWrapper } from '../../utils/IconWrapper';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * StatisticsSection Component
 *
 * Displays CPO performance statistics and analytics.
 */
export const StatisticsSection: React.FC<StatisticsSectionProps> = ({ cpo }) => {
  // Mock data for demonstration
  const stats = {
    totalAssignments: cpo.total_assignments || 0,
    averageRating: cpo.rating || 0,
    onTimePercentage: 98,
    totalEarnings: 12500,
  };

  // Specialization breakdown data (mock)
  const specializationData = {
    labels: ['Executive', 'Event', 'Residential', 'Transport'],
    datasets: [
      {
        data: [12, 8, 5, 3],
        backgroundColor: [
          'rgba(10, 31, 68, 0.8)',
          'rgba(212, 175, 55, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Monthly assignments data (mock)
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Assignments',
        data: [3, 5, 4, 6, 7, 5],
        backgroundColor: 'rgba(10, 31, 68, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="card"
      style={{ marginBottom: 'var(--armora-space-md)' }}
    >
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--armora-space-sm)', marginBottom: 'var(--armora-space-lg)' }}>
        <IconWrapper icon={FiBarChart2} size={20} color="var(--armora-navy)"/>
        <h3>Performance Statistics</h3>
      </div>

      {/* Key Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--armora-space-md)', marginBottom: 'var(--armora-space-lg)' }}>
        <StatCard
          icon={<IconWrapper icon={FiCheckCircle} size={20} color="var(--armora-success)"/>}
          label="Total Assignments"
          value={stats.totalAssignments.toString()}
          color="var(--armora-success)"
        />
        <StatCard
          icon={<IconWrapper icon={FiTrendingUp} size={20} color="var(--armora-gold)"/>}
          label="Average Rating"
          value={`${stats.averageRating.toFixed(1)} ⭐`}
          color="var(--armora-gold)"
        />
        <StatCard
          icon={<IconWrapper icon={FiCheckCircle} size={20} color="var(--armora-info)"/>}
          label="On-Time %"
          value={`${stats.onTimePercentage}%`}
          color="var(--armora-info)"
        />
        <StatCard
          icon={<IconWrapper icon={FiDollarSign} size={20} color="var(--armora-navy)"/>}
          label="Total Earnings"
          value={`£${stats.totalEarnings.toLocaleString()}`}
          color="var(--armora-navy)"
        />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--armora-space-md)' }}>
        {/* Specialization Breakdown */}
        <div>
          <h4 style={{ fontSize: 'var(--armora-text-base)', marginBottom: 'var(--armora-space-md)' }}>
            Assignment Breakdown
          </h4>
          <div style={{ maxWidth: 200, margin: '0 auto' }}>
            <Doughnut
              data={specializationData}
              options={{
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { font: { size: 11 } },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Monthly Trend */}
        <div>
          <h4 style={{ fontSize: 'var(--armora-text-base)', marginBottom: 'var(--armora-space-md)' }}>
            Assignments (Last 6 Months)
          </h4>
          <Bar
            data={monthlyData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } },
              },
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Stat Card Component
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({
  icon,
  label,
  value,
  color,
}) => (
  <div
    style={{
      padding: 'var(--armora-space-md)',
      backgroundColor: 'var(--armora-bg-secondary)',
      borderRadius: 'var(--armora-radius-md)',
      textAlign: 'center',
    }}
  >
    <div style={{ marginBottom: 'var(--armora-space-sm)' }}>{icon}</div>
    <p style={{ fontSize: 'var(--armora-text-sm)', color: 'var(--armora-text-secondary)', marginBottom: 'var(--armora-space-xs)' }}>
      {label}
    </p>
    <p style={{ fontSize: 'var(--armora-text-xl)', fontWeight: 'var(--armora-weight-bold)', color }}>
      {value}
    </p>
  </div>
);

export default StatisticsSection;
