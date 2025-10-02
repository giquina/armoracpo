import { messaging } from '../lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { supabase } from '../lib/supabase';

// SECURITY: VAPID key must be stored as an environment variable
// Get this from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

if (!VAPID_KEY) {
  console.error('[Notifications] VAPID key not configured in environment variables');
}

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('[Notifications] Not supported in this browser');
      return null;
    }

    // Check if messaging is initialized
    if (!messaging) {
      console.warn('[Notifications] Firebase messaging not initialized');
      return null;
    }

    // Check if VAPID key is configured
    if (!VAPID_KEY) {
      console.error('[Notifications] VAPID key not configured');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('[Notifications] Permission denied');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log('[Notifications] FCM token obtained:', token.substring(0, 20) + '...');

    return token;
  } catch (error) {
    console.error('[Notifications] Error getting token:', error);
    return null;
  }
}

/**
 * Store FCM token in Supabase for the current user
 */
export async function storeFCMToken(userId: string, token: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cpo_fcm_tokens')
      .upsert(
        {
          cpo_id: userId,
          fcm_token: token,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'cpo_id'
        }
      );

    if (error) throw error;

    console.log('[Notifications] Token stored successfully');
    return true;
  } catch (error) {
    console.error('[Notifications] Error storing token:', error);
    return false;
  }
}

/**
 * Initialize notifications for the current user
 */
export async function initializeNotifications(userId: string): Promise<void> {
  try {
    // Request permission and get token
    const token = await requestNotificationPermission();

    if (token && messaging) {
      // Store token in database
      await storeFCMToken(userId, token);

      // Set up foreground message handler
      onMessage(messaging, (payload) => {
        console.log('[Notifications] Foreground message received:', payload);

        // Show notification even when app is in foreground
        if (payload.notification) {
          const { title, body } = payload.notification;

          // Create a notification
          if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title || 'Armora CPO', {
              body: body || 'New notification',
              icon: '/logo192.png',
              badge: '/favicon.ico',
              tag: payload.data?.assignmentId || 'armora-notification',
              data: payload.data,
              requireInteraction: payload.data?.requireInteraction === 'true'
            });

            notification.onclick = (event) => {
              event.preventDefault();
              const url = payload.data?.url || '/';
              window.focus();
              window.location.href = url;
              notification.close();
            };
          }
        }
      });
    }
  } catch (error) {
    console.error('[Notifications] Initialization error:', error);
  }
}

/**
 * Subscribe to a topic for targeted notifications
 */
export async function subscribeToTopic(topic: string): Promise<boolean> {
  try {
    const token = await requestNotificationPermission();
    if (!token) return false;

    // Note: Topic subscription must be done server-side via Firebase Admin SDK
    // This is a placeholder for client-side implementation
    console.log('[Notifications] Topic subscription requested:', topic);
    return true;
  } catch (error) {
    console.error('[Notifications] Error subscribing to topic:', error);
    return false;
  }
}

/**
 * Check if notifications are enabled
 */
export function areNotificationsEnabled(): boolean {
  if (!('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'default';
  return Notification.permission;
}
