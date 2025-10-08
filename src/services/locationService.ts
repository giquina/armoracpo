import { supabase } from '../lib/supabase';
import { addBreadcrumb } from '../lib/sentry';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

let watchId: number | null = null;
let currentAssignmentId: string | null = null;

export const locationService = {
  /**
   * Get current position once
   */
  async getCurrentPosition(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          };

          addBreadcrumb('Location acquired', 'location', {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy,
          });

          resolve(locationData);
        },
        (error) => {
          console.error('[Location Service] Error getting position:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  },

  /**
   * Start tracking location for an active assignment
   */
  async startTracking(assignmentId: string, cpoId: string): Promise<void> {
    if (watchId !== null) {
      console.warn('[Location Service] Already tracking location');
      return;
    }

    if (!('geolocation' in navigator)) {
      throw new Error('Geolocation is not supported by this browser');
    }

    currentAssignmentId = assignmentId;

    // Update location every 5 minutes
    const updateInterval = 5 * 60 * 1000; // 5 minutes
    let lastUpdate = 0;

    watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const now = Date.now();

        // Only update if 5 minutes have passed since last update
        if (now - lastUpdate < updateInterval) {
          return;
        }

        lastUpdate = now;

        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        };

        try {
          await this.updateLocation(assignmentId, cpoId, locationData);
          console.log('[Location Service] Location updated successfully');
        } catch (error) {
          console.error('[Location Service] Failed to update location:', error);
        }
      },
      (error) => {
        console.error('[Location Service] Watch position error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      }
    );

    // Also save initial position immediately
    try {
      const initialPosition = await this.getCurrentPosition();
      await this.updateLocation(assignmentId, cpoId, initialPosition);
      console.log('[Location Service] Started tracking for assignment:', assignmentId);
    } catch (error) {
      console.error('[Location Service] Failed to get initial position:', error);
    }
  },

  /**
   * Stop tracking location
   */
  stopTracking(): void {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      currentAssignmentId = null;
      console.log('[Location Service] Stopped tracking');
    }
  },

  /**
   * Check if currently tracking
   */
  isTracking(): boolean {
    return watchId !== null;
  },

  /**
   * Get current tracking assignment ID
   */
  getTrackingAssignmentId(): string | null {
    return currentAssignmentId;
  },

  /**
   * Update location in database
   */
  async updateLocation(
    assignmentId: string,
    cpoId: string,
    locationData: LocationData
  ): Promise<void> {
    try {
      const { error } = await supabase.from('location_history').insert({
        assignment_id: assignmentId,
        cpo_id: cpoId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        altitude: locationData.altitude,
        heading: locationData.heading,
        speed: locationData.speed,
        timestamp: new Date(locationData.timestamp).toISOString(),
      });

      if (error) throw error;

      // Also update the assignment's current location
      await supabase
        .from('protection_assignments')
        .update({
          current_location: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy,
            timestamp: new Date(locationData.timestamp).toISOString(),
          },
        })
        .eq('id', assignmentId);

      addBreadcrumb('Location updated', 'location', {
        assignmentId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });
    } catch (error) {
      console.error('[Location Service] Failed to update location in database:', error);
      throw error;
    }
  },

  /**
   * Get location history for an assignment
   */
  async getLocationHistory(assignmentId: string): Promise<unknown[]> {
    try {
      const { data, error } = await supabase
        .from('location_history')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Location Service] Failed to get location history:', error);
      throw error;
    }
  },

  /**
   * Request location permission
   */
  async requestPermission(): Promise<PermissionState> {
    if (!('permissions' in navigator)) {
      return 'granted'; // Assume granted if API not available
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state;
    } catch (error) {
      console.error('[Location Service] Failed to check permission:', error);
      return 'prompt';
    }
  },
};

export default locationService;
