import React from 'react';
import { AssignmentMessage } from '../../lib/supabase';
import './ChatBubble.css';

interface ChatBubbleProps {
  message: AssignmentMessage;
  isSent: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isSent }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-bubble-wrapper ${isSent ? 'chat-bubble-wrapper--sent' : 'chat-bubble-wrapper--received'}`}>
      <div className={`chat-bubble ${isSent ? 'chat-bubble--sent' : 'chat-bubble--received'}`}>
        <p className="chat-bubble__text">{message.message}</p>
        <div className="chat-bubble__footer">
          <span className="chat-bubble__time">{formatTime(message.created_at)}</span>
          {isSent && (
            <span className="chat-bubble__status">
              {message.read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
