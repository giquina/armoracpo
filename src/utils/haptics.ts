/**
 * Haptic Feedback Utility
 * Provides vibration feedback for mobile devices
 */

export type VibrationType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const vibrationPatterns: Record<VibrationType, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 40,
  success: [10, 50, 10],
  warning: [20, 100, 20],
  error: [50, 100, 50, 100, 50],
};

/**
 * Check if the Vibration API is supported
 */
export const isHapticsSupported = (): boolean => {
  return 'vibrate' in navigator;
};

/**
 * Trigger haptic feedback
 * @param type - Type of vibration pattern
 */
export const vibrate = (type: VibrationType = 'light'): void => {
  if (!isHapticsSupported()) {
    return;
  }

  const pattern = vibrationPatterns[type];
  navigator.vibrate(pattern);
};

/**
 * Cancel any ongoing vibration
 */
export const cancelVibration = (): void => {
  if (!isHapticsSupported()) {
    return;
  }

  navigator.vibrate(0);
};

/**
 * Custom vibration pattern
 * @param pattern - Array of vibration/pause durations in milliseconds
 */
export const vibratePattern = (pattern: number[]): void => {
  if (!isHapticsSupported()) {
    return;
  }

  navigator.vibrate(pattern);
};

// Export convenience functions
export const haptics = {
  isSupported: isHapticsSupported,
  vibrate,
  cancel: cancelVibration,
  pattern: vibratePattern,
  light: () => vibrate('light'),
  medium: () => vibrate('medium'),
  heavy: () => vibrate('heavy'),
  success: () => vibrate('success'),
  warning: () => vibrate('warning'),
  error: () => vibrate('error'),
};
