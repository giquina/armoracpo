# Splash Screen Component

Professional splash screen for the ArmoraCPO application featuring animated branding and loading states.

## Features

- **Full-screen centered layout** (100vh/100dvh, no scrolling)
- **Shield logo** (🛡️) with spring entrance animation
- **ArmoraCPO wordmark** with shimmer effect
- **Tagline**: "Professional Close Protection Platform"
- **Navy gradient background** using design system colors
- **Gold accents** with animated glow effects
- **Framer Motion animations**: fade-in, scale, spring, and shimmer
- **Auto-advance** after 2.5 seconds (configurable)
- **Tap to skip** functionality
- **Mobile-first responsive** design
- **Safe area support** for devices with notches

## Usage

### Basic Usage

```tsx
import Splash from './screens/Splash';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <Splash onComplete={() => setShowSplash(false)} />}
      {!showSplash && <MainApp />}
    </>
  );
}
```

### With Custom Duration

```tsx
<Splash
  onComplete={() => setShowSplash(false)}
  duration={3000} // 3 seconds
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onComplete` | `() => void` | `undefined` | Callback fired when splash screen completes |
| `duration` | `number` | `2500` | Duration in milliseconds before auto-advance |

## Animations

1. **Logo Entrance** (0.2s delay)
   - Scale from 0 to 1
   - Rotate from -180° to 0°
   - Spring animation for natural feel

2. **Shield Shimmer** (continuous)
   - Pulsing gold glow effect
   - 2-second cycle

3. **Wordmark** (0.6s delay)
   - Fade in from bottom
   - Continuous text shadow shimmer

4. **Tagline** (0.9s delay)
   - Fade in from bottom
   - Subtle slide up

5. **Loading Bar** (1.2s delay)
   - Progress bar fills over duration
   - Gold gradient with glow

6. **Skip Hint** (1.5s delay)
   - Fades in at bottom

## Design System Integration

Uses ArmoraCPO design system variables from `global.css`:

- `--armora-navy`: Primary background color
- `--armora-navy-dark`: Gradient start
- `--armora-navy-light`: Gradient end
- `--armora-gold`: Primary accent color
- `--armora-gold-light`: Hover states
- `--armora-text-inverse`: Text on dark backgrounds
- `--armora-font-display`: Montserrat for wordmark
- `--armora-font-body`: Inter for tagline
- `--armora-safe-*`: Safe area insets for notched devices

## Responsive Behavior

### Mobile Portrait (< 640px)
- Smaller shield icon (100px)
- Reduced font sizes
- Tighter spacing

### Extra Small (< 375px)
- Further size reduction (80px shield)
- Minimum viable sizes maintained

### Landscape Mode (< 500px height)
- Compact vertical spacing
- Smaller elements to fit
- Bottom hint repositioned

### Accessibility

- **Reduced Motion**: Respects `prefers-reduced-motion`
- **High Contrast**: Enhanced visibility in high contrast mode
- **Touch Targets**: Entire screen is tappable for skip
- **Safe Areas**: Supports iPhone notch and Android gesture areas

## File Structure

```
/screens/Splash/
├── Splash.tsx       # Main component (155 lines)
├── Splash.css       # Styles (249 lines)
├── index.ts         # Export
└── README.md        # Documentation
```

## Dependencies

- `react`: ^19.2.0
- `framer-motion`: ^12.23.22 (already in package.json)

## Browser Support

- Modern browsers with CSS Grid and Flexbox
- iOS Safari 12+
- Chrome/Edge (latest)
- Firefox (latest)
- Supports dynamic viewport units (`100dvh`)
