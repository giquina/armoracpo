/**
 * Dashboard Components Index
 *
 * Centralized exports for all Dashboard widgets and components
 */

// Existing components
export { WelcomeHeader } from './WelcomeHeader';
export { AvailabilityToggle } from './AvailabilityToggle';
export { ActiveAssignmentCard } from './ActiveAssignmentCard';
export { QuickStatsWidget } from './QuickStatsWidget';
export { RecommendedJobs } from './RecommendedJobs';
export { EarningsSummary } from './EarningsSummary';
export { PerformanceInsights } from './PerformanceInsights';

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
export { DashboardWidgetsDemo } from './DashboardWidgetsDemo';
