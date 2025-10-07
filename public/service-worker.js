/* eslint-disable no-restricted-globals */
// Armora CPO Service Worker with Firebase Cloud Messaging

// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase with environment-based config
// Config will be injected by the build process or passed via message
let firebaseInitialized = false;
let messaging = null;

// Fallback: Initialize with production config
// NOTE: These values are safe to expose as they are client-side Firebase config
// Security is enforced through Firebase Security Rules
try {
  firebase.initializeApp({
    apiKey: "AIzaSyDBpJL8uN2s6HN4qcWnR0vCwZVU5w3g5YE",
    authDomain: "armora-protection.firebaseapp.com",
    projectId: "armora-protection",
    storageBucket: "armora-protection.firebasestorage.app",
    messagingSenderId: "785567849849",
    appId: "1:785567849849:web:1e8a4e3f2e0b9c8d4f5e6a"
  });
  messaging = firebase.messaging();
  firebaseInitialized = true;
  console.log('[Service Worker] Firebase initialized successfully');
} catch (error) {
  console.error('[Service Worker] Firebase initialization failed:', error);
}

// Listen for config message from main thread (for dynamic configuration)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG' && !firebaseInitialized) {
    try {
      firebase.initializeApp(event.data.config);
      messaging = firebase.messaging();
      firebaseInitialized = true;
      console.log('[Service Worker] Firebase re-initialized with dynamic config');
    } catch (error) {
      console.error('[Service Worker] Firebase dynamic initialization failed:', error);
    }
  }
});

// Cache configuration
const CACHE_NAME = 'armora-cpo-v1';
const STATIC_CACHE = 'armora-static-v1';
const DYNAMIC_CACHE = 'armora-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })))
          .catch(err => console.log('[Service Worker] Cache add failed:', err));
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Chrome extensions and non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // API calls - network first, then cache
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase') || url.hostname.includes('firebase')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets - cache first, then network
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Handle background FCM messages
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('[Service Worker] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'Armora CPO';
    const notificationOptions = {
      body: payload.notification?.body || 'New notification',
      icon: '/logo192.png',
      badge: '/favicon.ico',
      tag: payload.data?.assignmentId || 'armora-notification',
      data: {
        url: payload.data?.url || '/',
        assignmentId: payload.data?.assignmentId,
        type: payload.data?.type
      },
      requireInteraction: payload.data?.requireInteraction === 'true',
      vibrate: [200, 100, 200],
      actions: payload.data?.actions ? JSON.parse(payload.data.actions) : []
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
  console.error('[Service Worker] Messaging not initialized, cannot handle background messages');
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.notification.tag);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle push events (for custom push notifications)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/favicon.ico',
      data: data.data
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
});

console.log('[Service Worker] Loaded successfully');
