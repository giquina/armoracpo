/**
 * Mock Message Service
 * Replaces Supabase message operations with mock data
 */

import { AssignmentMessage } from '../lib/supabase';
import { mockMessages } from './mockData';

class MockMessageService {
  private messages: AssignmentMessage[] = [...mockMessages];

  /**
   * Get messages for an assignment
   */
  async getMessages(assignmentId: string): Promise<AssignmentMessage[]> {
    console.log('[MOCK MESSAGE] Get messages for assignment:', assignmentId);
    return this.messages.filter((m) => m.assignment_id === assignmentId);
  }

  /**
   * Send a message
   */
  async sendMessage(
    assignmentId: string,
    senderId: string,
    senderType: 'cpo' | 'client',
    messageText: string
  ): Promise<AssignmentMessage> {
    console.log('[MOCK MESSAGE] Send message:', messageText);

    const newMessage: AssignmentMessage = {
      id: `message-${Date.now()}`,
      assignment_id: assignmentId,
      sender_id: senderId,
      sender_type: senderType,
      message_text: messageText,
      read_at: null,
      created_at: new Date().toISOString(),
    };

    this.messages.push(newMessage);
    return newMessage;
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    console.log('[MOCK MESSAGE] Mark as read:', messageId);

    const message = this.messages.find((m) => m.id === messageId);
    if (message) {
      message.read_at = new Date().toISOString();
    }
  }

  /**
   * Get latest message for assignment
   */
  async getLatestMessage(assignmentId: string): Promise<AssignmentMessage | null> {
    console.log('[MOCK MESSAGE] Get latest message for:', assignmentId);

    const assignmentMessages = this.messages
      .filter((m) => m.assignment_id === assignmentId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return assignmentMessages[0] || null;
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(assignmentId: string, userId: string): Promise<number> {
    console.log('[MOCK MESSAGE] Get unread count for:', assignmentId, userId);

    return this.messages.filter(
      (m) => m.assignment_id === assignmentId && m.sender_id !== userId && !m.read_at
    ).length;
  }

  /**
   * Subscribe to messages (mock)
   */
  subscribeToMessages(assignmentId: string, callback: (message: AssignmentMessage) => void) {
    console.log('[MOCK MESSAGE] Subscribe to messages for:', assignmentId);

    // Mock subscription
    return () => {
      console.log('[MOCK MESSAGE] Unsubscribed from messages');
    };
  }

  /**
   * Subscribe to new messages (mock)
   */
  subscribeToNewMessages(assignmentId: string, callback: (message: AssignmentMessage) => void) {
    console.log('[MOCK MESSAGE] Subscribe to new messages for:', assignmentId);

    // Mock subscription
    return () => {
      console.log('[MOCK MESSAGE] Unsubscribed from new messages');
    };
  }
}

export const mockMessageService = new MockMessageService();
export default mockMessageService;
