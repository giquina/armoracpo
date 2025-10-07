// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase
// NOTE: These values are safe to expose as they are client-side Firebase config
// Security is enforced through Firebase Security Rules
const firebaseConfig = {
  apiKey: "AIzaSyDBpJL8uN2s6HN4qcWnR0vCwZVU5w3g5YE",
  authDomain: "armora-protection.firebaseapp.com",
  projectId: "armora-protection",
  storageBucket: "armora-protection.firebasestorage.app",
  messagingSenderId: "785567849849",
  appId: "1:785567849849:web:1e8a4e3f2e0b9c8d4f5e6a"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Armora CPO';
  const notificationOptions = {
    body: payload.notification?.body || 'New notification',
    icon: '/logo192.png',
    badge: '/favicon.ico',
    tag: payload.data?.assignmentId || 'armora-notification',
    data: payload.data,
    requireInteraction: payload.data?.requireInteraction === 'true',
    vibrate: [200, 100, 200]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Allow dynamic config updates (optional)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    console.log('[firebase-messaging-sw.js] Received config update, but already initialized');
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  // Open the app or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
