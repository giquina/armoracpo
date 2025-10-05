# 🚀 Codespaces Startup Optimization Guide

## Problem Analysis

Your Armora and ArmoraCPO Codespaces are taking **90-120 seconds** to start up. This document explains why and provides solutions.

---

## Root Causes

### 1. **Heavy npm Installation on Every Startup** ⏱️

**Current Behavior:**
```json
// .devcontainer/devcontainer.json
"postCreateCommand": "corepack enable || true && npm ci"
```

**Impact:**
- **1,464 packages** (682MB) installed from scratch every time
- `npm ci` runs on **every Codespaces creation**
- Takes **~60 seconds** just for package installation
- Only npm cache is mounted, not `node_modules`

### 2. **No Prebuilds Configured** 🏗️

**Issue:**
- Codespaces rebuilds the entire container from scratch each time
- No prebuilt images with dependencies pre-installed
- Container setup adds **30-60 seconds**

### 3. **Large Dependency Tree** 📦

**Major Dependencies:**
```json
{
  "react-scripts": "5.0.1",        // 200MB+ with dependencies
  "firebase": "^12.3.0",           // 50MB+
  "@supabase/supabase-js": "^2.58.0",
  "leaflet": "^1.9.4",             // Map library
  "framer-motion": "^12.23.22",    // Animation library
  "chart.js": "^4.5.0",
  "@stripe/stripe-js": "^8.0.0",
  "react-router-dom": "^7.9.3"
}
```

**Total:** 1,464 packages = 682MB in `node_modules`

### 4. **npm Cache Mount Only** 💾

**Current Mount:**
```json
"mounts": [
  "type=cache,target=/home/node/.npm"  // Only caches npm registry files
]
```

**Missing:**
- No `node_modules` persistence between sessions
- Packages re-extracted every time even if cached

---

## Solutions (Fastest to Implement)

### ✅ Solution 1: Add node_modules Volume Mount (IMMEDIATE)

**Change `.devcontainer/devcontainer.json`:**

```json
{
  "mounts": [
    "type=cache,target=/home/node/.npm",
    "source=armoracpo-node-modules,target=${containerWorkspaceFolder}/node_modules,type=volume"
  ],
  "postCreateCommand": "npm install",  // Changed from npm ci
  "postStartCommand": "npm install"    // Run on resume too
}
```

**Benefits:**
- ✅ `node_modules` persists between Codespaces sessions
- ✅ Subsequent startups: **5-10 seconds** instead of 60s
- ✅ Only installs new/missing packages
- ✅ First startup still takes 60s (unavoidable)

**Trade-offs:**
- Uses persistent Docker volume (minimal storage impact)
- First startup unchanged (~60s)

---

### ✅ Solution 2: Enable Prebuilds (RECOMMENDED)

**Create `.devcontainer/devcontainer.json` with prebuilds:**

```json
{
  "name": "Armoracpo Development",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:1-18-bullseye",
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ]
    },
    "codespaces": {
      "repositories": {
        "giquina/armoracpo": {
          "permissions": {
            "contents": "write"
          }
        }
      }
    }
  },
  "forwardPorts": [3000],
  "portsAttributes": {
    "3000": { "label": "CRA Dev Server", "onAutoForward": "notify" }
  },
  "mounts": [
    "type=cache,target=/home/node/.npm",
    "source=armoracpo-node-modules,target=${containerWorkspaceFolder}/node_modules,type=volume"
  ],
  "postCreateCommand": "npm install",
  "postStartCommand": "npm install",
  "remoteUser": "node"
}
```

**Enable in GitHub Settings:**
1. Go to `https://github.com/giquina/armoracpo/settings/codespaces`
2. Enable "Prebuilds"
3. Configure prebuild triggers:
   - ✅ On push to `main`
   - ✅ On pull request
   - ✅ On schedule (optional: daily)

**Benefits:**
- ✅ Container pre-built with dependencies installed
- ✅ Startup time: **10-15 seconds** (including npm install check)
- ✅ Consistent experience across team members
- ✅ Prebuilds update automatically on package.json changes

**Trade-offs:**
- Requires GitHub Actions minutes for prebuilds (~5 min/prebuild)
- Free tier: 120 core-hours/month (plenty for this use case)

---

### ✅ Solution 3: Optimize Dependencies (LONG-TERM)

**Audit Unused Dependencies:**

```bash
# Install depcheck
npm install -g depcheck

# Check for unused dependencies
depcheck

# Check bundle size
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

**Potential Optimizations:**
1. **Replace `react-scripts`** with Vite (faster builds)
2. **Lazy load heavy libraries** (Leaflet, Chart.js)
3. **Remove unused dependencies**
4. **Use `npm ci --prefer-offline`** for faster installs

**Example: Lazy Load Leaflet**
```typescript
// Before: import L from 'leaflet';
// After:
const loadLeaflet = async () => {
  const L = await import('leaflet');
  return L.default;
};
```

---

### ✅ Solution 4: Switch from npm ci to npm install

**Change in `.devcontainer/devcontainer.json`:**

```json
{
  "postCreateCommand": "npm install --prefer-offline",
  "postStartCommand": "npm install --prefer-offline"
}
```

**Benefits:**
- ✅ Uses npm cache more aggressively
- ✅ Slightly faster (5-10s) with volume mount
- ✅ Still validates package-lock.json

**Trade-offs:**
- Less strict than `npm ci` (may use cached versions)

---

## Recommended Implementation Plan

### Phase 1: Immediate (5 minutes) ⚡
1. Update `.devcontainer/devcontainer.json` with volume mount
2. Change `npm ci` to `npm install`
3. Add `postStartCommand`
4. Rebuild Codespace once

**Expected Result:** Future startups in **5-15 seconds**

### Phase 2: Enable Prebuilds (10 minutes) 🏗️
1. Update devcontainer.json with prebuild config
2. Enable Prebuilds in GitHub settings
3. Wait for first prebuild (~5 minutes)
4. New Codespaces use prebuild

**Expected Result:** All startups in **10-15 seconds**

### Phase 3: Optimize Dependencies (Optional) 📦
1. Run `depcheck` to find unused packages
2. Remove unused dependencies
3. Lazy load heavy libraries
4. Consider migrating to Vite (future)

**Expected Result:** Faster builds, smaller bundles

---

## Quick Fix (Apply Now)

**Replace `.devcontainer/devcontainer.json` with:**

```json
{
  "name": "Armoracpo Development",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:1-18-bullseye",
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ]
    }
  },
  "forwardPorts": [3000],
  "portsAttributes": {
    "3000": { "label": "CRA Dev Server", "onAutoForward": "notify" }
  },
  "mounts": [
    "type=cache,target=/home/node/.npm",
    "source=armoracpo-node-modules,target=${containerWorkspaceFolder}/node_modules,type=volume"
  ],
  "postCreateCommand": "npm install --prefer-offline",
  "postStartCommand": "npm install --prefer-offline",
  "remoteUser": "node"
}
```

**After applying:**
1. Rebuild Codespace: Cmd/Ctrl+Shift+P → "Codespaces: Rebuild Container"
2. First rebuild: ~90 seconds (normal)
3. Stop and restart Codespace
4. Second startup: **~5-15 seconds** ✅

---

## Performance Comparison

| Scenario | Startup Time | First Time | Subsequent |
|----------|--------------|------------|------------|
| **Current (npm ci)** | 90-120s | 90-120s | 90-120s |
| **With volume mount** | 5-15s | 90s | 5-15s |
| **With prebuilds** | 10-15s | 10-15s | 10-15s |
| **Optimized deps** | 5-10s | 60s | 5-10s |

---

## Why Both Armora and ArmoraCPO Are Slow

**If you have similar issues with the Armora client app:**

1. Check `.devcontainer/devcontainer.json` in that repo
2. Likely has similar `npm ci` in `postCreateCommand`
3. Apply the same fixes (volume mount + postStartCommand)
4. Enable prebuilds for both repos

**Note:** Both apps share infrastructure (Supabase, Firebase) but have separate devcontainer configs.

---

## Testing the Fix

**Step 1: Apply the fix**
```bash
# Edit .devcontainer/devcontainer.json
# (copy the Quick Fix above)
```

**Step 2: Rebuild**
```bash
# In Codespaces: Cmd/Ctrl+Shift+P
# Type: "Codespaces: Rebuild Container"
# Wait ~90 seconds
```

**Step 3: Test**
```bash
# Stop Codespace
# Start Codespace again
# Time the startup
```

**Expected:** Startup in ~5-15 seconds instead of 90-120s

---

## Additional Tips

### Reduce Build Time (npm run build)
```bash
# Current: ~60-90s
# Add to package.json:
{
  "scripts": {
    "build:fast": "GENERATE_SOURCEMAP=false react-scripts build"
  }
}
# New time: ~30-40s
```

### Check Storage Usage
```bash
# See how much space node_modules uses
du -sh node_modules

# Clean npm cache if needed
npm cache clean --force
```

### Monitor Codespaces Performance
- Check GitHub usage: https://github.com/settings/billing
- Review prebuild logs: https://github.com/giquina/armoracpo/settings/codespaces

---

## Summary

**Problem:** 1,464 packages reinstalled on every Codespaces startup = 90-120s wait

**Solution:** 
1. ✅ Add volume mount for `node_modules` persistence
2. ✅ Change `npm ci` to `npm install --prefer-offline`
3. ✅ Add `postStartCommand` for resumed sessions
4. ✅ Enable GitHub Prebuilds (optional but recommended)

**Result:** Startup time reduced to **5-15 seconds** 🚀

---

## Need Help?

- **Codespaces Docs:** https://docs.github.com/en/codespaces
- **Prebuilds Guide:** https://docs.github.com/en/codespaces/prebuilding-your-codespaces
- **Dev Containers:** https://containers.dev/
