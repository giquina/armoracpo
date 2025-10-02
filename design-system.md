# ArmoraCPO Design System

**Complete brand and design guidelines for the Close Protection Officer platform**

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Components](#components)
6. [Design Tokens Reference](#design-tokens-reference)
7. [Usage Guidelines](#usage-guidelines)
8. [SIA Terminology](#sia-terminology)

---

## Brand Identity

### Logo System

The ArmoraCPO logo consists of a **professional shield icon** with the **ARMORA wordmark** in Montserrat Extra Bold.

**Logo Variants:**

```tsx
import { Logo } from './components/common/Logo';

// Full logo (shield + text) - Primary usage
<Logo variant="full" size={40} />

// Icon only - For compact spaces (nav, buttons)
<Logo variant="icon" size={32} />

// Wordmark only - For horizontal layouts
<Logo variant="wordmark" size={40} />
```

**Logo Usage Rules:**
- Primary logo is Deep Navy (#0A1F44) with Metallic Gold (#D4AF37) accents
- Maintain minimum clear space of 1x logo height around the logo
- Never distort, rotate, or add effects to the logo
- Use icon variant for mobile navigation and small spaces

### Brand Personality

**Professional | Trust-Worthy | Elite | Secure**

The ArmoraCPO brand represents:
- **Professionalism**: SIA-licensed security experts
- **Reliability**: 24/7 operational readiness
- **Excellence**: Elite close protection services
- **Trust**: Vetted, compliant, insured officers

---

## Color Palette

### Primary Brand Colors

```css
/* Deep Navy - Primary Brand Color */
--armora-navy: #0A1F44;
--armora-navy-light: #1a3a5f;   /* Hover states */
--armora-navy-dark: #050f22;    /* Active states */

/* Metallic Gold - Accent Color */
--armora-gold: #D4AF37;
--armora-gold-light: #e6c55c;   /* Hover states */
--armora-gold-dark: #b8941f;    /* Active states */
```

**Usage:**
- **Navy**: Primary buttons, headers, important text, brand elements
- **Gold**: Accents, premium features, CTAs, highlights

### Status Colors (CPO Operations)

```css
/* CPO Availability States */
--armora-status-operational: #10B981;  /* Green - Available/On Duty */
--armora-status-busy: #EF4444;         /* Red - Busy/On Assignment */
--armora-status-standdown: #6B7280;    /* Gray - Offline/Stand Down */
```

**Badge Classes:**
```tsx
<span className="badge badge-operational">Operational</span>
<span className="badge badge-busy">On Assignment</span>
<span className="badge badge-standdown">Stand Down</span>
```

### Threat Level Colors

```css
--armora-threat-low: #10B981;      /* Green */
--armora-threat-medium: #F59E0B;   /* Amber */
--armora-threat-high: #EF4444;     /* Red */
--armora-threat-critical: #DC2626; /* Deep Red */
```

### Semantic Colors

```css
--armora-success: #10B981;  /* Success messages, confirmations */
--armora-warning: #F59E0B;  /* Warnings, cautions */
--armora-danger: #EF4444;   /* Errors, critical alerts */
--armora-info: #3B82F6;     /* Information, tips */
```

### Background Colors

```css
--armora-bg-primary: #FFFFFF;      /* Main content background */
--armora-bg-secondary: #F8F9FA;    /* Secondary backgrounds, cards */
--armora-bg-tertiary: #E5E7EB;     /* Disabled states, dividers */
--armora-bg-navy: #0A1F44;         /* Hero sections, headers */
--armora-bg-dark: #1F2937;         /* Dark mode alternative */
```

### Text Colors

```css
--armora-text-primary: #0A1F44;    /* Main text (Navy) */
--armora-text-secondary: #6B7280;  /* Secondary text (Gray) */
--armora-text-tertiary: #9CA3AF;   /* Tertiary text (Light Gray) */
--armora-text-inverse: #FFFFFF;    /* Text on dark backgrounds */
--armora-text-gold: #D4AF37;       /* Gold emphasis text */
```

### Border Colors

```css
--armora-border-light: #E5E7EB;    /* Light borders, dividers */
--armora-border-medium: #D1D5DB;   /* Standard borders */
--armora-border-dark: #9CA3AF;     /* Prominent borders */
--armora-border-navy: #0A1F44;     /* Navy borders */
--armora-border-gold: #D4AF37;     /* Gold borders */
```

---

## Typography

### Font Families

```css
/* Display Font - Headings, Logos, Emphasis */
--armora-font-display: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;

/* Body Font - All body text, UI elements */
--armora-font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

**Google Fonts Import:**
```html
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght=600;700;800&family=Inter:wght=400;500;600&display=swap');
```

### Type Scale

```css
--armora-text-xs: 0.75rem;      /* 12px - Small labels, captions */
--armora-text-sm: 0.875rem;     /* 14px - Secondary text, descriptions */
--armora-text-base: 1rem;       /* 16px - Body text (default) */
--armora-text-lg: 1.125rem;     /* 18px - Emphasized text, subheadings */
--armora-text-xl: 1.25rem;      /* 20px - H3, card titles */
--armora-text-2xl: 1.5rem;      /* 24px - H2, section titles */
--armora-text-3xl: 1.875rem;    /* 30px - H1, page titles */
--armora-text-4xl: 2.25rem;     /* 36px - Hero text, large displays */
```

### Font Weights

```css
--armora-weight-normal: 400;     /* Body text */
--armora-weight-medium: 500;     /* Emphasized text */
--armora-weight-semibold: 600;   /* Subheadings, labels */
--armora-weight-bold: 700;       /* Headings */
--armora-weight-extrabold: 800;  /* Hero text, logo */
```

### Line Heights

```css
--armora-leading-tight: 1.2;     /* Headings, tight layouts */
--armora-leading-normal: 1.5;    /* Body text (default) */
--armora-leading-relaxed: 1.75;  /* Long-form content */
```

### Typography Examples

```tsx
// Headings (use Montserrat)
<h1 className="font-display font-extrabold text-navy">Page Title</h1>
<h2 className="font-display font-bold text-navy">Section Title</h2>
<h3 className="font-display font-bold">Card Title</h3>

// Body text (use Inter)
<p className="font-body text-base text-primary">
  Standard body text using Inter font family.
</p>

// Emphasized text
<span className="font-body font-semibold text-gold">
  Gold emphasis for premium features
</span>
```

---

## Spacing System

**8px base scale for consistent spacing across all components:**

```css
--armora-space-xs: 0.25rem;     /* 4px  - Tight spacing, inline elements */
--armora-space-sm: 0.5rem;      /* 8px  - Small gaps, compact layouts */
--armora-space-md: 1rem;        /* 16px - Standard spacing (default) */
--armora-space-lg: 1.5rem;      /* 24px - Section spacing */
--armora-space-xl: 2rem;        /* 32px - Large gaps, major sections */
--armora-space-2xl: 3rem;       /* 48px - Extra large spacing */
--armora-space-3xl: 4rem;       /* 64px - Hero sections, page breaks */
```

### Utility Classes

```tsx
// Margin
<div className="mt-md mb-lg">  /* margin-top: 16px, margin-bottom: 24px */
<div className="ml-auto">      /* margin-left: auto (push right) */

// Padding
<div className="p-md">         /* padding: 16px */
<div className="px-lg py-md">  /* padding-x: 24px, padding-y: 16px */

// Gap (flexbox)
<div className="flex gap-md">  /* gap: 16px between flex items */
```

---

## Components

### Buttons

**Primary Buttons (Navy):**
```tsx
<button className="btn btn-primary">
  Accept Assignment
</button>
```

**Gold Buttons (Premium/CTA):**
```tsx
<button className="btn btn-gold">
  Go Operational
</button>
```

**Outline Buttons:**
```tsx
<button className="btn btn-outline-navy">
  View Details
</button>
<button className="btn btn-outline-gold">
  Upgrade to Premium
</button>
```

**Button Sizes:**
```tsx
<button className="btn btn-primary btn-sm">Small</button>
<button className="btn btn-primary">Default</button>
<button className="btn btn-primary btn-lg">Large</button>
```

**Full Width Button:**
```tsx
<button className="btn btn-primary btn-full">
  Full Width Button
</button>
```

### Cards

**Standard Card:**
```tsx
<div className="card">
  <h3>Card Title</h3>
  <p>Card content goes here.</p>
</div>
```

**Navy Card:**
```tsx
<div className="card card-navy">
  <h3 className="text-inverse">Important Notice</h3>
  <p className="text-inverse">Text content on navy background.</p>
</div>
```

**Gold Card (Premium Features):**
```tsx
<div className="card card-gold">
  <h3 className="text-navy">Premium Feature</h3>
  <p className="text-navy">Exclusive content for verified CPOs.</p>
</div>
```

**Hover Card (Interactive):**
```tsx
<div className="card card-hover" onClick={handleClick}>
  <h3>Clickable Card</h3>
  <p>Lifts on hover with smooth transition.</p>
</div>
```

### Badges

**Status Badges:**
```tsx
<span className="badge badge-operational">Operational</span>
<span className="badge badge-busy">On Assignment</span>
<span className="badge badge-standdown">Stand Down</span>
```

**Threat Level Badges:**
```tsx
<span className="badge badge-threat-low">Low</span>
<span className="badge badge-threat-medium">Medium</span>
<span className="badge badge-threat-high">High</span>
<span className="badge badge-threat-critical">Critical</span>
```

**Semantic Badges:**
```tsx
<span className="badge badge-success">Verified</span>
<span className="badge badge-warning">Pending</span>
<span className="badge badge-danger">Expired</span>
<span className="badge badge-info">New</span>
```

### Forms

**Input Fields:**
```tsx
<div>
  <label htmlFor="email">Email Address</label>
  <input
    type="email"
    id="email"
    placeholder="your.email@example.com"
  />
</div>
```

**Textarea:**
```tsx
<div>
  <label htmlFor="notes">Assignment Notes</label>
  <textarea
    id="notes"
    rows={4}
    placeholder="Enter any relevant details..."
  />
</div>
```

**Select Dropdown:**
```tsx
<div>
  <label htmlFor="status">Availability Status</label>
  <select id="status">
    <option value="operational">Operational</option>
    <option value="standdown">Stand Down</option>
  </select>
</div>
```

### Loading States

**Loading Screen:**
```tsx
import { LoadingScreen } from './components/common/LoadingScreen';

<LoadingScreen message="Loading your assignments..." />
```

**Spinner:**
```tsx
<div className="spinner"></div>
<div className="spinner spinner-gold"></div> {/* Gold variant */}
```

---

## Design Tokens Reference

### Border Radius

```css
--armora-radius-sm: 0.375rem;   /* 6px  - Slightly rounded */
--armora-radius-md: 0.5rem;     /* 8px  - Standard */
--armora-radius-lg: 0.75rem;    /* 12px - Card-like */
--armora-radius-xl: 1rem;       /* 16px - Prominent */
--armora-radius-2xl: 1.5rem;    /* 24px - Hero elements */
--armora-radius-full: 9999px;   /* Full round - Pills, avatars */
```

### Shadows

```css
--armora-shadow-sm: 0 1px 2px 0 rgba(10, 31, 68, 0.05);
--armora-shadow-md: 0 4px 6px -1px rgba(10, 31, 68, 0.1), 0 2px 4px -1px rgba(10, 31, 68, 0.06);
--armora-shadow-lg: 0 10px 15px -3px rgba(10, 31, 68, 0.1), 0 4px 6px -2px rgba(10, 31, 68, 0.05);
--armora-shadow-xl: 0 20px 25px -5px rgba(10, 31, 68, 0.1), 0 10px 10px -5px rgba(10, 31, 68, 0.04);
--armora-shadow-gold: 0 4px 12px 0 rgba(212, 175, 55, 0.2);
```

### Z-Index Layers

```css
--armora-z-base: 0;         /* Base layer */
--armora-z-dropdown: 50;    /* Dropdowns, tooltips */
--armora-z-overlay: 80;     /* Overlays, backdrops */
--armora-z-header: 90;      /* Fixed header */
--armora-z-nav: 100;        /* Bottom navigation */
--armora-z-modal: 1000;     /* Modals, dialogs */
--armora-z-toast: 1100;     /* Toast notifications */
```

### Transitions

```css
--armora-transition-fast: 150ms ease-in-out;   /* Quick interactions */
--armora-transition-base: 250ms ease-in-out;   /* Standard (default) */
--armora-transition-slow: 350ms ease-in-out;   /* Deliberate animations */
```

### Mobile-Specific

```css
/* Minimum touch target size (iOS/Android) */
--armora-touch-min: 44px;

/* Safe area insets for notched devices */
--armora-safe-top: env(safe-area-inset-top);
--armora-safe-bottom: env(safe-area-inset-bottom);
--armora-safe-left: env(safe-area-inset-left);
--armora-safe-right: env(safe-area-inset-right);
```

---

## Usage Guidelines

### Mobile-First Approach

All components are designed **mobile-first** for the best experience on 320px+ devices:

1. **Touch Targets**: Minimum 44px height for all interactive elements
2. **Readable Text**: Base font size 16px (prevents iOS zoom on focus)
3. **Spacing**: Generous spacing for finger-friendly interfaces
4. **Performance**: Optimized animations, lazy loading where appropriate

### Responsive Breakpoints

```css
/* Mobile (default) */
/* 320px - 640px */

/* Tablet */
@media (min-width: 768px) {
  /* Tablet styles */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Desktop styles */
}
```

### Accessibility

1. **Color Contrast**: All text meets WCAG AA standards (4.5:1 minimum)
2. **Focus States**: Clear focus indicators on all interactive elements
3. **Touch Targets**: Minimum 44px for mobile usability
4. **Semantic HTML**: Use proper heading hierarchy, labels, ARIA attributes

### Dark Backgrounds

When using dark backgrounds (navy/dark), always use inverse text:

```tsx
<div className="bg-navy">
  <h2 className="text-inverse">White text on navy background</h2>
  <p className="text-inverse">Readable inverse text color.</p>
</div>
```

---

## SIA Terminology

**CRITICAL: Use correct security industry terminology, NOT ride-share terms:**

| CORRECT (Use This) | INCORRECT (Never Use) |
|---|---|
| CPO / Close Protection Officer | Driver |
| Principal | Passenger |
| Assignment / Detail | Ride / Trip |
| Operational / Stand Down | Online / Offline |
| Security Operations | Transportation |
| Threat Assessment | Risk Check |
| Go Operational | Go Online |
| On Assignment | On a Ride |
| Assignment Complete | Trip Complete |

### Why This Matters

ArmoraCPO is a **professional security platform** for **SIA-licensed Close Protection Officers** in the UK. Using incorrect terminology:
- Undermines professional credibility
- Confuses security industry stakeholders
- Violates SIA professional standards
- Damages brand trust

---

## Implementation Checklist for Other Agents

When building new features, ensure you:

- [ ] Use `--armora-*` CSS custom properties (never hardcoded colors)
- [ ] Use `<Logo />` component (never custom logo implementations)
- [ ] Apply correct SIA terminology (CPO, Principal, Assignment, Operational)
- [ ] Follow mobile-first responsive design (320px minimum)
- [ ] Use Montserrat for headings, Inter for body text
- [ ] Maintain 44px minimum touch targets
- [ ] Use utility classes from global.css
- [ ] Test on mobile devices (Chrome DevTools mobile emulation)
- [ ] Ensure color contrast meets WCAG AA standards
- [ ] Add proper focus states for keyboard navigation

---

## Quick Reference: Common Patterns

### Hero Section
```tsx
<section className="bg-navy py-xl">
  <div className="container">
    <Logo variant="full" size={60} />
    <h1 className="text-inverse font-display font-extrabold mt-lg">
      Elite Close Protection
    </h1>
    <p className="text-inverse mt-md">
      SIA-licensed security professionals
    </p>
    <button className="btn btn-gold mt-lg">
      Go Operational
    </button>
  </div>
</section>
```

### Card Grid
```tsx
<div className="container py-lg">
  <div className="flex flex-col gap-md">
    <div className="card">
      <h3>Assignment Title</h3>
      <span className="badge badge-operational">Available</span>
      <p className="text-secondary mt-sm">Details...</p>
    </div>
    {/* More cards */}
  </div>
</div>
```

### Form Layout
```tsx
<form className="card">
  <h2 className="mb-lg">CPO Profile</h2>

  <div className="mb-md">
    <label htmlFor="sia">SIA License Number</label>
    <input type="text" id="sia" placeholder="Enter SIA number" />
  </div>

  <div className="mb-lg">
    <label htmlFor="specialization">Specialization</label>
    <select id="specialization">
      <option>Executive Protection</option>
      <option>Event Security</option>
    </select>
  </div>

  <button type="submit" className="btn btn-primary btn-full">
    Update Profile
  </button>
</form>
```

---

## Support

For design system questions or clarifications, refer to:
- `/workspaces/armoracpo/src/styles/global.css` - Complete token definitions
- `/workspaces/armoracpo/src/components/common/Logo.tsx` - Logo component
- `/workspaces/armoracpo/src/components/common/LoadingScreen.tsx` - Loading states
- `/workspaces/armoracpo/CLAUDE.md` - Project context and guidelines

---

**Design System Version:** 1.0.0
**Last Updated:** 2025-10-02
**Maintained By:** Agent 1 - Brand & Design System Architect
