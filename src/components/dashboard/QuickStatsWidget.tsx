import React from 'react';
import { FaStar, FaClock, FaCheckCircle, FaFire } from 'react-icons/fa';
import { ProtectionOfficer } from '../../lib/supabase';
import '../../styles/global.css';

interface QuickStatsWidgetProps {
  cpo: ProtectionOfficer;
  onTimePercentage?: number;
  activeStreak?: number;
}

const QuickStatsWidget: React.FC<QuickStatsWidgetProps> = ({
  cpo,
  onTimePercentage = 98,
  activeStreak = 12,
}) => {
  const stats = [
    {
      icon: FaStar,
      label: 'Rating',
      value: cpo.rating ? cpo.rating.toFixed(1) : 'N/A',
      color: 'var(--armora-gold)',
      bgColor: 'rgba(212, 175, 55, 0.1)',
      suffix: cpo.rating ? '/5.0' : '',
    },
    {
      icon: FaClock,
      label: 'On-Time',
      value: onTimePercentage,
      color: 'var(--armora-success)',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      suffix: '%',
    },
    {
      icon: FaCheckCircle,
      label: 'Completed',
      value: cpo.total_assignments || 0,
      color: 'var(--armora-info)',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      suffix: '',
    },
    {
      icon: FaFire,
      label: 'Active Streak',
      value: activeStreak,
      color: 'var(--armora-warning)',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      suffix: ' days',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--armora-space-md)',
      }}
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--armora-space-lg)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background decoration */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                backgroundColor: stat.bgColor,
                borderRadius: '50%',
                opacity: 0.5,
              }}
            />

            {/* Icon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: 'var(--armora-radius-lg)',
                backgroundColor: stat.bgColor,
                marginBottom: 'var(--armora-space-md)',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Icon color={stat.color} size={24} />
            </div>

            {/* Value */}
            <h2
              className="font-display"
              style={{
                fontSize: 'var(--armora-text-3xl)',
                fontWeight: 'var(--armora-weight-extrabold)',
                color: 'var(--armora-navy)',
                margin: 0,
                marginBottom: 'var(--armora-space-xs)',
                lineHeight: 1,
                position: 'relative',
                zIndex: 1,
              }}
            >
              {stat.value}
              {stat.suffix && (
                <span
                  style={{
                    fontSize: 'var(--armora-text-sm)',
                    fontWeight: 'var(--armora-weight-normal)',
                    color: 'var(--armora-text-secondary)',
                  }}
                >
                  {stat.suffix}
                </span>
              )}
            </h2>

            {/* Label */}
            <p
              className="text-sm text-secondary"
              style={{
                margin: 0,
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default QuickStatsWidget;
