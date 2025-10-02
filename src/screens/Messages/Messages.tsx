import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, ProtectionAssignment, AssignmentMessage } from '../../lib/supabase';
import { messageService } from '../../services/messageService';
import '../../styles/global.css';

interface Conversation {
  assignment: ProtectionAssignment;
  lastMessage?: AssignmentMessage;
  unreadCount: number;
}

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: cpoData } = await supabase
        .from('protection_officers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (cpoData) {
        // Get all assignments for this CPO
        const { data: assignments } = await supabase
          .from('protection_assignments')
          .select('*')
          .eq('cpo_id', cpoData.id)
          .order('scheduled_start_time', { ascending: false });

        if (assignments) {
          // Build conversations with message data
          const convos = await Promise.all(
            assignments.map(async (assignment) => {
              const lastMessage = await messageService.getLatestMessage(assignment.id);
              const unreadCount = await messageService.getUnreadCount(assignment.id, user.id);

              return {
                assignment,
                lastMessage: lastMessage || undefined,
                unreadCount,
              };
            })
          );

          // Sort by last message time
          convos.sort((a, b) => {
            const timeA = a.lastMessage?.created_at || a.assignment.scheduled_start_time;
            const timeB = b.lastMessage?.created_at || b.assignment.scheduled_start_time;
            return new Date(timeB).getTime() - new Date(timeA).getTime();
          });

          setConversations(convos);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();

    // Refresh conversations every 30 seconds
    const interval = setInterval(loadConversations, 30000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getAssignmentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      close_protection: 'Close Protection',
      event_security: 'Event Security',
      residential_security: 'Residential',
      executive_protection: 'Executive',
      transport_security: 'Transport',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="safe-top safe-bottom" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-secondary)', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: 'var(--spacing-lg)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-xs)' }}>Messages</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
          Communications with Principals
        </p>
      </div>

      <div className="container" style={{ paddingTop: 'var(--spacing-md)' }}>
        {conversations.length === 0 ? (
          // Empty State
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', marginTop: 'var(--spacing-xl)' }}>
            <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-md)' }}>💬</div>
            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>No Messages Yet</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>
              Once you accept an assignment, you'll be able to communicate with your principal here.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/jobs')}
            >
              Browse Available Assignments
            </button>
          </div>
        ) : (
          // Conversation List
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {conversations.map((conversation) => (
              <div
                key={conversation.assignment.id}
                onClick={() => navigate(`/messages/${conversation.assignment.id}`)}
                className="card"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderLeft: conversation.unreadCount > 0 ? '4px solid var(--color-accent)' : '4px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                  {/* Principal Photo */}
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--font-size-xl)',
                      flexShrink: 0,
                      backgroundImage: conversation.assignment.principal_photo_url ? `url(${conversation.assignment.principal_photo_url})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {!conversation.assignment.principal_photo_url && '👤'}
                  </div>

                  {/* Conversation Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-xs)' }}>
                      <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: '2px' }}>
                        {conversation.assignment.principal_name}
                      </h3>
                      {conversation.lastMessage && (
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                          {formatTime(conversation.lastMessage.created_at)}
                        </span>
                      )}
                    </div>

                    {/* Assignment Info */}
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                      <span className={`badge badge-${conversation.assignment.status === 'active' ? 'success' : 'warning'}`}>
                        {conversation.assignment.status.toUpperCase()}
                      </span>
                      <span className="badge" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>
                        {getAssignmentTypeLabel(conversation.assignment.assignment_type)}
                      </span>
                      <span className={`badge badge-threat-${conversation.assignment.threat_level}`}>
                        {conversation.assignment.threat_level.toUpperCase()}
                      </span>
                    </div>

                    {/* Last Message */}
                    {conversation.lastMessage && (
                      <p
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--color-text-secondary)',
                          marginBottom: 'var(--spacing-xs)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                        }}
                      >
                        {conversation.lastMessage.message}
                      </p>
                    )}

                    {/* Location */}
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      📍 {conversation.assignment.pickup_location}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {conversation.unreadCount > 0 && (
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-accent)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 700,
                        flexShrink: 0,
                        alignSelf: 'center',
                      }}
                    >
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
