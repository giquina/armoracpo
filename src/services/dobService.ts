import { supabase } from '../lib/supabase';
import { DOBEntry, DOBFilters, DOBEventType } from '../types';

/**
 * Daily Occurrence Book (DOB) Service
 *
 * Handles all DOB operations including:
 * - Creating manual and auto-generated entries
 * - Querying entries with filters
 * - Making entries immutable
 * - Real-time subscriptions
 * - PDF export
 * - Auto-logging of assignment events
 */
export const dobService = {
  /**
   * Create a new DOB entry
   * @param entry - DOB entry data
   * @param cpoId - CPO ID creating the entry
   * @returns Created DOB entry
   */
  async createDOBEntry(
    entry: Omit<DOBEntry, 'id' | 'createdAt' | 'updatedAt'>,
    cpoId: string
  ): Promise<DOBEntry> {
    try {
      const { data, error } = await supabase
        .from('daily_occurrence_book_entries')
        .insert({
          assignment_id: entry.assignmentId || null,
          assignment_reference: entry.assignmentReference || null,
          cpo_id: cpoId,
          entry_type: entry.entryType,
          event_type: entry.eventType,
          timestamp: entry.timestamp,
          gps_coordinates: entry.gpsCoordinates || null,
          description: entry.description,
          metadata: entry.metadata || null,
          is_immutable: entry.isImmutable || false,
          created_by: cpoId,
          last_modified_by: cpoId,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create DOB entry');

      return this.mapDatabaseToDOBEntry(data);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create DOB entry');
    }
  },

  /**
   * Get DOB entries with optional filters
   * @param cpoId - CPO ID
   * @param filters - Optional filters
   * @returns Array of DOB entries
   */
  async getDOBEntries(
    cpoId: string,
    filters?: DOBFilters
  ): Promise<DOBEntry[]> {
    try {
      let query = supabase
        .from('daily_occurrence_book_entries')
        .select('*')
        .eq('cpo_id', cpoId)
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filters?.assignmentId) {
        query = query.eq('assignment_id', filters.assignmentId);
      }

      if (filters?.dateRange) {
        if (filters.dateRange.start) {
          query = query.gte('timestamp', filters.dateRange.start);
        }
        if (filters.dateRange.end) {
          query = query.lte('timestamp', filters.dateRange.end);
        }
      }

      if (filters?.entryType) {
        query = query.eq('entry_type', filters.entryType);
      }

      if (filters?.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters?.searchQuery) {
        query = query.ilike('description', `%${filters.searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(this.mapDatabaseToDOBEntry);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch DOB entries');
    }
  },

  /**
   * Get a single DOB entry by ID
   * @param entryId - Entry ID
   * @param cpoId - CPO ID (for RLS validation)
   * @returns DOB entry
   */
  async getDOBEntry(entryId: string, cpoId: string): Promise<DOBEntry> {
    try {
      const { data, error } = await supabase
        .from('daily_occurrence_book_entries')
        .select('*')
        .eq('id', entryId)
        .eq('cpo_id', cpoId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('DOB entry not found');

      return this.mapDatabaseToDOBEntry(data);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch DOB entry');
    }
  },

  /**
   * Make a DOB entry immutable (finalize/submit)
   * Once immutable, the entry cannot be edited
   * @param entryId - Entry ID
   * @param cpoId - CPO ID
   */
  async makeEntryImmutable(entryId: string, cpoId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('daily_occurrence_book_entries')
        .update({
          is_immutable: true,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', entryId)
        .eq('cpo_id', cpoId)
        .eq('is_immutable', false); // Only update if not already immutable

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to make entry immutable');
    }
  },

  /**
   * Subscribe to DOB updates for a CPO
   * @param cpoId - CPO ID
   * @param callback - Callback function for updates
   * @returns Unsubscribe function
   */
  subscribeToDOBUpdates(
    cpoId: string,
    callback: (entry: DOBEntry) => void
  ): () => void {
    const channel = supabase
      .channel('dob-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_occurrence_book_entries',
          filter: `cpo_id=eq.${cpoId}`,
        },
        (payload) => {
          if (payload.new) {
            callback(this.mapDatabaseToDOBEntry(payload.new as any));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Export DOB entries to PDF
   * @param cpoId - CPO ID
   * @param dateRange - Date range for export
   * @returns PDF blob
   */
  async exportDOBToPDF(
    cpoId: string,
    dateRange: { start: string; end: string }
  ): Promise<Blob> {
    try {
      // Fetch entries for the date range
      const entries = await this.getDOBEntries(cpoId, { dateRange });

      // TODO: Implement PDF generation
      // This would typically use a library like jsPDF or call a backend PDF service
      // For now, returning a placeholder
      throw new Error('PDF export not yet implemented');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to export DOB to PDF');
    }
  },

  // ============================================================================
  // AUTO-LOGGING METHODS
  // ============================================================================

  /**
   * Auto-log assignment start
   * @param assignmentId - Assignment ID
   * @param cpoId - CPO ID
   * @param assignmentReference - Assignment reference
   * @param location - GPS coordinates
   * @param description - Optional description override
   */
  async logAssignmentStart(
    assignmentId: string,
    cpoId: string,
    assignmentReference: string,
    location?: { latitude: number; longitude: number; accuracy: number },
    description?: string
  ): Promise<DOBEntry> {
    return this.createDOBEntry(
      {
        assignmentId,
        assignmentReference,
        cpoId,
        entryType: 'auto',
        eventType: 'assignment_start',
        timestamp: new Date().toISOString(),
        gpsCoordinates: location,
        description:
          description || `Protection detail commenced - ${assignmentReference}`,
        metadata: {
          autoGenerated: true,
          generatedAt: new Date().toISOString(),
        },
        isImmutable: true, // Auto-entries are immediately immutable
      },
      cpoId
    );
  },

  /**
   * Auto-log assignment end
   */
  async logAssignmentEnd(
    assignmentId: string,
    cpoId: string,
    assignmentReference: string,
    location?: { latitude: number; longitude: number; accuracy: number },
    description?: string
  ): Promise<DOBEntry> {
    return this.createDOBEntry(
      {
        assignmentId,
        assignmentReference,
        cpoId,
        entryType: 'auto',
        eventType: 'assignment_end',
        timestamp: new Date().toISOString(),
        gpsCoordinates: location,
        description:
          description || `Protection detail completed - ${assignmentReference}`,
        metadata: {
          autoGenerated: true,
          generatedAt: new Date().toISOString(),
        },
        isImmutable: true,
      },
      cpoId
    );
  },

  /**
   * Auto-log location change
   */
  async logLocationChange(
    assignmentId: string,
    cpoId: string,
    assignmentReference: string,
    location: { latitude: number; longitude: number; accuracy: number },
    description?: string
  ): Promise<DOBEntry> {
    return this.createDOBEntry(
      {
        assignmentId,
        assignmentReference,
        cpoId,
        entryType: 'auto',
        eventType: 'location_change',
        timestamp: new Date().toISOString(),
        gpsCoordinates: location,
        description:
          description || `Location change detected - ${assignmentReference}`,
        metadata: {
          autoGenerated: true,
          generatedAt: new Date().toISOString(),
        },
        isImmutable: true,
      },
      cpoId
    );
  },

  /**
   * Auto-log principal pickup
   */
  async logPrincipalPickup(
    assignmentId: string,
    cpoId: string,
    assignmentReference: string,
    location?: { latitude: number; longitude: number; accuracy: number },
    description?: string
  ): Promise<DOBEntry> {
    return this.createDOBEntry(
      {
        assignmentId,
        assignmentReference,
        cpoId,
        entryType: 'auto',
        eventType: 'principal_pickup',
        timestamp: new Date().toISOString(),
        gpsCoordinates: location,
        description:
          description ||
          `Principal collected from location - ${assignmentReference}`,
        metadata: {
          autoGenerated: true,
          generatedAt: new Date().toISOString(),
        },
        isImmutable: true,
      },
      cpoId
    );
  },

  /**
   * Auto-log principal dropoff
   */
  async logPrincipalDropoff(
    assignmentId: string,
    cpoId: string,
    assignmentReference: string,
    location?: { latitude: number; longitude: number; accuracy: number },
    description?: string
  ): Promise<DOBEntry> {
    return this.createDOBEntry(
      {
        assignmentId,
        assignmentReference,
        cpoId,
        entryType: 'auto',
        eventType: 'principal_dropoff',
        timestamp: new Date().toISOString(),
        gpsCoordinates: location,
        description:
          description ||
          `Principal delivered to secure destination - ${assignmentReference}`,
        metadata: {
          autoGenerated: true,
          generatedAt: new Date().toISOString(),
        },
        isImmutable: true,
      },
      cpoId
    );
  },

  /**
   * Auto-log route deviation
   */
  async logRouteDeviation(
    assignmentId: string,
    cpoId: string,
    assignmentReference: string,
    location: { latitude: number; longitude: number; accuracy: number },
    reason: string
  ): Promise<DOBEntry> {
    return this.createDOBEntry(
      {
        assignmentId,
        assignmentReference,
        cpoId,
        entryType: 'auto',
        eventType: 'route_deviation',
        timestamp: new Date().toISOString(),
        gpsCoordinates: location,
        description: `Route deviation: ${reason}`,
        metadata: {
          autoGenerated: true,
          generatedAt: new Date().toISOString(),
          reason,
        },
        isImmutable: true,
      },
      cpoId
    );
  },

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Map database record to DOBEntry type
   */
  mapDatabaseToDOBEntry(data: any): DOBEntry {
    return {
      id: data.id,
      assignmentId: data.assignment_id || undefined,
      assignmentReference: data.assignment_reference || undefined,
      cpoId: data.cpo_id,
      entryType: data.entry_type,
      eventType: data.event_type,
      timestamp: data.timestamp,
      gpsCoordinates: data.gps_coordinates || undefined,
      description: data.description,
      metadata: data.metadata || undefined,
      isImmutable: data.is_immutable,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  /**
   * Get current GPS coordinates (browser geolocation)
   * @returns GPS coordinates or undefined
   */
  async getCurrentLocation(): Promise<
    { latitude: number; longitude: number; accuracy: number } | undefined
  > {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error('[DOB Service] Geolocation error:', error);
          resolve(undefined);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  },

  /**
   * Get DOB statistics for a CPO
   * @param cpoId - CPO ID
   * @param days - Number of days to look back
   * @returns Statistics object
   */
  async getDOBStatistics(
    cpoId: string,
    days: number = 30
  ): Promise<{
    totalEntries: number;
    autoEntries: number;
    manualEntries: number;
    immutableEntries: number;
    recentEntries: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [allEntries, recentEntries] = await Promise.all([
        this.getDOBEntries(cpoId),
        this.getDOBEntries(cpoId, {
          dateRange: {
            start: startDate.toISOString(),
            end: new Date().toISOString(),
          },
        }),
      ]);

      return {
        totalEntries: allEntries.length,
        autoEntries: allEntries.filter((e) => e.entryType === 'auto').length,
        manualEntries: allEntries.filter((e) => e.entryType === 'manual')
          .length,
        immutableEntries: allEntries.filter((e) => e.isImmutable).length,
        recentEntries: recentEntries.length,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get DOB statistics');
    }
  },
};
