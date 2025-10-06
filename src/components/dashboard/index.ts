/**
 * Dashboard Components Index
 *
 * Centralized exports for all Dashboard widgets and components
 */

// Existing components
export { default as WelcomeHeader } from './WelcomeHeader';
export { default as AvailabilityToggle } from './AvailabilityToggle';
export { default as ActiveAssignmentCard } from './ActiveAssignmentCard';
export { default as QuickStatsWidget } from './QuickStatsWidget';
export { default as RecommendedJobs } from './RecommendedJobs';
export { default as EarningsSummary } from './EarningsSummary';
export { default as PerformanceInsights } from './PerformanceInsights';

// Operational Status Widgets
export { default as OperationalStatusWidget } from './OperationalStatusWidget';
export type { OperationalStatus, OperationalStatusWidgetProps } from './OperationalStatusWidget';
export { default as SIAVerificationBadge } from './SIAVerificationBadge';
export type { SIAVerificationBadgeProps } from './SIAVerificationBadge';

// New widget components
export { QuickStatsCard } from './QuickStatsCard';
export type { QuickStatsCardProps } from './QuickStatsCard';

export { UpcomingAssignmentsWidget } from './UpcomingAssignmentsWidget';
export type { UpcomingAssignmentsWidgetProps, Assignment } from './UpcomingAssignmentsWidget';

export { RecentActivityFeed } from './RecentActivityFeed';
export type { RecentActivityFeedProps, Activity } from './RecentActivityFeed';

export { ProfileCompletionWidget } from './ProfileCompletionWidget';
export type { ProfileCompletionWidgetProps, ProfileSection } from './ProfileCompletionWidget';

export { PerformanceMetricsCard } from './PerformanceMetricsCard';
export type { PerformanceMetricsCardProps } from './PerformanceMetricsCard';

// Demo component
// Demo component removed during cleanup
