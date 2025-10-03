# Dashboard Widgets Documentation

Complete guide to the comprehensive Dashboard widget components for ArmoraCPO.

## Overview

All widgets are designed with the Armora design system, featuring:
- **Mobile-first responsive design**
- **Framer Motion animations**
- **TypeScript type safety**
- **Professional CPO terminology**
- **Accessible keyboard navigation**
- **React Icons integration**

---

## Components

### 1. QuickStatsCard

**Location:** `/src/components/dashboard/QuickStatsCard.tsx`

Individual stat card with large value display, trend indicator, and optional navigation.

#### Props

```typescript
interface QuickStatsCardProps {
  title: string;               // Stat label (e.g., "Active Jobs")
  value: string | number;      // Main value to display
  change?: string;             // Change text (e.g., "+12% vs last month")
  trend?: 'up' | 'down' | 'neutral';  // Trend direction
  icon: React.ReactNode;       // Icon from react-icons
  link?: string;               // Navigation path (makes card clickable)
  color?: 'navy' | 'gold' | 'success' | 'warning' | 'danger';
}
```

#### Usage

```tsx
import { FiBriefcase } from 'react-icons/fi';
import { QuickStatsCard } from '@/components/dashboard';

<QuickStatsCard
  title="Active Jobs"
  value={3}
  change="+2 this week"
  trend="up"
  icon={<FiBriefcase />}
  link="/jobs"
  color="navy"
/>
```

#### Features
- Large, bold value display
- Trend indicators with icons (up/down/neutral arrows)
- Color-coded left border
- Hover animation with shadow lift
- Click/keyboard navigation support

---

### 2. UpcomingAssignmentsWidget

**Location:** `/src/components/dashboard/UpcomingAssignmentsWidget.tsx`

Calendar-style list of upcoming assignments with date badges.

#### Props

```typescript
interface Assignment {
  id: string;
  title: string;
  clientName: string;          // Anonymized client name
  location: { area: string };  // Location area (e.g., "Mayfair, London")
  startDate: Date;
  endDate: Date;
  duration: string;            // Display duration (e.g., "5 hours")
  payRate: number;             // Hourly rate
  status: 'confirmed' | 'pending' | 'in_progress';
}

interface UpcomingAssignmentsWidgetProps {
  assignments: Assignment[];
  onViewAll: () => void;       // Callback for "View All" button
}
```

#### Usage

```tsx
import { UpcomingAssignmentsWidget } from '@/components/dashboard';

const assignments = [
  {
    id: '1',
    title: 'Executive Protection - City Event',
    clientName: 'Client A',
    location: { area: 'Mayfair, London' },
    startDate: new Date(2025, 9, 5, 18, 0),
    endDate: new Date(2025, 9, 5, 23, 0),
    duration: '5 hours',
    payRate: 45,
    status: 'confirmed',
  },
];

<UpcomingAssignmentsWidget
  assignments={assignments}
  onViewAll={() => navigate('/schedule')}
/>
```

#### Features
- Date badge with day/month display
- Status indicators (confirmed/pending/in_progress)
- Location, duration, and pay rate details
- Formatted date/time range
- Shows up to 5 assignments
- Empty state when no assignments
- Staggered entry animations

---

### 3. RecentActivityFeed

**Location:** `/src/components/dashboard/RecentActivityFeed.tsx`

Timeline-style activity feed with icons and relative timestamps.

#### Props

```typescript
interface Activity {
  id: string;
  type: 'application_submitted' | 'application_accepted' |
        'application_rejected' | 'job_match' | 'message_received' |
        'payment_received' | 'review_received';
  title: string;
  description: string;
  timestamp: Date;
  icon?: React.ReactNode;      // Optional custom icon
  link?: string;               // Optional navigation path
}

interface RecentActivityFeedProps {
  activities: Activity[];
  onViewAll: () => void;
}
```

#### Usage

```tsx
import { RecentActivityFeed } from '@/components/dashboard';

const activities = [
  {
    id: '1',
    type: 'application_accepted',
    title: 'Application Accepted',
    description: 'Your application for Executive Protection has been accepted',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    link: '/jobs/active',
  },
];

<RecentActivityFeed
  activities={activities}
  onViewAll={() => navigate('/activity')}
/>
```

#### Features
- Timeline layout with connecting lines
- Auto-mapped icons per activity type
- Color-coded activity types
- Relative timestamps ("2 hours ago", "3 days ago")
- Clickable items (when link provided)
- Shows up to 10 activities
- Empty state support
- Fade-in animations

---

### 4. ProfileCompletionWidget

**Location:** `/src/components/dashboard/ProfileCompletionWidget.tsx`

Circular progress indicator with checklist of missing profile sections.

#### Props

```typescript
interface ProfileSection {
  id: string;
  name: string;                // Section name (e.g., "Bank Details")
  completed: boolean;
  link: string;                // Deep link to section
}

interface ProfileCompletionWidgetProps {
  completion: number;          // 0-100 percentage
  missingSections: ProfileSection[];
  onComplete: () => void;      // Callback for "Complete Profile" button
}
```

#### Usage

```tsx
import { ProfileCompletionWidget } from '@/components/dashboard';

const missingSections = [
  {
    id: '1',
    name: 'Bank Details',
    completed: false,
    link: '/profile#bank-details',
  },
];

<ProfileCompletionWidget
  completion={75}
  missingSections={missingSections}
  onComplete={() => navigate('/profile')}
/>
```

#### Features
- Animated circular progress ring
- Color-coded completion levels:
  - 100%: Green (Complete)
  - 70-99%: Gold (Almost There)
  - 40-69%: Warning (Keep Going)
  - 0-39%: Red (Get Started)
- Clickable checklist items
- Deep linking to specific sections
- Animated progress fill (1s duration)
- Motivational messaging

---

### 5. PerformanceMetricsCard

**Location:** `/src/components/dashboard/PerformanceMetricsCard.tsx`

Professional metrics dashboard with gauges and star ratings.

#### Props

```typescript
interface PerformanceMetricsCardProps {
  responseRate: number;        // 0-100 percentage
  averageRating: number;       // 0-5 star rating
  jobsCompleted: number;       // Total completed jobs
  reliabilityScore: number;    // 0-100 percentage
}
```

#### Usage

```tsx
import { PerformanceMetricsCard } from '@/components/dashboard';

<PerformanceMetricsCard
  responseRate={92}
  averageRating={4.8}
  jobsCompleted={47}
  reliabilityScore={95}
/>
```

#### Features
- 2x2 grid layout (responsive to single column)
- Response Rate: Gauge bar + percentage
- Average Rating: Star display + numeric value
- Jobs Completed: Large number display
- Reliability Score: Gauge bar + percentage
- Color-coded scores:
  - 90-100%: Green (Excellent)
  - 70-89%: Warning (Good)
  - 0-69%: Red (Needs Improvement)
- Animated gauge fills (1s duration)
- Gold star ratings with half-star support
- Professional footer message

---

## Integration Example

### Import Components

```tsx
import {
  QuickStatsCard,
  UpcomingAssignmentsWidget,
  RecentActivityFeed,
  ProfileCompletionWidget,
  PerformanceMetricsCard,
} from '@/components/dashboard';
```

### Dashboard Layout

```tsx
export const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      {/* Quick Stats Grid */}
      <section className="dashboard__stats-grid">
        <QuickStatsCard {...statsData} />
      </section>

      {/* Two Column Layout */}
      <div className="dashboard__two-column">
        <UpcomingAssignmentsWidget {...assignmentsData} />
        <RecentActivityFeed {...activityData} />
      </div>

      {/* Profile & Performance */}
      <div className="dashboard__bottom-grid">
        <ProfileCompletionWidget {...profileData} />
        <PerformanceMetricsCard {...metricsData} />
      </div>
    </div>
  );
};
```

---

## Responsive Behavior

All widgets are mobile-first responsive:

### Mobile (< 640px)
- Single column layouts
- Reduced padding and icon sizes
- Stacked elements in assignment cards
- Simplified date displays

### Tablet (640px - 768px)
- 2-column grids where appropriate
- Optimized touch targets (44px minimum)
- Enhanced spacing

### Desktop (> 768px)
- Full multi-column layouts
- Hover effects and animations
- Maximum readability

---

## Styling

All widgets use:
- **CSS Variables** from `global.css`
- **Armora Brand Colors** (Navy, Gold)
- **Consistent Spacing** (8px grid system)
- **Typography** (Montserrat display, Inter body)
- **Professional Shadows** and borders

### Custom Styling

Override with className prop:

```tsx
<QuickStatsCard
  className="my-custom-stats"
  {...props}
/>
```

---

## Accessibility

All widgets support:
- **Keyboard Navigation** (Tab, Enter, Space)
- **ARIA Labels** and roles
- **Focus States** with visible outlines
- **Screen Reader** friendly content
- **Color Contrast** WCAG AA compliant
- **Touch Targets** 44px minimum

---

## Animations

Built with Framer Motion:
- **Entry Animations**: Fade in + slide up/left
- **Staggered Children**: Delayed entry per item
- **Hover Effects**: Lift, shadow, scale
- **Progress Bars**: Animated fills (1s ease-in-out)
- **Performance**: GPU-accelerated transforms

---

## Demo Component

See `/src/components/dashboard/DashboardWidgetsDemo.tsx` for complete working example with mock data.

To view demo:
```tsx
import { DashboardWidgetsDemo } from '@/components/dashboard';

// In your route
<Route path="/demo" element={<DashboardWidgetsDemo />} />
```

---

## Testing

Example test setup:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickStatsCard } from './QuickStatsCard';

test('renders QuickStatsCard with value', () => {
  render(
    <QuickStatsCard
      title="Active Jobs"
      value={5}
      icon={<span>Icon</span>}
    />
  );
  expect(screen.getByText('5')).toBeInTheDocument();
  expect(screen.getByText('Active Jobs')).toBeInTheDocument();
});
```

---

## Mock Data

All components include TypeScript interfaces. Use mock data generators:

```tsx
// Mock assignments
const mockAssignments = Array.from({ length: 5 }, (_, i) => ({
  id: `${i}`,
  title: `Assignment ${i + 1}`,
  clientName: `Client ${String.fromCharCode(65 + i)}`,
  location: { area: 'London' },
  startDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
  endDate: new Date(Date.now() + (i + 0.5) * 24 * 60 * 60 * 1000),
  duration: '5 hours',
  payRate: 45,
  status: 'confirmed' as const,
}));
```

---

## File Structure

```
src/components/dashboard/
├── QuickStatsCard.tsx
├── QuickStatsCard.css
├── UpcomingAssignmentsWidget.tsx
├── UpcomingAssignmentsWidget.css
├── RecentActivityFeed.tsx
├── RecentActivityFeed.css
├── ProfileCompletionWidget.tsx
├── ProfileCompletionWidget.css
├── PerformanceMetricsCard.tsx
├── PerformanceMetricsCard.css
├── DashboardWidgetsDemo.tsx
├── index.ts
└── WIDGETS_README.md (this file)
```

---

## Next Steps

1. **Integration**: Import into main Dashboard screen
2. **Data Fetching**: Connect to Supabase/services
3. **Real-time Updates**: Add subscriptions for live data
4. **Analytics**: Track widget interactions
5. **Testing**: Add unit and integration tests

---

## Support

For issues or questions:
1. Check TypeScript types in component files
2. Review demo component for usage examples
3. Verify CSS variables in `global.css`
4. Consult `CLAUDE.md` for project conventions
