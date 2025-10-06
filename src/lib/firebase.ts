import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { supabase, isSupabaseEnabled } from './supabase';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Check if Firebase config is complete
const isFirebaseEnabled = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app: any = null;
let messaging: Messaging | null = null;

// Initialize Firebase only if config is available
if (isFirebaseEnabled) {
  try {
    app = initializeApp(firebaseConfig);
    
    // Initialize messaging only in supported browsers
    if ('Notification' in window && 'serviceWorker' in navigator) {
      messaging = getMessaging(app);
    }
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
} else {
  console.log('Firebase disabled - missing configuration');
}

export const requestNotificationPermission = async (userId: string): Promise<string | null> => {
  try {
    if (!messaging || !isSupabaseEnabled) {
      console.warn('Messaging or Supabase not initialized - skipping notifications');
      return null;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      });

      // Save token to Supabase
      await supabase
        .from('protection_officers')
        .update({ fcm_token: token })
        .eq('user_id', userId);

      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) {
      return;
    }

    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { messaging };
