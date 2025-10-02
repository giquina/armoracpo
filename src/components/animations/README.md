# ArmoraCPO Animation Components

Professional, performant animations for the ArmoraCPO platform using Framer Motion.

## Overview

This directory contains reusable animation components designed for:
- Smooth, 60fps performance
- Mobile-first optimization
- Accessibility (respects `prefers-reduced-motion`)
- Professional, subtle animations
- GPU-accelerated properties (transform, opacity)

## Components

### Page Transitions

#### PageTransition
Wrapper for full-page route transitions.

```tsx
import { PageTransition } from '@/components/animations';

<PageTransition variant="fade" duration={0.3}>
  <YourPage />
</PageTransition>
```

**Props:**
- `variant`: `'fade' | 'slide' | 'scale'` (default: `'fade'`)
- `duration`: number in seconds (default: `0.3`)
- `className`: optional CSS class

**Variants:**
- `fade`: Simple opacity transition
- `slide`: Slide from right (enter) / left (exit)
- `scale`: Scale up from 95% to 100%

---

### Basic Wrappers

#### FadeIn
Fade in children with optional delay.

```tsx
import { FadeIn } from '@/components/animations';

<FadeIn delay={0.2}>
  <Card />
</FadeIn>
```

**Props:**
- `delay`: number in seconds (default: `0`)
- `duration`: number in seconds (default: `0.3`)
- `className`: optional CSS class

---

#### SlideIn
Slide in from a direction.

```tsx
import { SlideIn } from '@/components/animations';

<SlideIn direction="bottom" delay={0.1}>
  <Card />
</SlideIn>
```

**Props:**
- `direction`: `'top' | 'bottom' | 'left' | 'right'` (default: `'bottom'`)
- `delay`: number in seconds (default: `0`)
- `duration`: number in seconds (default: `0.3`)
- `distance`: pixels to slide (default: `20`)
- `className`: optional CSS class

---

#### ScaleIn
Scale in from smaller size.

```tsx
import { ScaleIn } from '@/components/animations';

<ScaleIn delay={0.15} initialScale={0.9}>
  <Modal />
</ScaleIn>
```

**Props:**
- `delay`: number in seconds (default: `0`)
- `duration`: number in seconds (default: `0.3`)
- `initialScale`: starting scale (default: `0.9`)
- `className`: optional CSS class

---

### List Animations

#### StaggeredList
Container for staggered child animations.

```tsx
import { StaggeredList, AnimatedListItem } from '@/components/animations';

<StaggeredList staggerDelay={0.1}>
  <AnimatedListItem><JobCard /></AnimatedListItem>
  <AnimatedListItem><JobCard /></AnimatedListItem>
  <AnimatedListItem><JobCard /></AnimatedListItem>
</StaggeredList>
```

**Props:**
- `staggerDelay`: delay between items in seconds (default: `0.1`)
- `className`: optional CSS class

---

#### AnimatedListItem
Individual list item animation (must be child of StaggeredList).

```tsx
<AnimatedListItem index={0}>
  <Card />
</AnimatedListItem>
```

**Props:**
- `index`: optional index (for debugging)
- `className`: optional CSS class

---

### Loading Animations

#### LoadingDots
Three bouncing dots for loading states.

```tsx
import { LoadingDots } from '@/components/animations';

<LoadingDots color="var(--armora-gold)" size={8} />
```

**Props:**
- `color`: CSS color (default: `'var(--armora-gold)'`)
- `size`: dot size in pixels (default: `8`)
- `className`: optional CSS class

---

### Feedback Animations

#### SuccessCheckmark
Animated SVG checkmark with circle.

```tsx
import { SuccessCheckmark } from '@/components/animations';

<SuccessCheckmark
  size={80}
  color="var(--armora-success)"
  onComplete={() => console.log('Animation complete!')}
/>
```

**Props:**
- `size`: SVG size in pixels (default: `80`)
- `color`: stroke color (default: `'var(--armora-success)'`)
- `onComplete`: callback when animation finishes
- `className`: optional CSS class

**Animation:**
1. Circle draws from 0 to 360 degrees (0.5s)
2. Checkmark draws after delay (0.3s)

---

#### ErrorShake
Shake animation triggered by error state.

```tsx
import { ErrorShake } from '@/components/animations';

const [error, setError] = useState(null);

<ErrorShake error={error}>
  <FormInput />
</ErrorShake>
```

**Props:**
- `error`: boolean, string, or null (triggers shake when truthy)
- `className`: optional CSS class

**Animation:**
Shakes left-right 3 times when error changes to truthy.

---

### Mobile Interactions

#### PullToRefresh
Pull-to-refresh gesture for mobile.

```tsx
import { PullToRefresh } from '@/components/animations';

const handleRefresh = async () => {
  await fetchData();
};

<PullToRefresh onRefresh={handleRefresh} pullDistance={80}>
  <ScrollableContent />
</PullToRefresh>
```

**Props:**
- `onRefresh`: async function called when pulled
- `pullDistance`: pixels to pull (default: `80`)
- `className`: optional CSS class

**Behavior:**
1. User pulls down from scrollTop = 0
2. Spinner appears with pull progress
3. Release triggers `onRefresh()`
4. Spinner shows during refresh
5. Animates back on completion

---

#### SwipeableCard
Swipeable card for mobile gestures.

```tsx
import { SwipeableCard } from '@/components/animations';

<SwipeableCard
  onSwipeLeft={() => console.log('Swiped left')}
  onSwipeRight={() => console.log('Swiped right')}
  swipeThreshold={100}
>
  <Card />
</SwipeableCard>
```

**Props:**
- `onSwipeLeft`: callback for left swipe
- `onSwipeRight`: callback for right swipe
- `swipeThreshold`: pixels to trigger (default: `100`)
- `className`: optional CSS class

**Features:**
- Drag along x-axis
- Opacity and rotation follow drag
- Elastic snap-back if not swiped far enough

---

## Enhanced UI Components

### Button (Enhanced)
Now includes improved press animations:
- Hover: scale 1.02, lift -1px
- Tap: scale 0.96, press +1px

### Card (Enhanced)
Interactive cards have hover lift:
- Hover: lift -6px, enhanced shadow
- Tap: scale 0.98, lift -2px

### Modal (Enhanced)
Backdrop blur animation:
- Blur animates from 0px to 8px
- Smooth backdrop transition

### StatusBadge (Enhanced)
Operational status pulses:
- Badge scales 1.0 to 1.05
- Icon scales 1.0 to 1.2 with opacity
- Infinite loop, 2s duration

### LoadingSpinner (Enhanced)
Multiple animation variants:
- `spin`: Classic rotation (default)
- `pulse`: Scale + opacity pulse
- `bounce`: Vertical bounce

### Skeleton (Enhanced)
Shimmer effect already implemented in CSS.

---

## Utilities

### Haptics (`/utils/haptics.ts`)

Vibration feedback for mobile devices.

```tsx
import { haptics } from '@/utils/haptics';

// Check support
if (haptics.isSupported()) {
  // Trigger feedback
  haptics.light();    // 10ms
  haptics.medium();   // 20ms
  haptics.heavy();    // 40ms
  haptics.success();  // [10, 50, 10]
  haptics.warning();  // [20, 100, 20]
  haptics.error();    // [50, 100, 50, 100, 50]

  // Custom pattern
  haptics.pattern([100, 50, 100]);

  // Cancel
  haptics.cancel();
}
```

**Functions:**
- `isSupported()`: Check if vibration API available
- `vibrate(type)`: Trigger predefined pattern
- `light/medium/heavy()`: Quick vibration
- `success/warning/error()`: Feedback patterns
- `pattern(array)`: Custom vibration pattern
- `cancel()`: Stop vibration

---

## Performance Best Practices

### GPU Acceleration
All animations use GPU-accelerated properties:
- `transform` (translate, scale, rotate)
- `opacity`
- Avoid animating: `width`, `height`, `margin`, `padding`

### Reduced Motion
All components respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Mobile Optimization
- Touch-optimized gestures
- 44px minimum touch targets
- Hardware acceleration enabled
- Elastic/spring physics for natural feel

---

## Timing Guidelines

**Fast** (0.15-0.2s):
- Button presses
- Toggle switches
- Small UI feedback

**Normal** (0.2-0.3s):
- Card hover effects
- Modal open/close
- Page transitions
- List item animations

**Slow** (0.5-0.8s):
- Success checkmarks
- Error shakes
- Complex multi-step animations

---

## Example: Animated Screen

```tsx
import React from 'react';
import { PageTransition, FadeIn, StaggeredList, AnimatedListItem } from '@/components/animations';
import { haptics } from '@/utils/haptics';

const MyScreen = () => {
  const handleItemClick = () => {
    haptics.light();
    // Handle click
  };

  return (
    <PageTransition variant="fade">
      <div>
        <FadeIn delay={0.1}>
          <h1>My Screen</h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p>Description text</p>
        </FadeIn>

        <StaggeredList staggerDelay={0.1}>
          {items.map((item, index) => (
            <AnimatedListItem key={item.id} index={index}>
              <Card onClick={handleItemClick}>
                {item.content}
              </Card>
            </AnimatedListItem>
          ))}
        </StaggeredList>
      </div>
    </PageTransition>
  );
};
```

---

## Accessibility

All animations:
- Include proper ARIA labels
- Support keyboard navigation
- Respect `prefers-reduced-motion`
- Don't block user interaction
- Provide visual + haptic feedback

---

## Browser Support

- **Framer Motion**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Vibration API**: Android Chrome, Firefox; iOS Safari (limited)
- **Backdrop Filter**: Modern browsers (may degrade gracefully)

---

## Related Files

- `/src/components/ui/` - Enhanced UI components
- `/src/utils/haptics.ts` - Haptic feedback utility
- `/src/styles/global.css` - Design system variables
- `/src/App.tsx` - Page transition implementation

---

## Questions?

See main project documentation or check Framer Motion docs:
https://www.framer.com/motion/
