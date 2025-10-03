# ArmoraCPO Design System

**Version:** 1.0
**Last Updated:** 2025-10-03
**Status:** Production Ready

This document defines the complete visual design system for the ArmoraCPO platform - a professional security operations platform for SIA-licensed Close Protection Officers.

---

## Brand Identity

### Core Values
- **Professional:** Security operations demand unwavering professionalism
- **Trustworthy:** Lives depend on reliability and integrity
- **Elite:** Only for verified, licensed security professionals
- **British Heritage:** Reflecting UK security industry standards

### Visual Personality
- **Sophisticated:** Navy & gold color scheme conveys authority
- **Clear:** High contrast for critical security information
- **Confident:** Bold typography and decisive CTAs
- **Mobile-First:** Designed for operators in the field

---

## Color Palette

### Primary Brand Colors

```css
--armora-navy: #0A1F44          /* Deep Navy - Primary brand color */
--armora-gold: #D4AF37          /* Metallic Gold - Accent/CTA color */
--armora-navy-light: #1a3a5f    /* Lighter navy for hover states */
--armora-navy-dark: #050f22     /* Darker navy for depth */
--armora-gold-light: #e6c55c    /* Lighter gold for hover states */
--armora-gold-dark: #b8941f     /* Darker gold for active states */
```

**Usage:**
- Navy: Primary text, headings, buttons (secondary)
- Gold: Primary CTAs, active states, important accents
- Use gold sparingly for maximum impact

### Status Colors (CPO Availability)

```css
--armora-status-operational: #10B981   /* Available/Operational - Green */
--armora-status-busy: #EF4444          /* Busy/On Assignment - Red */
--armora-status-standdown: #6B7280     /* Stand Down/Offline - Gray */
```

### Threat Level Colors

```css
--armora-threat-low: #10B981        /* Low threat - Green */
--armora-threat-medium: #F59E0B     /* Medium threat - Amber */
--armora-threat-high: #EF4444       /* High threat - Red */
--armora-threat-critical: #DC2626   /* Critical threat - Deep Red */
```

### Semantic Colors

```css
--armora-success: #10B981   /* Success messages, positive actions */
--armora-warning: #F59E0B   /* Warnings, caution states */
--armora-danger: #EF4444    /* Errors, destructive actions */
--armora-info: #3B82F6      /* Informational messages */
```

### Background Colors

```css
--armora-bg-primary: #FFFFFF       /* Main background - white */
--armora-bg-secondary: #F8F9FA     /* Secondary background - light gray */
--armora-bg-tertiary: #E5E7EB      /* Tertiary background - medium gray */
--armora-bg-navy: #0A1F44          /* Navy background for hero sections */
--armora-bg-dark: #1F2937          /* Dark background variant */
```

### Text Colors

```css
--armora-text-primary: #0A1F44      /* Primary text (navy) - body, headings */
--armora-text-secondary: #6B7280    /* Secondary text (gray) - labels, metadata */
--armora-text-tertiary: #9CA3AF     /* Tertiary text (light gray) - placeholders */
--armora-text-inverse: #FFFFFF      /* Text on dark backgrounds */
--armora-text-gold: #D4AF37         /* Gold text for emphasis */
```

### Border Colors

```css
--armora-border-light: #E5E7EB      /* Light borders - subtle divisions */
--armora-border-medium: #D1D5DB     /* Medium borders - cards, inputs */
--armora-border-dark: #9CA3AF       /* Dark borders - emphasis */
--armora-border-navy: #0A1F44       /* Navy borders - strong divisions */
--armora-border-gold: #D4AF37       /* Gold borders - highlighted elements */
```

### Color Contrast Requirements

All color combinations must meet WCAG 2.1 AA standards:
- **Body text (16px):** Minimum 4.5:1 contrast ratio
- **Large text (18pt/24px):** Minimum 3.0:1 contrast ratio
- **UI components:** Minimum 3.0:1 contrast ratio

---

## Typography

### Font Families

```css
--armora-font-display: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
--armora-font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

**Usage:**
- **Montserrat:** Headings (h1-h6), display text, navigation
- **Inter:** Body text, buttons, form labels, descriptions

### Font Scale

```css
--armora-text-xs: 0.75rem      /* 12px - Fine print, metadata */
--armora-text-sm: 0.875rem     /* 14px - Small body text, labels */
--armora-text-base: 1rem       /* 16px - Base body text */
--armora-text-lg: 1.125rem     /* 18px - Large body text */
--armora-text-xl: 1.25rem      /* 20px - Small headings */
--armora-text-2xl: 1.5rem      /* 24px - Medium headings */
--armora-text-3xl: 1.875rem    /* 30px - Large headings */
--armora-text-4xl: 2.25rem     /* 36px - Hero headings */
```

### Font Weights

```css
--armora-weight-normal: 400      /* Regular body text */
--armora-weight-medium: 500      /* Emphasized text, labels */
--armora-weight-semibold: 600    /* Subheadings, strong emphasis */
--armora-weight-bold: 700        /* Headings, buttons */
--armora-weight-extrabold: 800   /* Hero headings, major CTAs */
```

### Line Heights

```css
--armora-leading-tight: 1.2      /* Headings, compact text */
--armora-leading-normal: 1.5     /* Body text (default) */
--armora-leading-relaxed: 1.75   /* Spacious paragraphs */
```

### Typography Best Practices

1. **Hierarchy:** Always maintain clear visual hierarchy (h1 > h2 > h3)
2. **Readability:** Use `--armora-leading-normal` (1.5) for body text
3. **Contrast:** Ensure text meets minimum contrast ratios
4. **Responsive:** Scale down heading sizes on mobile (<640px)

---

## Spacing System

**8px Base Scale:** All spacing uses multiples of 8px for visual harmony.

```css
--armora-space-xs: 0.25rem     /* 4px - Tight spacing */
--armora-space-sm: 0.5rem      /* 8px - Small gaps */
--armora-space-md: 1rem        /* 16px - Standard spacing (default) */
--armora-space-lg: 1.5rem      /* 24px - Section spacing */
--armora-space-xl: 2rem        /* 32px - Large sections */
--armora-space-2xl: 3rem       /* 48px - Major sections */
--armora-space-3xl: 4rem       /* 64px - Hero spacing */
```

### Usage Guidelines

- **Card Padding:** `--armora-space-lg` (24px)
- **Button Padding:** `--armora-space-md` vertical, `--armora-space-lg` horizontal
- **Section Gaps:** `--armora-space-lg` to `--armora-space-xl`
- **Component Gaps:** `--armora-space-md`
- **Tight Spacing:** `--armora-space-sm` for related items

---

## Border Radius

```css
--armora-radius-sm: 0.375rem    /* 6px - Small elements, badges */
--armora-radius-md: 0.5rem      /* 8px - Standard buttons, inputs */
--armora-radius-lg: 0.75rem     /* 12px - Cards, modals */
--armora-radius-xl: 1rem        /* 16px - Featured cards */
--armora-radius-2xl: 1.5rem     /* 24px - Hero sections */
--armora-radius-full: 9999px    /* Full round - pills, avatars */
```

---

## Shadows

Shadows convey depth and hierarchy. Use sparingly for professional appearance.

```css
--armora-shadow-sm: 0 1px 2px 0 rgba(10, 31, 68, 0.05);
--armora-shadow-md: 0 4px 6px -1px rgba(10, 31, 68, 0.1),
                    0 2px 4px -1px rgba(10, 31, 68, 0.06);
--armora-shadow-lg: 0 10px 15px -3px rgba(10, 31, 68, 0.1),
                    0 4px 6px -2px rgba(10, 31, 68, 0.05);
--armora-shadow-xl: 0 20px 25px -5px rgba(10, 31, 68, 0.1),
                    0 10px 10px -5px rgba(10, 31, 68, 0.04);
--armora-shadow-gold: 0 4px 12px 0 rgba(212, 175, 55, 0.2);
```

**Usage:**
- **Cards:** `--armora-shadow-md`
- **Modals:** `--armora-shadow-xl`
- **Gold CTAs:** `--armora-shadow-gold`
- **Hover States:** Increase shadow on interaction

---

## Z-Index Layers

Consistent layering prevents overlap issues.

```css
--armora-z-base: 0          /* Default layer */
--armora-z-dropdown: 50     /* Dropdowns, menus */
--armora-z-overlay: 80      /* Overlays, backdrops */
--armora-z-header: 90       /* Sticky headers */
--armora-z-nav: 100         /* Bottom navigation */
--armora-z-modal: 1000      /* Modals, dialogs */
--armora-z-toast: 1100      /* Toast notifications */
```

---

## Transitions

Smooth, professional animations enhance UX without distraction.

```css
--armora-transition-fast: 150ms ease-in-out      /* Quick feedback */
--armora-transition-base: 250ms ease-in-out      /* Standard (default) */
--armora-transition-slow: 350ms ease-in-out      /* Deliberate movements */
```

**Usage:**
- **Hover Effects:** `--armora-transition-fast`
- **State Changes:** `--armora-transition-base`
- **Modals/Overlays:** `--armora-transition-slow`

---

## Component Patterns

### Buttons

#### Primary CTA (Gold)
```css
.btn-primary {
  background: var(--armora-gold);
  color: var(--armora-navy);
  font-weight: var(--armora-weight-bold);
  box-shadow: var(--armora-shadow-md);
}
```

**Use for:** Main actions, accept assignment, confirm operations

#### Secondary (Navy Outline)
```css
.btn-secondary {
  background: transparent;
  color: var(--armora-navy);
  border: 2px solid var(--armora-navy);
}
```

**Use for:** Alternative actions, cancel, view details

#### Danger (Red)
```css
.btn-danger {
  background: var(--armora-danger);
  color: white;
}
```

**Use for:** Destructive actions, end assignment, reject

### Cards

**Standard Card:**
```css
.card {
  background: var(--armora-bg-primary);
  border-radius: var(--armora-radius-lg);
  padding: var(--armora-space-lg);
  box-shadow: var(--armora-shadow-md);
  border: 1px solid var(--armora-border-light);
}
```

**Hover Card (Interactive):**
```css
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--armora-shadow-lg);
}
```

### Forms

**Input Fields:**
```css
input, textarea, select {
  border: 2px solid var(--armora-border-light);
  border-radius: var(--armora-radius-md);
  padding: var(--armora-space-md);
  min-height: 44px; /* Touch target minimum */
  font-size: 16px; /* Prevents iOS zoom */
}

input:focus {
  border-color: var(--armora-navy);
  box-shadow: 0 0 0 3px rgba(10, 31, 68, 0.1);
}
```

**Error State:**
```css
input.error {
  border-color: var(--armora-danger);
}
```

### Badges

**Status Badges:**
```css
.badge-operational {
  background: #d1fae5;
  color: #065f46;
}

.badge-threat-high {
  background: #fee2e2;
  color: #991b1b;
}
```

---

## Mobile-First Guidelines

### Touch Targets

**Minimum size:** 44px × 44px (iOS/Android standard)

```css
--armora-touch-min: 44px;
```

All interactive elements (buttons, links, inputs) must meet this minimum.

### Safe Areas (Notched Devices)

```css
--armora-safe-top: env(safe-area-inset-top);
--armora-safe-bottom: env(safe-area-inset-bottom);
--armora-safe-left: env(safe-area-inset-left);
--armora-safe-right: env(safe-area-inset-right);
```

Use `.safe-top` and `.safe-bottom` utility classes on screen containers.

### Responsive Breakpoints

```css
/* Mobile: Default (320px+) */
/* Tablet: 768px+ */
/* Desktop: 1024px+ */
```

**Mobile-first approach:** Design for 320px, enhance for larger screens.

---

## Accessibility Standards

### Contrast Ratios
- ✅ Body text: ≥4.5:1
- ✅ Large text (18pt+): ≥3.0:1
- ✅ UI components: ≥3.0:1

### Focus States
All interactive elements must have visible focus indicators:
```css
:focus-visible {
  outline: 2px solid var(--armora-navy);
  outline-offset: 2px;
}
```

### Screen Reader Support
- Use semantic HTML (nav, main, article, etc.)
- Provide alt text for images
- Use aria-label for icon-only buttons

---

## Icon System

**Library:** React Icons (`react-icons/fa`, `react-icons/fi`)

**Icon Wrapper Component:**
```tsx
<IconWrapper icon={FaShieldAlt} color="var(--armora-gold)" size={24} />
```

**Sizing:**
- Small: 14px-16px (inline with text)
- Medium: 20px-24px (buttons, cards)
- Large: 32px-48px (features, empty states)
- Hero: 64px+ (major illustrations)

---

## Performance Guidelines

### Load Time Targets
- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3s on 3G
- **Total Bundle Size:** <500KB

### Optimization
- Use CSS variables (no JavaScript calculations)
- Minimize box-shadows (expensive to render)
- Avoid nested transforms
- Use `will-change` sparingly

---

## Implementation Checklist

When creating new components:

- [ ] Uses CSS variables from `global.css`
- [ ] Meets minimum touch target size (44px)
- [ ] Has visible hover/focus states
- [ ] Passes contrast ratio requirements
- [ ] Works on 320px width (iPhone SE)
- [ ] Smooth transitions (no jank)
- [ ] Semantic HTML structure
- [ ] Mobile-optimized spacing

---

## Common Mistakes to Avoid

❌ **Don't:**
- Use hardcoded colors (`#ffffff`, `#000000`)
- Create custom spacing values outside 8px scale
- Mix font families (stick to Montserrat/Inter)
- Use `!important` (indicates architecture issue)
- Create buttons smaller than 44px
- Use low-contrast text colors

✅ **Do:**
- Use CSS variables for all colors
- Follow 8px spacing scale
- Maintain visual hierarchy
- Test on mobile devices
- Use semantic HTML
- Keep animations subtle

---

## File Structure

```
src/
├── styles/
│   ├── global.css           # Master design system (THIS IS THE SOURCE OF TRUTH)
│   ├── typography.css       # Font imports, utilities
│   ├── variables.css        # Legacy - migrate to global.css
│   └── design-tokens.css    # Legacy - migrate to global.css
├── components/
│   └── ui/
│       ├── Button.css       # Component-specific styles
│       ├── Card.css
│       ├── Modal.css
│       └── ...
```

**Rule:** All components import `../../styles/global.css` and use CSS variables.

---

## Version History

**v1.0** (2025-10-03)
- Initial design system documentation
- Fixed JobCard.css dark theme inconsistencies
- Fixed Jobs.css to match Armora brand
- Standardized all CSS to use design tokens
- Improved CTA visibility (gold buttons)
- Enhanced font color consistency

---

## Support & Questions

For design system questions or proposed changes:
1. Review this document first
2. Check `src/styles/global.css` for implementation
3. Consult CLAUDE.md for project-specific guidance
4. Test changes on mobile (320px minimum)

**Remember:** Consistency creates trust. Every pixel represents the professionalism CPOs expect.
