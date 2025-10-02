import React from 'react';
import { ProtectionAssignment, AssignmentMessage } from '../../lib/supabase';
import { StatusBadge } from '../ui';
import './ChatListItem.css';

interface ChatListItemProps {
  assignment: ProtectionAssignment;
  lastMessage?: AssignmentMessage;
  unreadCount: number;
  onClick: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  assignment,
  lastMessage,
  unreadCount,
  onClick
}) => {
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

  return (
    <div
      className={`chat-list-item ${unreadCount > 0 ? 'chat-list-item--unread' : ''}`}
      onClick={onClick}
    >
      <div className="chat-list-item__avatar">
        {assignment.principal_photo_url ? (
          <img src={assignment.principal_photo_url} alt={assignment.principal_name} />
        ) : (
          <span className="chat-list-item__avatar-placeholder">
            {assignment.principal_name.charAt(0)}
          </span>
        )}
      </div>

      <div className="chat-list-item__content">
        <div className="chat-list-item__header">
          <h3 className="chat-list-item__name">{assignment.principal_name}</h3>
          {lastMessage && (
            <span className="chat-list-item__time">
              {formatTime(lastMessage.created_at)}
            </span>
          )}
        </div>

        <div className="chat-list-item__badges">
          <StatusBadge
            status={assignment.status}
            size="sm"
          />
          <span className="badge badge-navy">
            {getAssignmentTypeLabel(assignment.assignment_type)}
          </span>
          <span className={`badge badge-threat-${assignment.threat_level}`}>
            {assignment.threat_level.toUpperCase()}
          </span>
        </div>

        {lastMessage && (
          <p className={`chat-list-item__message ${unreadCount > 0 ? 'chat-list-item__message--unread' : ''}`}>
            {lastMessage.message}
          </p>
        )}

        <p className="chat-list-item__location">
          📍 {assignment.pickup_location}
        </p>
      </div>

      {unreadCount > 0 && (
        <div className="chat-list-item__badge">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </div>
  );
};

export default ChatListItem;
