# Armora CPO - UX Redesign Implementation Plan
**Close Protection Officer Mobile Application**

> **Context:** This is the CPO-facing app (github.com/giquina/armoracpo) for Close Protection Officers to find, manage, and complete assignments. Separate from the client-facing Armora app (github.com/giquina/armora).

---

## Executive Summary

This plan implements the comprehensive UX audit recommendations specifically for **Close Protection Officers** who use this app to:
- Browse and accept security assignments
- Manage their professional profile (SIA license, certifications)
- Track active assignments and operational status
- Submit incident reports and DOB entries
- Communicate with principals and operations
- Monitor earnings and payment history

The redesign maintains Armora's professional SIA-compliant branding while fixing critical UX issues: box-in-box nesting, color inconsistencies, and accessibility problems.

---

## Current State Analysis

### CPO User Needs (Primary Focus)
1. **Quick assignment discovery** - CPOs need to rapidly scan available jobs
2. **Operational status control** - Switch between Operational/Stand Down/Busy
3. **SIA compliance** - Maintain verification status, submit required documentation
4. **Real-time assignment management** - Accept, track, complete assignments
5. **Professional credibility** - Display ratings, completed jobs, certifications
6. **Safety & security** - Access threat levels, briefings, incident reporting

### Identified UX Problems (CPO-Specific Impact)

**1. Box-in-Box Nesting (CRITICAL for CPOs)**
- **Impact:** CPOs scan dozens of jobs daily - nested containers slow visual processing
- **Current:** 4-5 container levels make job cards feel "heavy" and slow to parse
- **CPO Need:** Fast, scannable job cards with clear hierarchy

**2. Color Scheme Issues**
- **Impact:** Navy + Yellow + Mint green doesn't convey professional security branding
- **Current:** Yellow CTAs look cautionary, mint green price boxes feel disconnected
- **CPO Need:** Colors that build trust and convey operational professionalism

**3. Visibility & Accessibility**
- **Impact:** CPOs work in varied conditions (bright daylight, low light, in vehicles)
- **Current:** Low contrast text, weak button states, small touch targets
- **CPO Need:** High contrast, large touch targets, clear status indicators

**4. Navigation Complexity**
- **Impact:** CPOs need 1-tap access to critical functions during assignments
- **Current:** 5-tab bottom nav, weak active states, unclear icon meanings
- **CPO Need:** Simplified nav with operational context (e.g., "On Assignment" mode)

---

## Design System Consolidation

### Phase 1: Single Source of Truth (Week 1)

#### 1.1 Consolidate CSS Variables
**Problem:** 4+ overlapping design token systems create inconsistency
- `/src/styles/global.css` (615 lines - main system)
- `/src/styles/variables.css` (168 lines - duplicates)
- `/src/styles/design-tokens.css` (332 lines - mobile tokens)
- `/src/styles/typography.css` (164 lines - different scale)

**Solution:** Create authoritative design system file

**Create:** `/src/styles/armora-cpo-design-system.css`
```css
/*
 * ARMORA CPO DESIGN SYSTEM
 * Single source of truth for CPO mobile application
 * Last updated: [Date]
 */

/* ========================================
   BRAND COLORS - CPO Professional Palette
   ======================================== */

/* Primary Brand (Navy - Trust & Authority) */
--armora-navy: #0A1F44;
--armora-navy-light: #1a3a5f;
--armora-navy-dark: #050f22;

/* Accent (Gold - Premium & Achievement) */
--armora-gold: #D4AF37; /* SINGLE gold value - eliminate #FFD700 */
--armora-gold-light: #e6c55c;
--armora-gold-dark: #b8941f;

/* NEW: Secondary Accent (Teal - Modern & Action) */
--armora-teal: #06B6D4; /* For CTAs, active states */
--armora-teal-light: #22d3ee;
--armora-teal-dark: #0891b2;

/* CPO Operational Status Colors */
--armora-operational: #10B981; /* Green - Available/On Duty */
--armora-busy: #EF4444; /* Red - On Assignment */
--armora-standdown: #6B7280; /* Gray - Off Duty */

/* Threat Level Indicators (Critical for CPO Safety) */
--armora-threat-low: #10B981;
--armora-threat-medium: #F59E0B;
--armora-threat-high: #EF4444;
--armora-threat-critical: #DC2626;

/* Semantic Colors */
--armora-success: #10B981;
--armora-warning: #F59E0B;
--armora-danger: #EF4444;
--armora-info: #3B82F6;

/* Neutrals */
--armora-white: #FFFFFF;
--armora-gray-50: #F9FAFB;
--armora-gray-100: #F3F4F6;
--armora-gray-200: #E5E7EB;
--armora-gray-300: #D1D5DB;
--armora-gray-400: #9CA3AF;
--armora-gray-500: #6B7280;
--armora-gray-600: #4B5563;
--armora-gray-700: #374151;
--armora-gray-800: #1F2937;
--armora-gray-900: #111827;

/* ========================================
   TYPOGRAPHY - CPO Optimized for Mobile
   ======================================== */

/* Fonts */
--armora-font-display: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
--armora-font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Font Sizes (8px Grid) - SINGLE SCALE */
--armora-text-xs: 12px;
--armora-text-sm: 14px;
--armora-text-base: 16px;
--armora-text-lg: 18px;
--armora-text-xl: 20px;
--armora-text-2xl: 24px;
--armora-text-3xl: 32px;
--armora-text-4xl: 48px;

/* Weights */
--armora-weight-normal: 400;
--armora-weight-medium: 500;
--armora-weight-semibold: 600;
--armora-weight-bold: 700;
--armora-weight-extrabold: 800;

/* Line Heights */
--armora-leading-tight: 1.2;
--armora-leading-normal: 1.5;
--armora-leading-relaxed: 1.75;

/* ========================================
   SPACING - 8px Grid System
   ======================================== */

--armora-space-xs: 4px;
--armora-space-sm: 8px;
--armora-space-md: 16px;
--armora-space-lg: 24px;
--armora-space-xl: 32px;
--armora-space-2xl: 48px;
--armora-space-3xl: 64px;

/* ========================================
   LAYOUT - CPO Mobile Optimized
   ======================================== */

/* Border Radius */
--armora-radius-sm: 6px;
--armora-radius-md: 8px;
--armora-radius-lg: 12px;
--armora-radius-xl: 16px;
--armora-radius-2xl: 24px;
--armora-radius-full: 9999px;

/* Shadows (Reduced - Flat Design) */
--armora-shadow-sm: 0 1px 2px rgba(10, 31, 68, 0.05);
--armora-shadow-md: 0 2px 4px rgba(10, 31, 68, 0.08);
--armora-shadow-lg: 0 4px 8px rgba(10, 31, 68, 0.10);
--armora-shadow-card: 0 1px 3px rgba(10, 31, 68, 0.06); /* PRIMARY card shadow */

/* Touch Targets (Critical for CPOs in field) */
--armora-touch-min: 44px; /* iOS/Android minimum */
--armora-touch-comfortable: 48px; /* Recommended */
--armora-touch-large: 56px; /* Primary actions */

/* Z-Index Layers */
--armora-z-base: 0;
--armora-z-sticky: 10;
--armora-z-dropdown: 50;
--armora-z-header: 90;
--armora-z-nav: 100;
--armora-z-modal: 1000;
--armora-z-toast: 1100;
```

#### 1.2 Update Import Strategy
**Modify:** `/src/styles/global.css`
```css
/* Import authoritative design system FIRST */
@import './armora-cpo-design-system.css';

/* Then component styles */
@import './components/buttons.css';
@import './components/cards.css';
/* ... rest of imports */
```

**Deprecate/Remove:**
- `variables.css` → Merge into design-system.css
- `design-tokens.css` → Consolidate
- `typography.css` → Merge into design-system.css
- `card-standards.css` → Refactor into new flat card system

---

## Component Redesign - CPO Job Card (CRITICAL)

### Phase 2: Flatten Job Card Hierarchy (Week 2)

#### 2.1 Current "Box-in-Box" Problem
**File:** `/src/components/jobs/JobCard.tsx` (269 lines CSS)

**Current Structure (5 levels!):**
```
[Gray Outer Container] ← Level 1
  [White Card + Shadow] ← Level 2
    [White Title Box] ← Level 3
      [White Badge Box] [White Rating Box] ← Level 4
    [Gray Date/Time Box] ← Level 3
    [White Location Box] ← Level 4
    [White Details Box] ← Level 4
      [Mint Green Price Box] ← Level 5 (!!)
    [White Requirements Boxes] ← Level 4
    [Gray Footer Box] ← Level 3
```

**CPO Impact:**
- Too much visual weight slows scanning
- Nested shadows/borders create muddy hierarchy
- Price buried 5 levels deep - should be prominent!
- Location/date require mental "unpacking"

#### 2.2 New Flat Structure (2 levels max)

**New Structure:**
```
[SINGLE White Card - ONE shadow] ← Level 1 ONLY
  Assignment Type Badge • ★ 4.8 (inline, subtle)
  Principal Assignment Title (bold, 18px)
  ⚠️ Medium Threat (badge, contextual color)

  📍 Mayfair, London • 2.3 mi (inline text)
  📅 Mon 15 Jan - Fri 19 Jan (inline text)
  ⏱️ 8 hours/day (inline text)

  💷 350/day (highlighted with teal color, no box)

  [Vehicle Required] [First Aid] (subtle pill badges)

  "Experienced CPO needed for executive protection..."
  (plain text, 3 lines, gray)

  👤 12 applicants • 2h ago (small gray text)

  [Accept Assignment] (full-width teal button)
```

**Key Changes:**
1. ❌ Remove gray outer container
2. ❌ Remove ALL inner white boxes (location, date, duration)
3. ❌ Remove mint green price box - use colored text instead
4. ✅ Use inline text with emoji/icon prefixes
5. ✅ ONE card container with ONE subtle shadow
6. ✅ Typography hierarchy (bold/size) instead of boxes
7. ✅ Teal accent for price (not green box)
8. ✅ Full-width CTA button (teal, not yellow)

#### 2.3 Implementation

**Update:** `/src/components/jobs/JobCard.tsx`

```tsx
// NEW FLAT STRUCTURE
export const JobCard: React.FC<JobCardProps> = ({ assignment }) => {
  return (
    <div className="cpo-job-card"> {/* SINGLE container */}

      {/* Threat indicator - thin top border only */}
      <div className="cpo-job-card__threat-bar"
           style={{ backgroundColor: getThreatColor(assignment.threatLevel) }} />

      {/* Header - inline badges */}
      <div className="cpo-job-card__header">
        <span className="cpo-job-card__type">{assignment.type}</span>
        <span className="cpo-job-card__rating">★ {assignment.rating}</span>
      </div>

      {/* Title - bold, no box */}
      <h3 className="cpo-job-card__title">{assignment.title}</h3>

      {/* Threat badge */}
      <span className="cpo-job-card__threat-badge">
        ⚠️ {assignment.threatLevel} Threat
      </span>

      {/* Details - inline text, NO BOXES */}
      <div className="cpo-job-card__details">
        <p>📍 {assignment.location} • {assignment.distance} mi</p>
        <p>📅 {assignment.dateRange}</p>
        <p>⏱️ {assignment.duration}</p>
      </div>

      {/* Price - highlighted text, NO BOX */}
      <div className="cpo-job-card__price">
        💷 {assignment.rate}/day
      </div>

      {/* Requirements - subtle pills */}
      <div className="cpo-job-card__requirements">
        {assignment.requirements.map(req => (
          <span key={req} className="cpo-job-card__requirement-pill">
            {req}
          </span>
        ))}
      </div>

      {/* Description - plain text */}
      <p className="cpo-job-card__description">
        {assignment.description}
      </p>

      {/* Footer - text only */}
      <div className="cpo-job-card__footer">
        <span>👤 {assignment.applicants} applicants</span>
        <span>•</span>
        <span>{assignment.timeAgo}</span>
      </div>

      {/* CTA - full width, teal */}
      <button className="cpo-job-card__cta">
        Accept Assignment
      </button>
    </div>
  );
};
```

**Update:** `/src/styles/components/JobCard.css`

```css
/* NEW FLAT JOB CARD SYSTEM */
.cpo-job-card {
  /* SINGLE CONTAINER - minimal styling */
  background: var(--armora-white);
  border-radius: var(--armora-radius-lg);
  box-shadow: var(--armora-shadow-card); /* ONE subtle shadow */
  padding: var(--armora-space-md);
  margin-bottom: var(--armora-space-lg);

  /* NO nested containers! */
  display: flex;
  flex-direction: column;
  gap: var(--armora-space-sm);

  /* Tap feedback */
  cursor: pointer;
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.cpo-job-card:active {
  transform: scale(0.98);
}

/* Threat indicator - TOP border only (thin) */
.cpo-job-card__threat-bar {
  height: 4px;
  border-radius: var(--armora-radius-sm) var(--armora-radius-sm) 0 0;
  margin: calc(var(--armora-space-md) * -1); /* Pull to edges */
  margin-bottom: var(--armora-space-sm);
}

/* Header - inline badges (NO boxes) */
.cpo-job-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cpo-job-card__type {
  font-size: var(--armora-text-xs);
  font-weight: var(--armora-weight-semibold);
  text-transform: uppercase;
  color: var(--armora-gray-500);
  letter-spacing: 0.05em;
}

.cpo-job-card__rating {
  font-size: var(--armora-text-sm);
  color: var(--armora-gold);
  font-weight: var(--armora-weight-semibold);
}

/* Title - bold typography, NO box */
.cpo-job-card__title {
  font-size: var(--armora-text-lg);
  font-weight: var(--armora-weight-bold);
  color: var(--armora-navy);
  line-height: var(--armora-leading-tight);
  margin: 0;
}

/* Threat badge - subtle, contextual color */
.cpo-job-card__threat-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--armora-text-sm);
  font-weight: var(--armora-weight-medium);
  padding: 4px 12px;
  border-radius: var(--armora-radius-full);
  background: color-mix(in srgb, currentColor 10%, transparent);
  width: fit-content;
}

/* Details - inline text, NO boxes */
.cpo-job-card__details {
  display: flex;
  flex-direction: column;
  gap: var(--armora-space-xs);
}

.cpo-job-card__details p {
  font-size: var(--armora-text-sm);
  color: var(--armora-gray-600);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Price - highlighted TEXT, not box */
.cpo-job-card__price {
  font-size: var(--armora-text-xl);
  font-weight: var(--armora-weight-bold);
  color: var(--armora-teal); /* NEW teal accent */
  margin: var(--armora-space-sm) 0;
}

/* Requirements - subtle pills (not heavy boxes) */
.cpo-job-card__requirements {
  display: flex;
  flex-wrap: wrap;
  gap: var(--armora-space-xs);
}

.cpo-job-card__requirement-pill {
  font-size: var(--armora-text-xs);
  padding: 4px 10px;
  border-radius: var(--armora-radius-full);
  background: var(--armora-gray-100);
  color: var(--armora-gray-700);
  font-weight: var(--armora-weight-medium);
}

/* Description - plain text */
.cpo-job-card__description {
  font-size: var(--armora-text-sm);
  color: var(--armora-gray-600);
  line-height: var(--armora-leading-normal);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

/* Footer - text only */
.cpo-job-card__footer {
  display: flex;
  align-items: center;
  gap: var(--armora-space-xs);
  font-size: var(--armora-text-xs);
  color: var(--armora-gray-500);
  padding-top: var(--armora-space-sm);
  border-top: 1px solid var(--armora-gray-200);
}

/* CTA - full width, teal (not yellow!) */
.cpo-job-card__cta {
  width: 100%;
  min-height: var(--armora-touch-comfortable);
  background: var(--armora-teal);
  color: var(--armora-white);
  border: none;
  border-radius: var(--armora-radius-md);
  font-size: var(--armora-text-base);
  font-weight: var(--armora-weight-semibold);
  cursor: pointer;
  transition: background 150ms ease, transform 150ms ease;
}

.cpo-job-card__cta:active {
  background: var(--armora-teal-dark);
  transform: scale(0.98);
}
```

---

## Color System Update - CPO Professional Palette

### Phase 3: Replace Yellow with Teal (Week 2)

#### 3.1 Problem: Yellow Feels Cautionary
- Current yellow (#FFD700) looks like warning/budget branding
- Doesn't convey professional security services
- Combined with navy, feels dated (2010s corporate)

#### 3.2 Solution: Introduce Teal Accent
**Primary Palette for CPO App:**
```
Navy #0A1F44     → Authority, Trust, Security
Gold #D4AF37     → Achievement, Premium (refined, not bright)
Teal #06B6D4     → Modern, Action-oriented (NEW - for CTAs)
```

**Application Strategy:**
1. **Primary CTAs:** Teal background, white text
   - "Accept Assignment"
   - "Apply Now"
   - "Complete Assignment"
   - "Submit Report"

2. **Gold Reserved For:**
   - Earnings/payment highlights
   - Achievement badges
   - Rating stars
   - Premium features

3. **Navy For:**
   - Headers (lightened)
   - Text (primary)
   - Borders (subtle)

#### 3.3 Button System Redesign

**Update:** `/src/styles/components/buttons.css`

```css
/* PRIMARY BUTTON - Teal (CPO Actions) */
.btn-primary,
.armora-button--primary {
  background: var(--armora-teal);
  color: var(--armora-white);
  border: none;
}

.btn-primary:hover {
  background: var(--armora-teal-light);
}

.btn-primary:active {
  background: var(--armora-teal-dark);
}

/* SECONDARY BUTTON - Navy Outline */
.btn-secondary,
.armora-button--secondary {
  background: transparent;
  color: var(--armora-navy);
  border: 2px solid var(--armora-navy); /* Thicker border for visibility */
}

/* GOLD BUTTON - Financial/Achievement Actions Only */
.btn-gold,
.armora-button--gold {
  background: var(--armora-gold);
  color: var(--armora-navy);
  border: none;
}

/* Operational Status Buttons */
.btn-operational {
  background: var(--armora-operational);
  color: white;
}

.btn-standdown {
  background: var(--armora-gray-400);
  color: white;
}
```

---

## Navigation & Headers - CPO Optimized

### Phase 4: Improve Navigation Visibility (Week 3)

#### 4.1 Bottom Navigation Redesign

**Problem:**
- Yellow active state doesn't match brand
- Weak visual distinction between active/inactive
- 5 items can be overwhelming during assignment

**Solution:**
```css
/* Bottom Nav - Teal Active State */
.bottom-nav__item--active {
  color: var(--armora-teal); /* Not yellow! */
  font-weight: var(--armora-weight-semibold);
}

.bottom-nav__item--active .bottom-nav__icon {
  /* Use filled icon variant when active */
  opacity: 1;
  transform: scale(1.1);
}

.bottom-nav__item {
  color: var(--armora-gray-500);
  min-height: var(--armora-touch-comfortable);
}

/* Add active indicator bar */
.bottom-nav__item--active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 3px;
  background: var(--armora-teal);
  border-radius: 0 0 var(--armora-radius-sm) var(--armora-radius-sm);
}
```

#### 4.2 Header Redesign - Lighter Navy

**Problem:**
- Full navy header too heavy (visual weight)
- Takes up screen real estate
- Harsh contrast with white content

**Solution:**
```css
/* Lighter Navy Header with Gradient */
.cpo-header {
  background: linear-gradient(180deg,
    var(--armora-navy) 0%,
    color-mix(in srgb, var(--armora-navy) 85%, transparent) 100%
  );
  padding: var(--armora-space-lg) var(--armora-space-md);
  border-radius: 0 0 var(--armora-radius-2xl) var(--armora-radius-2xl);
}

/* Or transparent overlay approach */
.cpo-header--transparent {
  background: rgba(10, 31, 68, 0.8);
  backdrop-filter: blur(10px);
}
```

---

## Accessibility Fixes - Field-Ready CPO App

### Phase 5: WCAG AA Compliance (Week 3-4)

#### 5.1 Critical Contrast Fixes

**Search Placeholder:**
```css
/* BEFORE: #C7C7CC (fails contrast) */
/* AFTER: */
input::placeholder {
  color: var(--armora-gray-500); /* #6B7280 - passes 4.5:1 */
  opacity: 1;
}
```

**Icon Colors:**
```css
/* All icons must meet contrast */
.icon {
  color: var(--armora-gray-600); /* Minimum #4B5563 */
}
```

**Timestamps & Meta Info:**
```css
/* Increase size and darken */
.meta-text,
.timestamp {
  font-size: var(--armora-text-sm); /* Up from 12px */
  color: var(--armora-gray-600); /* Darker than before */
}
```

#### 5.2 Touch Targets for Field Use

**All Interactive Elements:**
```css
/* Minimum touch target */
.btn,
.tab,
.nav-item,
.checkbox,
.radio {
  min-height: var(--armora-touch-comfortable); /* 48px */
  min-width: var(--armora-touch-comfortable);
}

/* Primary actions - even larger */
.btn-primary {
  min-height: var(--armora-touch-large); /* 56px */
}
```

---

## CPO-Specific Features Enhancement

### Phase 6: Operational Context (Week 4)

#### 6.1 Operational Status Widget
**Prominent operational status control on dashboard**

```tsx
// Enhanced operational status toggle
<div className="cpo-status-control">
  <div className="cpo-status-control__current">
    <div className="cpo-status-indicator cpo-status-indicator--operational" />
    <span>You are Operational</span>
  </div>

  <button className="cpo-status-control__toggle">
    Stand Down
  </button>
</div>
```

#### 6.2 SIA Verification Badge
**Always visible in header/profile**

```tsx
<div className="cpo-sia-badge">
  <FaShieldAlt />
  <span>SIA VERIFIED</span>
</div>
```

#### 6.3 Assignment Context Mode
**When CPO has active assignment, nav/UI adapts**

```tsx
// Bottom nav shows assignment-specific actions
{isOnAssignment && (
  <div className="bottom-nav--assignment-mode">
    <NavItem icon={<FiMap />} label="Assignment" active />
    <NavItem icon={<FiFileText />} label="DOB" />
    <NavItem icon={<FiAlertTriangle />} label="Report" />
    <NavItem icon={<FiPhone />} label="Contact" />
  </div>
)}
```

---

## Implementation Timeline

### Week 1: Foundation
- ✅ Create `/src/styles/armora-cpo-design-system.css`
- ✅ Consolidate all CSS variables
- ✅ Remove duplicate design token files
- ✅ Update color palette (add teal, standardize gold)
- ✅ Document design system

### Week 2: Job Cards (Biggest Impact)
- ✅ Redesign JobCard.tsx - flatten structure
- ✅ Update BrowseJobCard.tsx
- ✅ Remove all "box-in-box" nesting
- ✅ Implement teal CTAs
- ✅ Fix visual hierarchy with typography

### Week 3: Navigation & Headers
- ✅ Redesign bottom nav (teal active states)
- ✅ Lighten header (gradient/transparency)
- ✅ Improve tab indicators (thicker, teal)
- ✅ Fix all contrast issues
- ✅ Increase touch targets

### Week 4: Detail Pages & States
- ✅ Assignment detail pages (flatten)
- ✅ Incident report forms
- ✅ Profile/dashboard refinements
- ✅ Error states (teal buttons, not yellow)
- ✅ Empty states (better illustrations)

### Week 5: Polish & Testing
- ✅ Micro-interactions and animations
- ✅ Test on real devices (field conditions)
- ✅ Accessibility audit (WCAG AA)
- ✅ Performance optimization
- ✅ Documentation

---

## Success Criteria - CPO App Specific

### Design System
- ✅ Single CSS variable source
- ✅ Consistent `--armora-*` namespace
- ✅ No color/spacing duplicates
- ✅ Teal accent integrated throughout

### Visual Hierarchy
- ✅ Job cards max 2 levels (down from 5)
- ✅ No "box-in-box" patterns
- ✅ Typography-first design
- ✅ Price prominently highlighted (teal)

### CPO Usability
- ✅ Fast job scanning (flat cards)
- ✅ Clear operational status (always visible)
- ✅ SIA verification prominent
- ✅ Assignment mode context switching
- ✅ Field-ready touch targets (48px+)

### Accessibility
- ✅ All text WCAG AA (4.5:1 ratio)
- ✅ Icons meet contrast requirements
- ✅ Touch targets 48px minimum
- ✅ Clear focus/active states

### Performance
- ✅ Reduced CSS (consolidation)
- ✅ Fewer DOM nodes (flat structure)
- ✅ Smooth 60fps animations
- ✅ Fast job list rendering

---

## Files to Create/Modify

### 📄 New Files
- `/src/styles/armora-cpo-design-system.css` - Single source of truth
- `/docs/CPO_DESIGN_SYSTEM.md` - Documentation
- `/docs/SIA_TERMINOLOGY.md` - Brand language guide

### ✏️ Modified Files (Priority Order)
1. `/src/components/jobs/JobCard.tsx` - Flatten structure
2. `/src/styles/components/JobCard.css` - New flat styles
3. `/src/styles/components/buttons.css` - Teal CTAs
4. `/src/components/layout/BottomNav.tsx` - Teal active states
5. `/src/components/dashboard/WelcomeHeader.tsx` - Lighter header
6. All button components - Update to teal
7. All navigation - Fix active states

### 🗑️ Deprecated Files
- `/src/styles/variables.css` - Merge into design-system
- `/src/styles/design-tokens.css` - Consolidate
- `/src/styles/typography.css` - Merge into design-system
- `/src/styles/card-standards.css` - Replaced by flat system

---

## CPO Brand Voice Consistency

### SIA-Compliant Terminology (Maintain)
- ✅ "CPO" / "Close Protection Officer" (not "driver" or "guard")
- ✅ "Principal" (not "client" or "customer")
- ✅ "Assignment" (not "job" or "gig")
- ✅ "Operational" / "Stand Down" (not "available/unavailable")
- ✅ "Threat Level" (not "risk level")
- ✅ "SIA License" / "SIA Verified"
- ✅ "Daily Occurrence Book (DOB)"
- ✅ "Incident Report"

### Professional Tone (Examples)
- "Accept Assignment" (not "Take Job")
- "Complete Assignment" (not "Finish Work")
- "Submit DOB Entry" (not "Log Event")
- "Report Incident" (not "File Report")
- "You are Operational" (not "You're Available")

---

## Next Steps

1. **Review this plan** - Ensure it aligns with CPO user needs
2. **Prioritize phases** - Can compress timeline if needed
3. **Set up design system file** - Start with consolidated CSS
4. **Redesign 1 job card** - Validate flat structure approach
5. **User test with CPOs** - Get real field feedback

This plan maintains Armora CPO's professional SIA-compliant identity while dramatically improving usability for Close Protection Officers in the field.
