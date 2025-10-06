# WCAG AA Accessibility Quick Reference
## Armora CPO Design System

---

## Color Contrast Standards

### Text Colors (On White Background)

| Token | Hex | Contrast | Usage |
|-------|-----|----------|-------|
| `--armora-text-primary` | #0A1F44 | 12.6:1 | Body text, headings |
| `--armora-text-secondary` | #6B7280 | 4.5:1 | Secondary content |
| `--armora-text-muted` | #4B5563 | 7:1 | Timestamps, metadata |
| `--armora-gray-500` | #6B7280 | 4.5:1 | Placeholders, icons |
| `--armora-gray-600` | #4B5563 | 7:1 | Icons, small text |

### Required Contrast Ratios

- **Normal text** (< 18pt): 4.5:1 minimum
- **Large text** (≥ 18pt or 14pt bold): 3:1 minimum
- **UI components**: 3:1 minimum
- **Focus indicators**: 3:1 minimum

---

## Touch Target Standards

### Minimum Sizes

```css
/* Minimum (WCAG 2.5.5) */
--armora-touch-min: 44px;

/* Recommended (field use) */
--armora-touch-comfortable: 48px;

/* Primary actions */
--armora-touch-large: 56px;
```

### Implementation

```css
.interactive-element {
  min-width: 44px;
  min-height: 44px;
  /* OR */
  min-width: 48px;  /* Preferred */
  min-height: 48px;
}
```

---

## Focus Indicators

### Standard Implementation

```css
/* Light backgrounds */
.element:focus-visible {
  outline: 2px solid var(--armora-navy);
  outline-offset: 2px;
}

/* Dark backgrounds */
.element:focus-visible {
  outline: 2px solid var(--armora-gold);
  outline-offset: 2px;
}
```

### Requirements

- **Minimum width**: 2px
- **Offset**: 2px (recommended)
- **Visibility**: Must have 3:1 contrast with background
- **Apply to**: All interactive elements

---

## Typography Standards

### Minimum Font Sizes

| Size | Value | Usage | Notes |
|------|-------|-------|-------|
| `--armora-text-xs` | 12px | Badges (bold only) | Must be bold weight |
| `--armora-text-sm` | 14px | Minimum body text | Mobile minimum |
| `--armora-text-base` | 16px | Standard body | Default |

### Responsive Rules

```css
/* Mobile breakpoints MUST maintain 14px minimum */
@media (max-width: 768px) {
  .text-element {
    font-size: var(--armora-text-sm); /* 14px minimum */
  }
}
```

---

## Placeholder Text

### Standard Implementation

```css
input::placeholder,
textarea::placeholder {
  color: var(--armora-gray-500); /* #6B7280 - 4.5:1 contrast */
}
```

### DO NOT Use

- ❌ `--armora-text-tertiary` (insufficient contrast)
- ❌ `--armora-gray-400` (insufficient contrast)
- ❌ `opacity` values below 0.6

---

## Common Patterns

### Interactive Cards

```css
.card {
  cursor: pointer;
  transition: var(--armora-transition-base);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--armora-shadow-lg);
}

.card:focus-visible {
  outline: 2px solid var(--armora-navy);
  outline-offset: 2px;
}
```

### Buttons

```css
.button {
  min-height: var(--armora-touch-min); /* 44px */
  padding: var(--armora-space-md) var(--armora-space-lg);
  font-weight: var(--armora-weight-semibold);
}

.button:focus-visible {
  outline: 2px solid var(--armora-navy);
  outline-offset: 2px;
}
```

### Icons

```css
.icon {
  color: var(--armora-gray-600); /* 7:1 contrast */
  font-size: 18px;
}

/* Icon buttons */
.icon-button {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## Testing Checklist

### Color Contrast
- [ ] All text meets 4.5:1 ratio (normal) or 3:1 (large)
- [ ] Placeholders meet 4.5:1 ratio
- [ ] Icons meet 4.5:1 ratio
- [ ] UI components meet 3:1 ratio

### Touch Targets
- [ ] All interactive elements ≥ 44px
- [ ] Adequate spacing between targets (8px min)
- [ ] Primary actions use 48px+ when possible

### Focus Indicators
- [ ] All interactive elements have :focus-visible
- [ ] Focus has 2px minimum outline
- [ ] Focus has sufficient contrast (3:1 min)
- [ ] Focus offset provides clear separation

### Typography
- [ ] Mobile text ≥ 14px
- [ ] Body text ≥ 16px
- [ ] Adequate line height (1.5 min)
- [ ] Sufficient letter spacing

---

## Quick Fixes

### Issue: Placeholder too light
```css
/* ❌ Wrong */
::placeholder { color: var(--armora-text-tertiary); }

/* ✅ Correct */
::placeholder { color: var(--armora-gray-500); }
```

### Issue: Touch target too small
```css
/* ❌ Wrong */
.button { width: 36px; height: 36px; }

/* ✅ Correct */
.button { min-width: 44px; min-height: 44px; }
```

### Issue: Missing focus indicator
```css
/* ❌ Missing */
.element:focus { outline: none; }

/* ✅ Correct */
.element:focus-visible {
  outline: 2px solid var(--armora-navy);
  outline-offset: 2px;
}
```

### Issue: Mobile text too small
```css
/* ❌ Wrong */
@media (max-width: 768px) {
  .text { font-size: 10px; }
}

/* ✅ Correct */
@media (max-width: 768px) {
  .text { font-size: var(--armora-text-sm); } /* 14px */
}
```

---

## Tools & Resources

### Testing Tools
- **Chrome DevTools**: Lighthouse accessibility audit
- **axe DevTools**: Automated accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Contrast Checker**: WebAIM contrast checker

### Design System Files
- `/src/styles/armora-cpo-design-system.css` - Main design tokens
- `/src/styles/global.css` - Global styles and utilities
- `WCAG_AA_ACCESSIBILITY_REPORT.md` - Full compliance report

### Key Documentation
- WCAG 2.1 Level AA Guidelines
- Apple Human Interface Guidelines
- Material Design Accessibility
- iOS/Android Touch Target Standards

---

**Last Updated:** 2025-10-06
**Version:** 1.0.0
**Maintained By:** Armora CPO Development Team
