# Color Contrast Debugging - Text Visibility Issues

## Issue Report: Text Not Visible (Same Color as Background)

**Date:** October 6, 2025
**Status:** 🔴 Critical - User cannot read text

---

## Suspected Problem Areas

Based on the code review, here are the most likely culprits:

### 1. **Job Card Pills/Badges**
**Location:** `src/components/jobs/JobCard.css` line 154-162

```css
.job-card-requirement {
  background: var(--armora-bg-secondary);
  border: 1px solid var(--armora-border-light);
  color: var(--armora-text-primary);
}
```

**Potential Issue:**
- `--armora-text-primary` = `#0A1F44` (Navy)
- `--armora-bg-secondary` = `#F8F9FA` (Light Gray)
- **Should have good contrast** (dark on light)

**IF NOT VISIBLE:** Check if variables are loading correctly

---

### 2. **Job Card Description Text**
**Location:** `src/components/jobs/JobCard.css` line 175-184

```css
.job-card-description {
  font-size: var(--armora-text-sm);
  color: var(--armora-text-secondary);
}
```

**Potential Issue:**
- `--armora-text-secondary` = `#6B7280` (Gray-500)
- **Should be visible** on white background

---

### 3. **Placeholder Text in Search/Inputs**
**Location:** Various form inputs

```css
input::placeholder {
  color: var(--armora-gray-500); /* #6B7280 */
}
```

**Potential Issue:** If placeholder is too light

---

## Quick Diagnostic Steps

### Step 1: Open Browser DevTools
1. Right-click on invisible text
2. Select "Inspect Element"
3. Check the **Computed** tab
4. Look for:
   - `color: <value>`
   - `background-color: <value>`

### Step 2: Check if Variables are Loading
In DevTools Console, type:
```javascript
getComputedStyle(document.documentElement).getPropertyValue('--armora-text-primary')
```

**Expected:** `#0A1F44` (or similar)
**If empty/wrong:** Design system CSS isn't loading!

---

## Most Likely Root Causes

### ✅ Cause 1: CSS Import Order Issue
The design system file might not be imported correctly:

**Check:** `src/index.css` or `src/App.tsx`
**Should have:**
```css
@import './styles/armora-cpo-design-system.css';
```

**Before other component imports!**

---

### ✅ Cause 2: CSS Variable Not Defined
Some older files might reference old variable names:

**Old (deprecated):**
```css
color: var(--color-white);
color: var(--text-primary);
```

**New (correct):**
```css
color: var(--armora-white);
color: var(--armora-text-primary);
```

**Files to check:**
- `src/screens/DOB/DailyOccurrenceBook.css` (uses `--color-white`)
- `src/components/dob/DOBEntryForm.css` (uses `--color-white`)

---

### ✅ Cause 3: White Text on White Background
Some components might have:
```css
background: var(--armora-white); /* #FFFFFF */
color: var(--armora-text-inverse); /* #FFFFFF - WRONG! */
```

**Should be:**
```css
background: var(--armora-white);
color: var(--armora-text-primary); /* #0A1F44 Navy */
```

---

## Emergency Color Override CSS

**If nothing else works, paste this in browser DevTools Console:**

```javascript
// Force all text to be visible
const style = document.createElement('style');
style.innerHTML = `
  * {
    color: #0A1F44 !important;
  }

  .job-card-requirement,
  .job-card-description,
  .job-card-title,
  .job-card-info-item {
    color: #0A1F44 !important;
  }

  button {
    color: white !important;
  }
`;
document.head.appendChild(style);
```

---

## Files That Need CSS Variable Migration

### Files using OLD variable names (found via grep):

1. **`src/screens/DOB/DailyOccurrenceBook.css`**
   - Uses: `var(--color-white)`
   - Should be: `var(--armora-white)`

2. **`src/components/dob/DOBEntryForm.css`**
   - Uses: `var(--color-white)`
   - Should be: `var(--armora-white)`

3. **`src/components/incidents/*.css`**
   - Some use hardcoded `white` instead of `var(--armora-white)`

---

## Specific Elements to Check in Browser

### Job Card Pills (badges like "Vehicle Required", "First Aid"):
```
Expected:
- Background: Light gray (#F8F9FA)
- Text: Navy (#0A1F44)
- Border: Light gray (#E5E7EB)

If invisible:
- Background and text are SAME color
```

### Job Description (3-line excerpt):
```
Expected:
- Background: White (#FFFFFF)
- Text: Gray (#6B7280)

If invisible:
- Text might be white on white
```

### Button Text (Accept Assignment, Apply Now):
```
Expected:
- Background: Teal (#06B6D4)
- Text: White (#FFFFFF)

If invisible:
- Background and text might both be white
```

---

## Next Steps to Fix

1. **Identify the exact component** with invisible text (which screen/element?)
2. **Check DevTools** to see computed color values
3. **Verify design system import** in main CSS file
4. **Update old CSS variable names** in affected files
5. **Test on mobile device** (might be rendering differently)

---

## Contact Information

If issue persists, please provide:
- Screenshot of invisible text area
- Browser DevTools "Computed" tab screenshot
- Which screen/component is affected (Jobs list? DOB? Incidents?)

---

**Status:** Awaiting user confirmation of exact location of invisible text
**Priority:** 🔴 Critical - Blocks all usage
