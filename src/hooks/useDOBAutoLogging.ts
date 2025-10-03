import { useEffect, useRef, useCallback } from 'react';
import { dobService } from '../services/dobService';
import { assignmentService } from '../services/assignmentService';
import { ProtectionAssignment } from '../lib/supabase';

/**
 * Custom hook for auto-logging DOB entries based on assignment events
 *
 * This hook subscribes to assignment updates and automatically creates
 * DOB entries for key operational events.
 *
 * @param cpoId - CPO ID
 * @param enabled - Whether auto-logging is enabled (default: true)
 */
export const useDOBAutoLogging = (cpoId: string | null, enabled: boolean = true) => {
  const previousAssignmentRef = useRef<ProtectionAssignment | null>(null);
  const lastLocationRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const locationThresholdMeters = 500; // Minimum distance to trigger location_change event

  // Calculate distance between two GPS coordinates (Haversine formula)
  const calculateDistance = useCallback(
    (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ): number => {
      const R = 6371e3; // Earth's radius in meters
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // Distance in meters
    },
    []
  );

  // Get assignment reference string
  const getAssignmentReference = useCallback((assignment: ProtectionAssignment): string => {
    // Format: PA-YYYYMMDD-XXX (e.g., PA-20251003-001)
    const date = new Date(assignment.created_at);
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const idShort = assignment.id.slice(0, 3).toUpperCase();
    return `PA-${dateStr}-${idShort}`;
  }, []);

  // Handle assignment status changes
  const handleAssignmentUpdate = useCallback(
    async (assignment: ProtectionAssignment) => {
      if (!cpoId || !enabled) return;

      const previousAssignment = previousAssignmentRef.current;
      const previousStatus = previousAssignment?.status;
      const currentStatus = assignment.status;

      // Skip if status hasn't changed
      if (previousStatus === currentStatus) {
        // But check for location changes if assignment is active
        if (currentStatus === 'active' && assignment.cpo_id === cpoId) {
          await checkLocationChange(assignment);
        }
        return;
      }

      // Get current GPS location
      const location = await dobService.getCurrentLocation();
      const assignmentRef = getAssignmentReference(assignment);

      try {
        // Log assignment start (when CPO accepts)
        if (previousStatus === 'pending' && currentStatus === 'assigned') {
          await dobService.logAssignmentStart(
            assignment.id,
            cpoId,
            assignmentRef,
            location || undefined
          );
          console.log('[DOB Auto-logging] Assignment start logged');
        }

        // Log principal pickup (when CPO arrives and starts protection)
        if (previousStatus === 'assigned' && currentStatus === 'active') {
          await dobService.logPrincipalPickup(
            assignment.id,
            cpoId,
            assignmentRef,
            location || undefined
          );
          console.log('[DOB Auto-logging] Principal pickup logged');
        }

        // Log principal dropoff and assignment end (when protection completes)
        if (
          (previousStatus === 'active' || previousStatus === 'en_route') &&
          currentStatus === 'completed'
        ) {
          // Log dropoff
          await dobService.logPrincipalDropoff(
            assignment.id,
            cpoId,
            assignmentRef,
            location || undefined
          );

          // Log assignment end
          await dobService.logAssignmentEnd(
            assignment.id,
            cpoId,
            assignmentRef,
            location || undefined
          );
          console.log('[DOB Auto-logging] Principal dropoff and assignment end logged');
        }

        // Update previous assignment
        previousAssignmentRef.current = assignment;
      } catch (error) {
        console.error('[DOB Auto-logging] Error logging event:', error);
      }
    },
    [cpoId, enabled, getAssignmentReference]
  );

  // Check for significant location changes during active assignment
  const checkLocationChange = useCallback(
    async (assignment: ProtectionAssignment) => {
      if (!cpoId || !enabled) return;

      const currentLocation = await dobService.getCurrentLocation();
      if (!currentLocation) return;

      const lastLocation = lastLocationRef.current;

      // If we have a previous location, check distance
      if (lastLocation) {
        const distance = calculateDistance(
          lastLocation.latitude,
          lastLocation.longitude,
          currentLocation.latitude,
          currentLocation.longitude
        );

        // If distance exceeds threshold, log location change
        if (distance >= locationThresholdMeters) {
          try {
            const assignmentRef = getAssignmentReference(assignment);
            await dobService.logLocationChange(
              assignment.id,
              cpoId,
              assignmentRef,
              currentLocation,
              `Significant location change detected (${Math.round(distance)}m)`
            );
            console.log(
              '[DOB Auto-logging] Location change logged:',
              Math.round(distance),
              'meters'
            );

            // Update last location
            lastLocationRef.current = currentLocation;
          } catch (error) {
            console.error('[DOB Auto-logging] Error logging location change:', error);
          }
        }
      } else {
        // First location reading
        lastLocationRef.current = currentLocation;
      }
    },
    [cpoId, enabled, calculateDistance, getAssignmentReference]
  );

  // Subscribe to assignment updates
  useEffect(() => {
    if (!cpoId || !enabled) return;

    console.log('[DOB Auto-logging] Subscribing to assignment updates for CPO:', cpoId);

    const unsubscribe = assignmentService.subscribeToAssignments(
      cpoId,
      handleAssignmentUpdate
    );

    // Cleanup subscription on unmount
    return () => {
      console.log('[DOB Auto-logging] Unsubscribing from assignment updates');
      unsubscribe();
    };
  }, [cpoId, enabled, handleAssignmentUpdate]);

  // Monitor location during active assignments (every 30 seconds)
  useEffect(() => {
    if (!cpoId || !enabled) return;

    const locationCheckInterval = setInterval(async () => {
      try {
        // Check if there's an active assignment
        const activeAssignment = await assignmentService.getActiveAssignment(cpoId);
        if (activeAssignment && activeAssignment.status === 'active') {
          await checkLocationChange(activeAssignment);
        }
      } catch (error) {
        console.error('[DOB Auto-logging] Error checking location:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(locationCheckInterval);
    };
  }, [cpoId, enabled, checkLocationChange]);

  return {
    // Expose manual logging methods if needed
    logManualEntry: async (
      assignmentId: string,
      description: string,
      eventType: 'communication' | 'route_deviation' | 'incident' | 'other' = 'other'
    ) => {
      if (!cpoId) return;

      const location = await dobService.getCurrentLocation();
      const assignment = await assignmentService.getAssignmentById(assignmentId);
      const assignmentRef = getAssignmentReference(assignment);

      if (eventType === 'route_deviation') {
        return dobService.logRouteDeviation(
          assignmentId,
          cpoId,
          assignmentRef,
          location || { latitude: 0, longitude: 0, accuracy: 0 },
          description
        );
      }

      // For other types, use generic create method
      return dobService.createDOBEntry(
        {
          assignmentId,
          assignmentReference: assignmentRef,
          cpoId,
          entryType: 'auto',
          eventType,
          timestamp: new Date().toISOString(),
          gpsCoordinates: location,
          description,
          metadata: {
            autoGenerated: true,
            manuallyTriggered: true,
          },
          isImmutable: true,
        },
        cpoId
      );
    },
  };
};
