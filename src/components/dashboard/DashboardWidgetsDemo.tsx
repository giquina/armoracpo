/**
 * Dashboard Widgets Demo
 *
 * This file demonstrates how to use all the new Dashboard widget components
 * with mock data. Use this as a reference for integration.
 */

import React from 'react';
import { FiBriefcase, FiDollarSign, FiStar, FiClock } from 'react-icons/fi';
import { QuickStatsCard } from './QuickStatsCard';
import { UpcomingAssignmentsWidget } from './UpcomingAssignmentsWidget';
import { RecentActivityFeed } from './RecentActivityFeed';
import { ProfileCompletionWidget } from './ProfileCompletionWidget';
import { PerformanceMetricsCard } from './PerformanceMetricsCard';

export const DashboardWidgetsDemo: React.FC = () => {
  // Mock data for QuickStatsCard
  const quickStats = [
    {
      title: 'Active Jobs',
      value: 3,
      change: '+2 this week',
      trend: 'up' as const,
      icon: <FiBriefcase />,
      link: '/jobs',
      color: 'navy' as const,
    },
    {
      title: 'This Week Earnings',
      value: '£1,450',
      change: '+12% vs last week',
      trend: 'up' as const,
      icon: <FiDollarSign />,
      link: '/earnings',
      color: 'gold' as const,
    },
    {
      title: 'Average Rating',
      value: '4.8',
      change: '+0.2 this month',
      trend: 'up' as const,
      icon: <FiStar />,
      link: '/profile',
      color: 'success' as const,
    },
    {
      title: 'Hours This Month',
      value: 120,
      change: '30 hours remaining',
      trend: 'neutral' as const,
      icon: <FiClock />,
      color: 'warning' as const,
    },
  ];

  // Mock data for UpcomingAssignmentsWidget
  const upcomingAssignments = [
    {
      id: '1',
      title: 'Executive Protection - City Event',
      clientName: 'Client A',
      location: { area: 'Mayfair, London' },
      startDate: new Date(2025, 9, 5, 18, 0),
      endDate: new Date(2025, 9, 5, 23, 0),
      duration: '5 hours',
      payRate: 45,
      status: 'confirmed' as const,
    },
    {
      id: '2',
      title: 'VIP Transport - Airport Transfer',
      clientName: 'Client B',
      location: { area: 'Heathrow, London' },
      startDate: new Date(2025, 9, 7, 14, 30),
      endDate: new Date(2025, 9, 7, 17, 30),
      duration: '3 hours',
      payRate: 40,
      status: 'pending' as const,
    },
    {
      id: '3',
      title: 'Corporate Security - Conference',
      clientName: 'Client C',
      location: { area: 'Canary Wharf, London' },
      startDate: new Date(2025, 9, 10, 9, 0),
      endDate: new Date(2025, 9, 10, 18, 0),
      duration: '9 hours',
      payRate: 50,
      status: 'confirmed' as const,
    },
  ];

  // Mock data for RecentActivityFeed
  const recentActivities = [
    {
      id: '1',
      type: 'application_accepted' as const,
      title: 'Application Accepted',
      description: 'Your application for Executive Protection assignment has been accepted',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      link: '/jobs/active',
    },
    {
      id: '2',
      type: 'payment_received' as const,
      title: 'Payment Received',
      description: 'Payment of £450.00 has been processed for assignment #12345',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      link: '/earnings',
    },
    {
      id: '3',
      type: 'job_match' as const,
      title: 'New Job Match',
      description: 'New assignment matches your profile: VIP Transport',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      link: '/jobs',
    },
    {
      id: '4',
      type: 'review_received' as const,
      title: 'Review Received',
      description: 'Client rated you 5 stars for your professionalism',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      link: '/profile',
    },
    {
      id: '5',
      type: 'message_received' as const,
      title: 'New Message',
      description: 'You have a new message from Client Operations',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      link: '/messages',
    },
  ];

  // Mock data for ProfileCompletionWidget
  const profileCompletion = {
    completion: 75,
    missingSections: [
      {
        id: '1',
        name: 'Bank Details',
        completed: false,
        link: '/profile#bank-details',
      },
      {
        id: '2',
        name: 'Emergency Contact',
        completed: false,
        link: '/profile#emergency-contact',
      },
      {
        id: '3',
        name: 'Professional References',
        completed: false,
        link: '/profile#references',
      },
    ],
  };

  // Mock data for PerformanceMetricsCard
  const performanceMetrics = {
    responseRate: 92,
    averageRating: 4.8,
    jobsCompleted: 47,
    reliabilityScore: 95,
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>Dashboard Widgets Demo</h1>

      {/* Quick Stats Grid */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px' }}>Quick Stats Cards</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {quickStats.map((stat, index) => (
            <QuickStatsCard key={index} {...stat} />
          ))}
        </div>
      </section>

      {/* Two Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        {/* Upcoming Assignments */}
        <section>
          <UpcomingAssignmentsWidget
            assignments={upcomingAssignments}
            onViewAll={() => console.log('View all assignments')}
          />
        </section>

        {/* Recent Activity */}
        <section>
          <RecentActivityFeed
            activities={recentActivities}
            onViewAll={() => console.log('View all activities')}
          />
        </section>
      </div>

      {/* Profile & Performance */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Profile Completion */}
        <section>
          <ProfileCompletionWidget
            completion={profileCompletion.completion}
            missingSections={profileCompletion.missingSections}
            onComplete={() => console.log('Complete profile')}
          />
        </section>

        {/* Performance Metrics */}
        <section>
          <PerformanceMetricsCard {...performanceMetrics} />
        </section>
      </div>
    </div>
  );
};
