import React from 'react';
import { FiSend } from 'react-icons/fi';
import { IconWrapper } from '../../utils/IconWrapper';
import './QuickReplyTemplates.css';

interface QuickReplyTemplatesProps {
  onSelect: (message: string) => void;
}

const QUICK_REPLIES = [
  { id: 1, text: 'On my way', icon: '🚗' },
  { id: 2, text: 'Arrived at location', icon: '📍' },
  { id: 3, text: 'Assignment complete', icon: '✅' },
  { id: 4, text: 'Will be there in 5 minutes', icon: '⏱️' },
  { id: 5, text: 'Running slightly late', icon: '⏰' },
  { id: 6, text: 'Acknowledged', icon: '👍' },
];

const QuickReplyTemplates: React.FC<QuickReplyTemplatesProps> = ({ onSelect }) => {
  return (
    <div className="quick-reply-templates">
      <div className="quick-reply-templates__header">
        <span className="quick-reply-templates__title">Quick Replies</span>
      </div>
      <div className="quick-reply-templates__list">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply.id}
            className="quick-reply-templates__button"
            onClick={() => onSelect(reply.text)}
          >
            <span className="quick-reply-templates__icon">{reply.icon}</span>
            <span className="quick-reply-templates__text">{reply.text}</span>
            <IconWrapper icon={FiSend} size={14} className="quick-reply-templates__send" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickReplyTemplates;
