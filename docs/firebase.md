# 🔥 Firebase Integration - Armora CPO

## Overview

Firebase provides authentication, cloud messaging (push notifications), and real-time database capabilities for the Armora CPO app. This guide covers complete Firebase integration alongside Supabase.

---

## 🚀 Firebase Setup

### **1. Create Firebase Project**

```bash
# Visit: https://console.firebase.google.com
# Click "Add project"
# Project name: armora-cpo
# Enable Google Analytics (optional)
# Select analytics account or create new
```

### **2. Add Web App**

1. In Firebase Console → Project Settings
2. Click "Add app" → Select Web (</> icon)
3. App nickname: "Armora CPO Web"
4. Check "Also set up Firebase Hosting" (optional)
5. Register app

### **3. Install Firebase SDK**

```bash
npm install firebase
```

### **4. Get Configuration**

From Firebase Console → Project Settings → Your apps:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "armora-cpo.firebaseapp.com",
  projectId: "armora-cpo",
  storageBucket: "armora-cpo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

---

## 🔐 Firebase Authentication

### **src/services/firebase/config.ts**

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(firebaseApp);

// Initialize messaging (only if supported)
export const getMessagingInstance = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(firebaseApp) : null;
};
```

---

### **src/services/firebase/auth.ts**

```typescript
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth } from './config';
import { User } from '@/types';

/**
 * Sign in with email and password
 */
export const signIn = async (
  email: string,
  password: string
): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Register new CPO
 */
export const register = async (
  email: string,
  password: string,
  fullName: string
): Promise<FirebaseUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name
    await updateProfile(userCredential.user, {
      displayName: fullName
    });

    return userCredential.user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign out
 */
export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Update user password
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('No user logged in');

  try {
    // Re-authenticate before password change
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Listen for auth state changes
 */
export const onAuthStateChange = (
  callback: (user: FirebaseUser | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Get ID token for API requests
 */
export const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
};

/**
 * User-friendly error messages
 */
const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/operation-not-allowed': 'This operation is not allowed',
    'auth/requires-recent-login': 'Please log in again to complete this action'
  };

  return errorMessages[errorCode] || 'Authentication failed. Please try again';
};

/**
 * Firebase Auth service object
 */
export const authService = {
  signIn,
  register,
  signInWithGoogle,
  signOut: signOutUser,
  resetPassword,
  changePassword,
  onAuthStateChange,
  getCurrentUser,
  getAuthToken
};
```

---

## 📲 Push Notifications (Cloud Messaging)

### **1. Enable Cloud Messaging**

In Firebase Console:
1. Go to Project Settings → Cloud Messaging
2. Generate Web Push Certificate (VAPID key)
3. Copy the key pair value

---

### **2. Service Worker for Push Notifications**

**public/firebase-messaging-sw.js**

```javascript
// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "armora-cpo.firebaseapp.com",
  projectId: "armora-cpo",
  storageBucket: "armora-cpo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
});

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: 'View Assignment'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    const urlToOpen = event.notification.data.url || '/';
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});
```

---

### **3. Push Notification Service**

**src/services/firebase/messaging.ts**

```typescript
import { getToken, onMessage } from 'firebase/messaging';
import { getMessagingInstance } from './config';

const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY!;

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.warn('Messaging not supported in this browser');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.ready
      });

      console.log('FCM Token:', token);
      return token;
    } else {
      console.warn('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onForegroundMessage = async (
  callback: (payload: any) => void
): Promise<(() => void) | null> => {
  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
};

/**
 * Show notification (with permission check)
 */
export const showNotification = (
  title: string,
  options: NotificationOptions = {}
): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      ...options
    });
  }
};

/**
 * Save FCM token to backend
 */
export const saveFCMToken = async (
  cpoId: string,
  token: string
): Promise<void> => {
  try {
    await fetch('/api/cpo/fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cpoId, token })
    });
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

/**
 * Messaging service object
 */
export const messagingService = {
  requestNotificationPermission,
  onForegroundMessage,
  showNotification,
  saveFCMToken
};
```

---

### **4. Using Push Notifications in React**

```typescript
// src/hooks/useNotifications.ts

import { useEffect, useState } from 'react';
import { messagingService } from '@/services/firebase/messaging';
import { useAuth } from '@/contexts/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const setupNotifications = async () => {
      // Request permission and get token
      const token = await messagingService.requestNotificationPermission();

      if (token && user) {
        setFcmToken(token);
        // Save token to backend
        await messagingService.saveFCMToken(user.id, token);
      }
    };

    setupNotifications();

    // Listen for foreground messages
    const unsubscribe = messagingService.onForegroundMessage((payload) => {
      // Show notification in app
      messagingService.showNotification(
        payload.notification.title,
        {
          body: payload.notification.body,
          data: payload.data
        }
      );
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  return { fcmToken };
};
```

---

## 🔔 Notification Types for CPO App

### **Backend: Send Notifications**

```typescript
// Example: Node.js backend sending notification via Firebase Admin SDK

import admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});

/**
 * Send new assignment notification
 */
export const sendNewAssignmentNotification = async (
  cpoFcmToken: string,
  assignmentData: {
    id: string;
    type: string;
    location: string;
    amount: number;
  }
) => {
  const message = {
    notification: {
      title: '🚨 New Assignment Available',
      body: `${assignmentData.type} - ${assignmentData.location} - £${assignmentData.amount}`
    },
    data: {
      type: 'new_assignment',
      assignmentId: assignmentData.id,
      url: `/assignments/${assignmentData.id}`
    },
    token: cpoFcmToken
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Notification sent:', response);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

/**
 * Send assignment update notification
 */
export const sendAssignmentUpdateNotification = async (
  cpoFcmToken: string,
  message: string,
  assignmentId: string
) => {
  await admin.messaging().send({
    notification: {
      title: 'Assignment Update',
      body: message
    },
    data: {
      type: 'assignment_update',
      assignmentId,
      url: `/assignments/${assignmentId}`
    },
    token: cpoFcmToken
  });
};

/**
 * Send compliance reminder notification
 */
export const sendComplianceReminderNotification = async (
  cpoFcmToken: string,
  documentType: string,
  daysUntilExpiry: number
) => {
  await admin.messaging().send({
    notification: {
      title: '⚠️ Compliance Alert',
      body: `Your ${documentType} expires in ${daysUntilExpiry} days`
    },
    data: {
      type: 'compliance_reminder',
      url: '/compliance'
    },
    token: cpoFcmToken
  });
};

/**
 * Send emergency SOS alert
 */
export const sendSOSAlert = async (
  dispatchFcmTokens: string[],
  cpoName: string,
  location: { lat: number; lng: number }
) => {
  const message = {
    notification: {
      title: '🚨 EMERGENCY SOS ALERT',
      body: `${cpoName} has triggered emergency SOS`
    },
    data: {
      type: 'sos_alert',
      cpoName,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
      url: '/emergency'
    }
  };

  // Send to all dispatch tokens
  await admin.messaging().sendMulticast({
    ...message,
    tokens: dispatchFcmTokens
  });
};
```

---

## 🔄 Real-time Database (Optional Alternative to Supabase)

### **Firebase Realtime Database Setup**

```typescript
// src/services/firebase/database.ts

import { getDatabase, ref, set, onValue, off, update } from 'firebase/database';
import { firebaseApp } from './config';

const database = getDatabase(firebaseApp);

/**
 * Update CPO location in real-time
 */
export const updateCPOLocation = async (
  cpoId: string,
  location: { lat: number; lng: number }
) => {
  const locationRef = ref(database, `cpo_locations/${cpoId}`);
  await set(locationRef, {
    latitude: location.lat,
    longitude: location.lng,
    timestamp: Date.now()
  });
};

/**
 * Listen to CPO location updates
 */
export const subscribeToCPOLocation = (
  cpoId: string,
  callback: (location: { lat: number; lng: number; timestamp: number }) => void
) => {
  const locationRef = ref(database, `cpo_locations/${cpoId}`);

  onValue(locationRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback({
        lat: data.latitude,
        lng: data.longitude,
        timestamp: data.timestamp
      });
    }
  });

  // Return unsubscribe function
  return () => off(locationRef);
};

/**
 * Update assignment status in real-time
 */
export const updateAssignmentStatus = async (
  assignmentId: string,
  status: string
) => {
  const assignmentRef = ref(database, `assignments/${assignmentId}`);
  await update(assignmentRef, {
    status,
    updatedAt: Date.now()
  });
};
```

---

## 🧪 Testing Firebase Integration

### **src/services/firebase/firebase.test.ts**

```typescript
import { signIn, register } from './auth';
import { requestNotificationPermission } from './messaging';

describe('Firebase Authentication', () => {
  it('signs in user successfully', async () => {
    const user = await signIn('test@example.com', 'password123');
    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });

  it('throws error for invalid credentials', async () => {
    await expect(
      signIn('test@example.com', 'wrongpassword')
    ).rejects.toThrow('Incorrect password');
  });
});

describe('Firebase Messaging', () => {
  it('requests notification permission', async () => {
    // Mock Notification API
    global.Notification = {
      requestPermission: jest.fn().mockResolvedValue('granted')
    } as any;

    const token = await requestNotificationPermission();
    expect(token).toBeDefined();
  });
});
```

---

## 🔐 Security Rules

### **Firestore Security Rules**

```javascript
// firestore.rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // CPO profiles
    match /cpo_profiles/{cpoId} {
      allow read: if request.auth != null && request.auth.uid == cpoId;
      allow write: if request.auth != null && request.auth.uid == cpoId;
    }

    // Assignments
    match /assignments/{assignmentId} {
      allow read: if request.auth != null && (
        resource.data.cpoId == request.auth.uid ||
        resource.data.principalId == request.auth.uid
      );
      allow write: if request.auth != null && (
        resource.data.cpoId == request.auth.uid
      );
    }

    // Messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **Realtime Database Security Rules**

```json
{
  "rules": {
    "cpo_locations": {
      "$cpoId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $cpoId"
      }
    },
    "assignments": {
      "$assignmentId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

---

## 📊 Analytics (Optional)

### **Firebase Analytics Integration**

```typescript
// src/services/firebase/analytics.ts

import { getAnalytics, logEvent } from 'firebase/analytics';
import { firebaseApp } from './config';

const analytics = getAnalytics(firebaseApp);

/**
 * Log assignment accepted event
 */
export const logAssignmentAccepted = (assignmentId: string, type: string) => {
  logEvent(analytics, 'assignment_accepted', {
    assignment_id: assignmentId,
    assignment_type: type
  });
};

/**
 * Log assignment completed event
 */
export const logAssignmentCompleted = (
  assignmentId: string,
  duration: number,
  earnings: number
) => {
  logEvent(analytics, 'assignment_completed', {
    assignment_id: assignmentId,
    duration_hours: duration,
    earnings: earnings
  });
};

/**
 * Log compliance document uploaded
 */
export const logComplianceUpload = (documentType: string) => {
  logEvent(analytics, 'compliance_document_uploaded', {
    document_type: documentType
  });
};
```

---

## 🚀 Deployment Checklist

### **Firebase Console Configuration:**
- [ ] Enable Email/Password authentication
- [ ] Enable Google Sign-In (optional)
- [ ] Generate Web Push certificate (VAPID key)
- [ ] Configure authorized domains (vercel app domains)
- [ ] Set up Cloud Messaging
- [ ] Deploy security rules
- [ ] Enable Analytics (optional)

### **Environment Variables (.env.production):**
```bash
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_VAPID_KEY=
```

---

## 📚 Useful Firebase CLI Commands

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Deploy security rules
firebase deploy --only firestore:rules
firebase deploy --only database:rules

# Deploy functions (if using Cloud Functions)
firebase deploy --only functions

# Test locally
firebase emulators:start

# View logs
firebase functions:log
```

---

## 🔄 Migration from Supabase to Firebase (If Needed)

If you decide to fully migrate from Supabase to Firebase:

1. **Firestore instead of PostgreSQL**
2. **Firebase Storage instead of Supabase Storage**
3. **Cloud Functions instead of Supabase Edge Functions**

```typescript
// Example: Migrating data from Supabase to Firestore

import { supabase } from '@/services/supabase';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firestore = getFirestore(firebaseApp);

const migrateData = async () => {
  // Fetch from Supabase
  const { data: cpoProfiles } = await supabase
    .from('cpo_profiles')
    .select('*');

  // Write to Firestore
  for (const profile of cpoProfiles || []) {
    await setDoc(doc(firestore, 'cpo_profiles', profile.id), profile);
  }

  console.log('Migration complete!');
};
```

---

## 🎯 Best Practices

1. **Use Firebase for Auth + Messaging only** - Keep Supabase for data
2. **Secure FCM tokens** - Store in Supabase, never expose
3. **Handle permission denials gracefully** - Don't break UX
4. **Throttle real-time updates** - Prevent excessive notifications
5. **Test notifications on real devices** - Service workers behave differently
6. **Monitor Firebase usage** - Check quotas in Firebase Console
7. **Keep Firebase SDK updated** - Security patches important

---

**Firebase integration complete! 🔥**

Your CPO app now has robust authentication and push notifications.
