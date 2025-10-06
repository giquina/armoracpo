# Comprehensive React Dependency Compatibility Audit Prompt

Use this prompt with GitHub Copilot or any AI assistant to audit all your React projects for dependency compatibility issues.

---

## 🔍 AUDIT PROMPT

I need you to perform a comprehensive dependency compatibility audit on this repository to prevent React/TypeScript compilation errors. Follow these steps systematically:

### 1. **Package Version Analysis**

First, read the `package.json` file and identify the versions of these critical packages:

```
React ecosystem:
- react
- react-dom
- @types/react
- @types/react-dom

Routing:
- react-router-dom
- react-router

UI/Component libraries:
- react-icons
- framer-motion
- react-leaflet (if used)
- leaflet (if used)

Firebase (if used):
- firebase

Build tools:
- react-scripts
- typescript

Node/Runtime:
- Check package.json "engines" field
- Check .nvmrc file if exists
```

### 2. **Compatibility Matrix Check**

Verify the following compatibility rules:

#### React 18.x Requirements:
- ✅ `react-router-dom` must be `^6.x.x` (NOT 7.x)
- ✅ `react-leaflet` must be `^4.x.x` (NOT 5.x)
- ✅ `@types/react` must be `^18.x.x`
- ✅ `@types/react-dom` must be `^18.x.x`
- ✅ `firebase` can be up to `^11.x.x` (v12+ requires Node 20)
- ✅ Node version should be `^18.x` or `^20.x`

#### React 19.x Requirements:
- ✅ `react-router-dom` can be `^7.x.x`
- ✅ `react-leaflet` can be `^5.x.x`
- ✅ `@types/react` must be `^19.x.x`
- ✅ `@types/react-dom` must be `^19.x.x`
- ✅ `firebase` v12+ works (requires Node 20)
- ✅ Node version MUST be `^20.x` or higher

### 3. **TypeScript Type Definitions Check**

Search for custom type definition files:

```bash
# Search for these patterns:
1. Any `.d.ts` files in src/types/
2. Look for react-icons type definitions
3. Check tsconfig.json for "include" and "types" fields
```

For `react-icons`, verify the type definition matches React version:

**For React 18:**
```typescript
// src/types/react-icons.d.ts
declare module 'react-icons/*' {
  import * as React from 'react';

  export interface IconBaseProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }

  export type IconType = React.ComponentType<IconBaseProps>;

  const content: { [key: string]: IconType };
  export default content;
}
```

**For React 19:**
```typescript
// src/types/react-icons.d.ts
declare module 'react-icons/*' {
  import * as React from 'react';

  export interface IconBaseProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }

  export type IconType = (props: IconBaseProps) => React.JSX.Element;

  const content: { [key: string]: IconType };
  export default content;
}
```

### 4. **Build & Runtime Errors Check**

Test for common error patterns:

```bash
# Run build and check for these specific errors:
npm run build 2>&1 | grep -E "cannot be used as a JSX component|is not exported from 'react'|Unsupported engine"
```

Common error signatures to look for:
- ❌ `'use' is not exported from 'react'` → React Router 7 with React 18
- ❌ `cannot be used as a JSX component. Its return type 'ReactNode' is not a valid JSX element` → react-icons type mismatch
- ❌ `Unsupported engine` → Node version mismatch
- ❌ `ERESOLVE could not resolve` → Peer dependency conflicts

### 5. **Node Version Requirements**

Check these files for Node version specifications:

```bash
# Check all these locations:
1. package.json → "engines" field
2. .nvmrc file
3. .node-version file
4. Dockerfile or docker-compose.yml (if exists)
5. CI/CD configs (.github/workflows/*.yml, .gitlab-ci.yml)
6. Deployment configs (vercel.json, netlify.toml, render.yaml)
```

Verify consistency across all locations.

### 6. **Peer Dependency Conflicts**

Run this command and analyze output:

```bash
npm ls react react-dom react-router-dom @types/react @types/react-dom
```

Look for:
- ⚠️ `UNMET PEER DEPENDENCY` warnings
- ⚠️ Multiple versions installed (deduplication issues)
- ⚠️ Version mismatches between peer dependencies

### 7. **Import Pattern Analysis**

Search the codebase for problematic import patterns:

```bash
# Search for React 19-only hooks/APIs
grep -r "import.*\buse\b.*from.*react" src/ --include="*.tsx" --include="*.ts"

# Verify these are only standard hooks (useState, useEffect, etc.)
# NOT the new 'use' hook (React 19 only)
```

### 8. **Lock File Analysis**

Check package-lock.json (npm) or yarn.lock (yarn):

```bash
# For npm:
grep -A 5 '"react-router-dom"' package-lock.json | head -20

# For yarn:
grep -A 5 'react-router-dom@' yarn.lock | head -20
```

Verify locked versions match package.json expectations.

### 9. **Environment & Build Configuration**

Check these config files for compatibility:

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "es5" or "es6" or higher,
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "react-jsx" (for React 17+) or "react" (for React <17),
    "module": "esnext",
    "moduleResolution": "node"
  }
}
```

**react-app-env.d.ts:** Should reference React types correctly.

### 10. **Migration Path Recommendation**

Based on findings, provide one of these recommendations:

#### Option A: Stick with React 18 (Recommended for stability)
```bash
npm install react@18 react-dom@18 @types/react@18 @types/react-dom@18 react-router-dom@6 react-leaflet@4
```

#### Option B: Upgrade to React 19 (Latest features)
```bash
# First upgrade Node to 20+
nvm install 20
nvm use 20

# Then upgrade packages
npm install react@19 react-dom@19 @types/react@19 @types/react-dom@19

# Update react-icons types for React 19
```

### 11. **Generate Audit Report**

Provide a report in this format:

```markdown
## Dependency Audit Report

### Current Versions
- React: [version]
- React Router: [version]
- TypeScript: [version]
- Node: [version]

### Issues Found
1. [Issue description]
   - Impact: [High/Medium/Low]
   - Error: [Actual error message if applicable]
   - Fix: [Specific fix command]

### Compatibility Status
- ✅ React & React DOM versions match
- ⚠️ React Router version incompatible with React
- ❌ Node version below requirements
- [etc.]

### Recommended Actions
1. [Prioritized list of fixes]
2. [Include specific commands]
3. [Note any breaking changes]

### Migration Commands
[Provide exact commands to fix all issues]
```

---

## 🚨 RED FLAGS TO WATCH FOR

Immediately flag these combinations as CRITICAL issues:

1. **React 18 + React Router 7** → Build will fail
2. **React 18 + React Leaflet 5** → Build will fail
3. **Firebase 12+ + Node 18** → Runtime warnings (works but unsupported)
4. **Mismatched @types/react versions** → TypeScript errors
5. **Custom react-icons.d.ts with wrong return type** → JSX component errors
6. **No Node version specified in package.json** → Deployment issues

---

## 📋 CHECKLIST

After running the audit, confirm:

- [ ] React and React DOM versions match
- [ ] React types versions match React version
- [ ] React Router version is compatible with React version
- [ ] All mapping libraries (leaflet, etc.) are compatible
- [ ] Node version meets all package requirements
- [ ] No "use" hook imports (unless React 19+)
- [ ] react-icons types are correct for React version
- [ ] package-lock.json has no conflicting versions
- [ ] Build completes without type errors
- [ ] Dev server starts without engine warnings

---

## 🔧 PREVENTIVE MEASURES

Recommend adding these to the repository:

### 1. .nvmrc file
```
20.11.0
```

### 2. package.json engines field
```json
{
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

### 3. Pre-commit hook to check compatibility
```bash
#!/bin/bash
# .husky/pre-commit or .git/hooks/pre-commit
node --version | grep -q "v20" || echo "⚠️  Warning: Node 20+ recommended"
```

### 4. CI/CD matrix testing
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
    react-version: [18.x, 19.x]
```

---

## 💡 ADDITIONAL CONTEXT FOR AI

When performing this audit, also consider:

1. **Framework-specific quirks:**
   - Create React App (react-scripts) has specific peer deps
   - Next.js has different React requirements
   - Vite has different build constraints

2. **Monorepo considerations:**
   - Check workspace/package hoisting
   - Verify consistent versions across packages
   - Check root package.json vs workspace package.json

3. **Legacy code patterns:**
   - Old React import style: `import React from 'react'` vs new JSX transform
   - Class components vs functional components
   - PropTypes vs TypeScript

4. **Third-party integration risks:**
   - Check if any packages have known React 19 incompatibilities
   - Verify testing library versions (@testing-library/react)
   - Check state management libraries (Redux, Zustand, etc.)

---

**END OF AUDIT PROMPT**

Use this prompt as-is with any AI assistant to get a thorough dependency compatibility check.
