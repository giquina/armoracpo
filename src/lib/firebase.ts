/**
 * MOCK FIREBASE - All Firebase functionality disabled for UI testing
 */

// Mock Messaging type
export type Messaging = null;

let messaging: Messaging | null = null;
let firebaseEnabled = false;

console.log('[MOCK FIREBASE] Firebase completely disabled - using mock mode');

export const requestNotificationPermission = async (userId: string): Promise<string | null> => {
  console.log('[MOCK FIREBASE] Mock notification permission request for:', userId);
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    console.log('[MOCK FIREBASE] Mock message listener');
    // Never resolves - no messages in mock mode
  });

export { messaging };
