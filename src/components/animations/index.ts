/**
 * Animation Components Index
 * Centralized exports for all animation components
 */

// Page & Layout Animations
export { PageTransition } from './PageTransition';
export type { PageTransitionProps, TransitionVariant } from './PageTransition';

// Basic Animation Wrappers
export { FadeIn } from './FadeIn';
export type { FadeInProps } from './FadeIn';

export { SlideIn } from './SlideIn';
export type { SlideInProps, SlideDirection } from './SlideIn';

export { ScaleIn } from './ScaleIn';
export type { ScaleInProps } from './ScaleIn';

// List Animations
export { StaggeredList } from './StaggeredList';
export type { StaggeredListProps } from './StaggeredList';

export { AnimatedListItem } from './AnimatedListItem';
export type { AnimatedListItemProps } from './AnimatedListItem';

// Loading Animations
export { LoadingDots } from './LoadingDots';
export type { LoadingDotsProps } from './LoadingDots';

// Feedback Animations
export { SuccessCheckmark } from './SuccessCheckmark';
export type { SuccessCheckmarkProps } from './SuccessCheckmark';

export { ErrorShake } from './ErrorShake';
export type { ErrorShakeProps } from './ErrorShake';

// Mobile Interactions
export { PullToRefresh } from './PullToRefresh';
export type { PullToRefreshProps } from './PullToRefresh';

export { SwipeableCard } from './SwipeableCard';
export type { SwipeableCardProps } from './SwipeableCard';
