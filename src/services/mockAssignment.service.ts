/**
 * Mock Assignment Service
 * Replaces Supabase assignment operations with mock data
 */

import { ProtectionAssignment } from '../lib/supabase';
import { mockAssignments } from './mockData';

class MockAssignmentService {
  private assignments: ProtectionAssignment[] = [...mockAssignments];

  /**
   * Get all assignments for a CPO
   */
  async getAssignments(cpoId: string): Promise<ProtectionAssignment[]> {
    console.log('[MOCK ASSIGNMENT] Get assignments for:', cpoId);
    return this.assignments.filter((a) => a.cpo_id === cpoId);
  }

  /**
   * Get pending (available) assignments
   */
  async getPendingAssignments(): Promise<ProtectionAssignment[]> {
    console.log('[MOCK ASSIGNMENT] Get pending assignments');
    return this.assignments.filter((a) => a.status === 'pending');
  }

  /**
   * Get assignment by ID
   */
  async getAssignment(assignmentId: string): Promise<ProtectionAssignment | null> {
    console.log('[MOCK ASSIGNMENT] Get assignment:', assignmentId);
    return this.assignments.find((a) => a.id === assignmentId) || null;
  }

  /**
   * Accept an assignment
   */
  async acceptAssignment(assignmentId: string, cpoId: string): Promise<ProtectionAssignment> {
    console.log('[MOCK ASSIGNMENT] Accept assignment:', assignmentId, 'by', cpoId);

    const assignment = this.assignments.find((a) => a.id === assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    if (assignment.status !== 'pending') {
      throw new Error('Assignment is no longer available');
    }

    assignment.status = 'assigned';
    assignment.cpo_id = cpoId;
    assignment.updated_at = new Date().toISOString();

    return { ...assignment };
  }

  /**
   * Start an assignment (go en route)
   */
  async startAssignment(assignmentId: string): Promise<ProtectionAssignment> {
    console.log('[MOCK ASSIGNMENT] Start assignment:', assignmentId);

    const assignment = this.assignments.find((a) => a.id === assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    assignment.status = 'en_route';
    assignment.updated_at = new Date().toISOString();

    return { ...assignment };
  }

  /**
   * Activate an assignment (begin protection)
   */
  async activateAssignment(assignmentId: string): Promise<ProtectionAssignment> {
    console.log('[MOCK ASSIGNMENT] Activate assignment:', assignmentId);

    const assignment = this.assignments.find((a) => a.id === assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    assignment.status = 'active';
    assignment.actual_start = new Date().toISOString();
    assignment.updated_at = new Date().toISOString();

    return { ...assignment };
  }

  /**
   * Complete an assignment
   */
  async completeAssignment(assignmentId: string): Promise<ProtectionAssignment> {
    console.log('[MOCK ASSIGNMENT] Complete assignment:', assignmentId);

    const assignment = this.assignments.find((a) => a.id === assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    assignment.status = 'completed';
    assignment.actual_end = new Date().toISOString();
    assignment.updated_at = new Date().toISOString();

    // Calculate final cost
    if (assignment.actual_start && assignment.actual_end) {
      const hours = (new Date(assignment.actual_end).getTime() - new Date(assignment.actual_start).getTime()) / (1000 * 60 * 60);
      assignment.final_cost = Math.round(hours * assignment.hourly_rate * 100) / 100;
    }

    return { ...assignment };
  }

  /**
   * Cancel an assignment
   */
  async cancelAssignment(assignmentId: string, reason?: string): Promise<ProtectionAssignment> {
    console.log('[MOCK ASSIGNMENT] Cancel assignment:', assignmentId, 'reason:', reason);

    const assignment = this.assignments.find((a) => a.id === assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    assignment.status = 'cancelled';
    assignment.updated_at = new Date().toISOString();

    return { ...assignment };
  }

  /**
   * Subscribe to assignment updates (mock - returns unsubscribe function)
   */
  subscribeToAssignments(cpoId: string, callback: (assignment: ProtectionAssignment) => void) {
    console.log('[MOCK ASSIGNMENT] Subscribe to assignments for:', cpoId);

    // Mock subscription - doesn't actually do anything
    return () => {
      console.log('[MOCK ASSIGNMENT] Unsubscribed from assignments');
    };
  }

  /**
   * Subscribe to specific assignment (mock)
   */
  subscribeToAssignment(assignmentId: string, callback: (assignment: ProtectionAssignment) => void) {
    console.log('[MOCK ASSIGNMENT] Subscribe to assignment:', assignmentId);

    // Mock subscription
    return () => {
      console.log('[MOCK ASSIGNMENT] Unsubscribed from assignment');
    };
  }

  /**
   * Get assignments by status
   */
  async getAssignmentsByStatus(cpoId: string, status: string): Promise<ProtectionAssignment[]> {
    console.log('[MOCK ASSIGNMENT] Get assignments by status:', status, 'for', cpoId);
    return this.assignments.filter((a) => a.cpo_id === cpoId && a.status === status);
  }

  /**
   * Get active assignment
   */
  async getActiveAssignment(cpoId: string): Promise<ProtectionAssignment | null> {
    console.log('[MOCK ASSIGNMENT] Get active assignment for:', cpoId);
    return this.assignments.find((a) => a.cpo_id === cpoId && (a.status === 'active' || a.status === 'en_route')) || null;
  }
}

export const mockAssignmentService = new MockAssignmentService();
export default mockAssignmentService;
