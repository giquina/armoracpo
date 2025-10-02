# ▲ Vercel Deployment Guide - Armora CPO

## Overview

This guide covers deploying the Armora CPO mobile app to Vercel with PWA support, environment variables, and optimized performance.

---

## 🚀 Quick Start Deployment

### **1. Install Vercel CLI**

```bash
npm install -g vercel
```

### **2. Login to Vercel**

```bash
vercel login
```

### **3. Deploy**

```bash
# Development deployment
vercel

# Production deployment
vercel --prod
```

---

## 📦 Project Configuration

### **vercel.json**

```json
{
  "version": 2,
  "name": "armora-cpo",
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "devCommand": "npm start",
  "installCommand": "npm install",
  "framework": "create-react-app",
  "regions": ["lhr1"],
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "routes": [
    {
      "src": "/service-worker.js",
      "headers": {
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Service-Worker-Allowed": "/"
      },
      "dest": "/service-worker.js"
    },
    {
      "src": "/manifest.json",
      "headers": {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=0, must-revalidate"
      },
      "dest": "/manifest.json"
    },
    {
      "src": "/static/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "headers": {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "geolocation=(self), camera=(self), microphone=(self)"
      },
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.googleapis.com https://*.stripe.com; frame-src 'self' https://*.stripe.com;"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.armora.app/api/:path*"
    }
  ]
}
```

---

## 🔐 Environment Variables

### **Development (.env.development)**

```bash
# React App
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:3000/api

# Firebase
REACT_APP_FIREBASE_API_KEY=your_dev_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=armora-dev.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=armora-dev
REACT_APP_FIREBASE_STORAGE_BUCKET=armora-dev.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef

# Supabase
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_dev_supabase_anon_key

# Stripe
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_dev_key

# Maps
REACT_APP_GOOGLE_MAPS_API_KEY=your_dev_maps_key

# Encryption
REACT_APP_ENCRYPTION_KEY=your_dev_encryption_key
```

### **Production (.env.production)**

```bash
# React App
REACT_APP_ENV=production
REACT_APP_API_URL=https://api.armora.app/api

# Firebase
REACT_APP_FIREBASE_API_KEY=your_prod_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=armora-prod.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=armora-prod
REACT_APP_FIREBASE_STORAGE_BUCKET=armora-prod.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=987654321
REACT_APP_FIREBASE_APP_ID=1:987654321:web:fedcba

# Supabase
REACT_APP_SUPABASE_URL=https://your-prod-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_prod_supabase_anon_key

# Stripe
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_prod_key

# Maps
REACT_APP_GOOGLE_MAPS_API_KEY=your_prod_maps_key

# Encryption
REACT_APP_ENCRYPTION_KEY=your_prod_encryption_key
```

---

### **Setting Environment Variables in Vercel**

#### **Via Vercel Dashboard:**

1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add each variable with appropriate environment (Production/Preview/Development)

#### **Via Vercel CLI:**

```bash
# Add production environment variable
vercel env add REACT_APP_FIREBASE_API_KEY production

# Add preview environment variable
vercel env add REACT_APP_FIREBASE_API_KEY preview

# Add development environment variable
vercel env add REACT_APP_FIREBASE_API_KEY development

# Pull environment variables locally
vercel env pull .env.local
```

---

## 🏗️ Build Configuration

### **package.json Scripts**

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "build:analyze": "source-map-explorer 'build/static/js/*.js'",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "deploy": "vercel --prod",
    "deploy:preview": "vercel"
  },
  "devDependencies": {
    "source-map-explorer": "^2.5.3"
  }
}
```

---

### **Build Optimization**

```javascript
// craco.config.js (if using CRACO for customization)

const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  webpack: {
    plugins: {
      add: [
        // Gzip compression
        new CompressionPlugin({
          filename: '[path][base].gz',
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 8192,
          minRatio: 0.8
        }),
        // Bundle analyzer (only in development)
        ...(process.env.ANALYZE_BUNDLE
          ? [new BundleAnalyzerPlugin()]
          : [])
      ]
    },
    configure: (webpackConfig) => {
      // Optimize production build
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name(module) {
                  const packageName = module.context.match(
                    /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                  )[1];
                  return `vendor.${packageName.replace('@', '')}`;
                },
                priority: 10
              },
              common: {
                minChunks: 2,
                priority: 5,
                reuseExistingChunk: true
              }
            }
          }
        };
      }

      return webpackConfig;
    }
  }
};
```

---

## 📱 PWA Configuration

### **public/manifest.json**

```json
{
  "name": "Armora CPO - Close Protection Officer",
  "short_name": "Armora CPO",
  "description": "Professional security operations platform for SIA-licensed Close Protection Officers",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#FFD700",
  "orientation": "portrait",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["business", "productivity", "security"],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "1170x2532",
      "type": "image/png",
      "label": "Dashboard with operational status"
    },
    {
      "src": "/screenshots/assignments.png",
      "sizes": "1170x2532",
      "type": "image/png",
      "label": "Available assignments"
    }
  ],
  "related_applications": [
    {
      "platform": "play",
      "url": "https://play.google.com/store/apps/details?id=com.armora.cpo"
    }
  ]
}
```

---

### **Service Worker Configuration**

```javascript
// src/service-worker.js (Custom service worker)

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Clean up old caches
cleanupOutdatedCaches();

// Precache all assets generated by the build
precacheAndRoute(self.__WB_MANIFEST);

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

// Cache API responses (with network-first strategy)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60 // 5 minutes
      })
    ]
  })
);

// Cache CSS and JS
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources'
  })
);

// Background sync for offline requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-assignments') {
    event.waitUntil(syncAssignments());
  }
});

async function syncAssignments() {
  // Sync offline assignment updates when back online
  const cache = await caches.open('offline-requests');
  const requests = await cache.keys();

  return Promise.all(
    requests.map(async (request) => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.error('Sync failed:', error);
      }
    })
  );
}

// Push notification handling
self.addEventListener('push', (event) => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url
    },
    actions: [
      {
        action: 'open',
        title: 'View Assignment'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
```

---

## 🔄 Continuous Deployment

### **GitHub Integration**

1. **Connect GitHub to Vercel:**
   - Go to Vercel Dashboard
   - Import Project → Select GitHub repository
   - Configure build settings
   - Deploy

2. **Auto-deploy on Push:**
   - Vercel automatically deploys on push to `main` branch
   - Preview deployments for all branches

---

### **GitHub Actions (Optional CI/CD)**

```yaml
# .github/workflows/deploy.yml

name: Deploy to Vercel

on:
  push:
    branches:
      - main
      - develop

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage --watchAll=false

      - name: Run linter
        run: npm run lint

      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🌍 Custom Domain Setup

### **1. Add Custom Domain in Vercel**

```bash
vercel domains add cpo.armora.app
```

### **2. Configure DNS Records**

Add these records in your DNS provider:

```
Type    Name              Value
A       cpo.armora.app    76.76.21.21
AAAA    cpo.armora.app    2606:4700:10::6816:1515
```

### **3. SSL Certificate**

Vercel automatically provisions SSL certificates via Let's Encrypt.

---

## 📊 Performance Monitoring

### **Vercel Analytics**

```typescript
// src/index.tsx

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

ReactDOM.render(
  <React.StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>,
  document.getElementById('root')
);
```

---

### **Web Vitals Tracking**

```typescript
// src/reportWebVitals.ts

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id
  });

  // Send to Vercel Analytics
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', body);
  } else {
    fetch('/api/analytics', { body, method: 'POST', keepalive: true });
  }
}

export function reportWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
```

---

## 🚀 Deployment Checklist

### **Pre-Deployment:**
- [ ] All environment variables set in Vercel
- [ ] Build succeeds locally (`npm run build`)
- [ ] All tests passing (`npm test`)
- [ ] Linting passed (`npm run lint`)
- [ ] Lighthouse score > 90 (Performance, Accessibility, SEO)
- [ ] PWA manifest configured
- [ ] Service worker tested
- [ ] Security headers configured
- [ ] HTTPS only enforced

### **Post-Deployment:**
- [ ] Test all core features on production URL
- [ ] Verify environment variables loaded correctly
- [ ] Check service worker registration
- [ ] Test offline functionality
- [ ] Verify push notifications working
- [ ] Test on multiple devices (iOS, Android)
- [ ] Check analytics tracking
- [ ] Monitor error logs
- [ ] Test custom domain (if configured)

---

## 🔧 Troubleshooting

### **Build Fails:**

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build

# Check build logs in Vercel Dashboard
vercel logs
```

### **Environment Variables Not Working:**

```bash
# Pull latest environment variables
vercel env pull .env.local

# Verify in code
console.log('API URL:', process.env.REACT_APP_API_URL);

# Redeploy after adding new env vars
vercel --prod --force
```

### **Service Worker Not Updating:**

```javascript
// Force service worker update
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.update();
    });
  });
}
```

### **Caching Issues:**

```bash
# Clear Vercel cache
vercel --prod --force

# Clear browser cache
# Or use cache-busting query params
```

---

## 📈 Performance Targets

### **Lighthouse Scores (Mobile):**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90
- PWA: ✓ Installable

### **Core Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### **Bundle Size:**
- Initial bundle: < 200KB (gzipped)
- Total JavaScript: < 500KB (gzipped)

---

## 🔐 Security Best Practices

### **Content Security Policy:**

Configured in `vercel.json` headers:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co https://*.googleapis.com;
```

### **Security Headers:**
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Referrer-Policy: strict-origin-when-cross-origin

---

## 📚 Useful Commands

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# View deployment logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm <deployment-url>

# Pull environment variables
vercel env pull

# Add environment variable
vercel env add

# Link local project to Vercel
vercel link

# Check project info
vercel inspect

# Generate production build locally
npm run build

# Analyze bundle size
npm run build:analyze
```

---

## 🎯 Production URL

After deployment:

- **Production:** https://cpo.armora.app
- **Preview:** https://armora-cpo-git-develop.vercel.app
- **Development:** http://localhost:3000

---

**Deployment complete! 🚀**

Monitor performance and errors via Vercel Dashboard.
