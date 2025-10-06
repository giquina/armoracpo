# Armora Brand Colors - Reconciliation Report

**Date:** October 6, 2025
**Status:** ⚠️ TWO DIFFERENT COLOR SCHEMES DETECTED

---

## 🔍 DISCOVERY

The codebase currently uses **TWO DIFFERENT navy colors** depending on context:

### 1️⃣ **Splash/Welcome Screens (Dark Theme)**
**Source:** `src/styles/brandConstants.ts` (lines 40, 45)
**GitHub Repo:** github.com/giquina/armora

```css
--armora-navy-primary: #1a1a2e  /* Darker navy (dark theme) */
--armora-gold-primary: #D4AF37  /* Metallic gold ✅ */
```

**Used in:**
- Splash screen background
- Welcome page immersive gradient
- Dark theme components
- Brand animations and effects

---

### 2️⃣ **Main App Interface (Light Theme)**
**Source:** `src/styles/armora-cpo-design-system.css` (line 19)
**Documentation:** `DESIGN_SYSTEM.md`

```css
--armora-navy: #0A1F44  /* Deep blue-navy (light theme) */
--armora-gold: #D4AF37  /* Metallic gold ✅ */
```

**Used in:**
- Job cards, DOB screens, Incident forms
- Primary text color (on white backgrounds)
- Headers, buttons (secondary), borders
- **43 files** throughout the main app

---

## ✅ WHAT'S CONSISTENT

**Gold is UNIFIED:**
- Both schemes use **#D4AF37** (Metallic Gold) ✅
- No conflicts in gold usage

**No Blue anywhere:**
- ✅ Removed `--armora-info: #3B82F6` (replaced with Navy)
- ✅ Removed `--armora-teal: #06B6D4` (replaced with Gold)

---

## ⚠️ WHAT NEEDS DECISION

### Navy Color Conflict:

**Option A: Keep Both (Current State)**
```css
/* Splash/Dark Theme */
--armora-navy-dark-theme: #1a1a2e

/* Main App/Light Theme */
--armora-navy: #0A1F44
```

**Pros:**
- Already implemented and working
- Different contexts (splash vs. main app)
- Better contrast on white backgrounds (#0A1F44 is darker)

**Cons:**
- Two different "navy" values can confuse developers
- Inconsistent across the app experience

---

**Option B: Standardize on #1a1a2e (GitHub/Splash)**
```css
--armora-navy: #1a1a2e  /* Everywhere */
```

**Pros:**
- Matches official GitHub repo
- Single navy value across entire app
- Consistent brand identity

**Cons:**
- Need to update 43 files with `#0A1F44`
- Lighter navy (#1a1a2e vs. #0A1F44) may have less contrast on white

---

**Option C: Standardize on #0A1F44 (Current Main App)**
```css
--armora-navy: #0A1F44  /* Everywhere */
```

**Pros:**
- Darker navy = better text contrast (WCAG AA)
- Already in 43 files (minimal changes)
- Professional, sophisticated look

**Cons:**
- Doesn't match GitHub repo
- Need to update splash/welcome screens

---

## 📊 CURRENT COLOR USAGE

### Files Using #1a1a2e (Splash/Dark Theme):
1. `src/styles/brandConstants.ts` (navy definitions)
2. `src/styles/global-container.css` (dark background)
3. `src/styles/questionnaire-animations.css` (effects)

### Files Using #0A1F44 (Main App):
**43 files** including:
- All job card components
- DOB screens
- Incident forms
- Navigation
- Headers
- Design system CSS

---

## 🎯 RECOMMENDATION

### **Recommended Approach: Option A (Keep Both - Contextual)**

**Rename for clarity:**

```css
/* Dark Theme / Splash Screens */
--armora-navy-dark: #1a1a2e;      /* Dark theme background */
--armora-navy-splash: #1a1a2e;    /* Splash screen only */

/* Light Theme / Main App (Primary) */
--armora-navy: #0A1F44;           /* Primary navy - text, UI */
--armora-navy-light: #1a3a5f;     /* Hover states */
--armora-navy-dark: #050f22;      /* Active states */

/* Unified Gold (NO changes needed) */
--armora-gold: #D4AF37;           /* All contexts */
```

**Why?**
- ✅ Preserves existing work (43 files already correct)
- ✅ Better WCAG contrast on white (#0A1F44 is darker)
- ✅ Keeps splash screen dark theme aesthetics
- ✅ Clear naming prevents confusion

---

## 🔧 WHAT WAS JUST FIXED

### ✅ Completed Today:
1. **Removed Teal (#06B6D4)** - Not in Armora brand
2. **Removed Blue (#3B82F6)** - Not in Armora brand
3. **Replaced 15 teal references** with Gold (#D4AF37)
4. **Replaced 66 old CSS variables** (`--color-white` → `--armora-white`)
5. **All buttons now use Gold** for CTAs (official brand)

### ✅ Brand Compliance Now:
- **Primary:** Navy (contextual: #1a1a2e or #0A1F44)
- **Accent:** Gold (#D4AF37) - UNIFIED ✅
- **NO Blue** ✅
- **NO Teal** ✅

---

## 📋 NEXT STEPS (AWAITING DECISION)

### Choose One:

**A) Keep Both Navies (Contextual)**
- No changes needed
- Update documentation to clarify usage

**B) Standardize on #1a1a2e (GitHub)**
- Update 43 files with new navy
- Check WCAG contrast on white backgrounds
- ~2 hours of work

**C) Standardize on #0A1F44 (Current)**
- Update 3 splash screen files
- Ensure consistency with GitHub repo
- ~30 minutes of work

---

## 💬 QUESTIONS FOR YOU

1. **Which navy should be the primary brand color?**
   - #1a1a2e (GitHub/Splash) - Lighter
   - #0A1F44 (Main App) - Darker, better contrast

2. **Should splash screen use a different navy for dark theme?**
   - Yes - keep #1a1a2e for splash (dark theme)
   - No - use same navy everywhere

3. **Is the Gold (#D4AF37) correct?**
   - ✅ Currently unified across entire app
   - GitHub mentions #FFD700 but code uses #D4AF37

---

**Current Status:**
- ✅ Gold is correct (#D4AF37) everywhere
- ✅ NO Blue or Teal in the app
- ⚠️ Navy has two values - needs decision

**Recommendation:** Keep both navies with clear naming (Option A)

---

**Waiting for your decision on navy standardization.**
