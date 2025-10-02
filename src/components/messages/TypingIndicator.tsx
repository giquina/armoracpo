import React from 'react';
import './TypingIndicator.css';

const TypingIndicator: React.FC = () => {
  return (
    <div className="typing-indicator">
      <div className="typing-indicator__bubble">
        <div className="typing-indicator__dots">
          <span className="typing-indicator__dot"></span>
          <span className="typing-indicator__dot"></span>
          <span className="typing-indicator__dot"></span>
        </div>
      </div>
      <span className="typing-indicator__text">Principal is typing...</span>
    </div>
  );
};

export default TypingIndicator;
