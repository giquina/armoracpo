import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, ProtectionAssignment, AssignmentMessage } from '../../lib/supabase';
import { messageService } from '../../services/messageService';
import '../../styles/global.css';

const MessageChat: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<AssignmentMessage[]>([]);
  const [assignment, setAssignment] = useState<ProtectionAssignment | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const loadChatData = useCallback(async () => {
    try {
      if (!assignmentId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Load assignment details
      const { data: assignmentData } = await supabase
        .from('protection_assignments')
        .select('*')
        .eq('id', assignmentId)
        .single();

      if (assignmentData) setAssignment(assignmentData);

      // Load messages
      const msgs = await messageService.getMessages(assignmentId);
      setMessages(msgs);

      // Mark messages as read
      await messageService.markAllAsRead(assignmentId, user.id);
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    loadChatData();
  }, [loadChatData]);

  useEffect(() => {
    if (!assignmentId || !userId) return;

    let mounted = true;

    // Mark messages as read with proper error handling
    const markRead = async () => {
      try {
        await messageService.markAllAsRead(assignmentId, userId);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markRead();

    // Subscribe to new messages
    const unsubscribe = messageService.subscribeToMessages(assignmentId, (message) => {
      if (mounted) {
        setMessages((prev) => [...prev, message]);
        // Mark new messages as read with error handling
        messageService.markAllAsRead(assignmentId, userId).catch(error => {
          console.error('Error marking new message as read:', error);
        });
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [assignmentId, userId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !assignmentId || !userId || sending) return;

    setSending(true);
    try {
      await messageService.sendMessage(assignmentId, userId, 'cpo', newMessage.trim());
      setNewMessage('');
    } catch (error: any) {
      alert(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="safe-top safe-bottom" style={{ minHeight: '100vh', padding: 'var(--spacing-lg)' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/messages')}>
          ← Back to Messages
        </button>
        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
          <h2>Assignment Not Found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="safe-top safe-bottom" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: 'var(--spacing-md)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
          <button
            onClick={() => navigate('/messages')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: 'var(--font-size-xl)',
              cursor: 'pointer',
              padding: 'var(--spacing-xs)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ←
          </button>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: assignment.principal_photo_url ? `url(${assignment.principal_photo_url})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!assignment.principal_photo_url && '👤'}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '2px' }}>
              {assignment.principal_name}
            </h2>
            <p style={{ fontSize: 'var(--font-size-xs)', opacity: 0.9 }}>
              {assignment.assignment_type.replace('_', ' ').toUpperCase()} • {assignment.status.toUpperCase()}
            </p>
          </div>
        </div>
        <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.9 }}>
          📍 {assignment.pickup_location}
        </div>
      </div>

      {/* Messages Container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--spacing-md)',
          backgroundColor: 'var(--color-bg-secondary)',
          paddingBottom: 'calc(60px + var(--spacing-md))', // Space for input + bottom nav
        }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>💬</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {messages.map((message) => {
              const isOwnMessage = message.sender_id === userId;
              return (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '75%',
                      backgroundColor: isOwnMessage ? 'var(--color-primary)' : 'var(--color-bg-primary)',
                      color: isOwnMessage ? 'white' : 'var(--color-text-primary)',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      borderRadius: 'var(--radius-lg)',
                      borderBottomRightRadius: isOwnMessage ? '4px' : 'var(--radius-lg)',
                      borderBottomLeftRadius: isOwnMessage ? 'var(--radius-lg)' : '4px',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <p style={{ marginBottom: 'var(--spacing-xs)', wordWrap: 'break-word' }}>
                      {message.message}
                    </p>
                    <div
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        opacity: 0.7,
                        textAlign: 'right',
                      }}
                    >
                      {formatMessageTime(message.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input - Fixed at bottom */}
      <div
        style={{
          position: 'fixed',
          bottom: 'max(var(--safe-area-bottom), 60px)', // Above bottom nav
          left: 0,
          right: 0,
          backgroundColor: 'var(--color-bg-primary)',
          borderTop: '1px solid var(--color-border-light)',
          padding: 'var(--spacing-md)',
          zIndex: 'calc(var(--z-nav) - 1)',
        }}
      >
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input"
            style={{
              flex: 1,
              padding: 'var(--spacing-sm) var(--spacing-md)',
              fontSize: 'var(--font-size-md)',
            }}
            disabled={sending}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              minWidth: '60px',
              padding: 'var(--spacing-sm) var(--spacing-md)',
            }}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? '...' : '📤'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageChat;
