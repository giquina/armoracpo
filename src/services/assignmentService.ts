import { supabase, ProtectionAssignment } from '../lib/supabase';

export const assignmentService = {
  /**
   * Get all available (unassigned) assignments
   */
  async getAvailableAssignments(assignmentType?: string) {
    let query = supabase
      .from('protection_assignments')
      .select('*')
      .eq('status', 'pending')
      .is('cpo_id', null)
      .order('scheduled_start_time', { ascending: true });

    if (assignmentType && assignmentType !== 'all') {
      query = query.eq('assignment_type', assignmentType);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  },

  /**
   * Get active assignment for a CPO
   */
  async getActiveAssignment(cpoId: string): Promise<ProtectionAssignment | null> {
    const { data, error } = await supabase
      .from('protection_assignments')
      .select('*')
      .eq('cpo_id', cpoId)
      .in('status', ['assigned', 'en_route', 'active'])
      .order('scheduled_start_time', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data || null;
  },

  /**
   * Get assignment history for a CPO
   */
  async getAssignmentHistory(cpoId: string) {
    const { data, error } = await supabase
      .from('protection_assignments')
      .select('*')
      .eq('cpo_id', cpoId)
      .eq('status', 'completed')
      .order('actual_end_time', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Accept an assignment
   */
  async acceptAssignment(assignmentId: string, cpoId: string) {
    const { data, error } = await supabase
      .from('protection_assignments')
      .update({
        cpo_id: cpoId,
        status: 'assigned',
      })
      .eq('id', assignmentId)
      .eq('status', 'pending') // Ensure it's still available
      .is('cpo_id', null) // Ensure it's not already assigned
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Assignment is no longer available');

    return data;
  },

  /**
   * Update assignment status
   */
  async updateAssignmentStatus(
    assignmentId: string,
    status: 'en_route' | 'active' | 'completed' | 'cancelled'
  ) {
    const updates: any = { status };

    // Add timestamps based on status
    if (status === 'active') {
      updates.actual_start_time = new Date().toISOString();
    } else if (status === 'completed') {
      updates.actual_end_time = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('protection_assignments')
      .update(updates)
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Start assignment (CPO has arrived and is beginning protection)
   */
  async startAssignment(assignmentId: string) {
    return this.updateAssignmentStatus(assignmentId, 'active');
  },

  /**
   * Complete assignment
   */
  async completeAssignment(assignmentId: string) {
    return this.updateAssignmentStatus(assignmentId, 'completed');
  },

  /**
   * Cancel assignment
   */
  async cancelAssignment(assignmentId: string) {
    return this.updateAssignmentStatus(assignmentId, 'cancelled');
  },

  /**
   * Get assignment by ID
   */
  async getAssignmentById(assignmentId: string): Promise<ProtectionAssignment> {
    const { data, error } = await supabase
      .from('protection_assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Assignment not found');

    return data;
  },

  /**
   * Get assignments count for a CPO
   */
  async getAssignmentStats(cpoId: string) {
    const { count: totalCount, error: totalError } = await supabase
      .from('protection_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('cpo_id', cpoId);

    const { count: completedCount, error: completedError } = await supabase
      .from('protection_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('cpo_id', cpoId)
      .eq('status', 'completed');

    if (totalError || completedError) {
      throw totalError || completedError;
    }

    return {
      total: totalCount || 0,
      completed: completedCount || 0,
    };
  },

  /**
   * Subscribe to assignment updates
   */
  subscribeToAssignments(cpoId: string, callback: (assignment: ProtectionAssignment) => void) {
    const channel = supabase
      .channel('assignment-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'protection_assignments',
          filter: `cpo_id=eq.${cpoId}`,
        },
        (payload) => {
          callback(payload.new as ProtectionAssignment);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
