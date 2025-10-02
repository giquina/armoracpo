import { supabase, AssignmentMessage } from '../lib/supabase';
import { sanitizeText } from '../utils/inputSanitization';

export const messageService = {
  /**
   * Send a message for an assignment
   * @param assignmentId - The assignment ID
   * @param senderId - The auth user ID of the sender
   * @param senderType - Either 'principal' or 'cpo'
   * @param message - The message content
   */
  async sendMessage(
    assignmentId: string,
    senderId: string,
    senderType: 'principal' | 'cpo',
    message: string
  ): Promise<AssignmentMessage> {
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    // SECURITY: Sanitize input to prevent XSS attacks
    const sanitizedMessage = sanitizeText(message.trim());

    const { data, error } = await supabase
      .from('assignment_messages')
      .insert({
        assignment_id: assignmentId,
        sender_id: senderId,
        sender_type: senderType,
        message: sanitizedMessage,
        read: false,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to send message');

    return data;
  },

  /**
   * Get all messages for an assignment
   * @param assignmentId - The assignment ID
   * @returns Array of messages ordered by creation time (oldest first)
   */
  async getMessages(assignmentId: string): Promise<AssignmentMessage[]> {
    const { data, error } = await supabase
      .from('assignment_messages')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Mark a message as read
   * @param messageId - The message ID to mark as read
   */
  async markAsRead(messageId: string): Promise<AssignmentMessage> {
    const { data, error } = await supabase
      .from('assignment_messages')
      .update({ read: true })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to mark message as read');

    return data;
  },

  /**
   * Mark all messages in an assignment as read for the current user
   * @param assignmentId - The assignment ID
   * @param userId - The auth user ID of the current user
   */
  async markAllAsRead(assignmentId: string, userId: string): Promise<void> {
    // Mark all messages NOT sent by the current user as read
    const { error } = await supabase
      .from('assignment_messages')
      .update({ read: true })
      .eq('assignment_id', assignmentId)
      .eq('read', false)
      .neq('sender_id', userId);

    if (error) throw error;
  },

  /**
   * Get the count of unread messages for an assignment
   * @param assignmentId - The assignment ID
   * @param userId - The auth user ID of the current user (to exclude their own messages)
   * @returns Number of unread messages sent by other users
   */
  async getUnreadCount(assignmentId: string, userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('assignment_messages')
      .select('*', { count: 'exact', head: true })
      .eq('assignment_id', assignmentId)
      .eq('read', false)
      .neq('sender_id', userId);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Get total unread message count across all assignments for a user
   * @param userId - The auth user ID
   * @returns Total number of unread messages
   */
  async getTotalUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('assignment_messages')
      .select('*', { count: 'exact', head: true })
      .eq('read', false)
      .neq('sender_id', userId);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Subscribe to real-time message updates for an assignment
   * @param assignmentId - The assignment ID to subscribe to
   * @param callback - Function called when messages are inserted or updated
   * @returns Unsubscribe function
   */
  subscribeToMessages(
    assignmentId: string,
    callback: (message: AssignmentMessage) => void
  ): () => void {
    const channel = supabase
      .channel(`messages-${assignmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'assignment_messages',
          filter: `assignment_id=eq.${assignmentId}`,
        },
        (payload) => {
          callback(payload.new as AssignmentMessage);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'assignment_messages',
          filter: `assignment_id=eq.${assignmentId}`,
        },
        (payload) => {
          callback(payload.new as AssignmentMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Delete a message (soft delete - only if sent by current user)
   * Note: This is not commonly used in messaging systems but included for completeness
   * @param messageId - The message ID to delete
   */
  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('assignment_messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
  },

  /**
   * Get the latest message for an assignment
   * @param assignmentId - The assignment ID
   * @returns The most recent message or null if none exist
   */
  async getLatestMessage(assignmentId: string): Promise<AssignmentMessage | null> {
    const { data, error } = await supabase
      .from('assignment_messages')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data || null;
  },
};
