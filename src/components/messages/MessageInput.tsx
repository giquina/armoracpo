import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiPaperclip, FiImage } from 'react-icons/fi';
import './MessageInput.css';

interface MessageInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  placeholder = 'Type a message...',
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const charCount = message.length;
  const maxChars = 500;
  const showCharCount = charCount > maxChars * 0.8;

  return (
    <div className="message-input">
      <form className="message-input__form" onSubmit={handleSubmit}>
        <div className="message-input__actions">
          <button
            type="button"
            className="message-input__action-button"
            aria-label="Attach file"
            disabled={disabled}
          >
            <FiPaperclip size={20} />
          </button>
          <button
            type="button"
            className="message-input__action-button"
            aria-label="Attach image"
            disabled={disabled}
          >
            <FiImage size={20} />
          </button>
        </div>

        <div className="message-input__field-wrapper">
          <textarea
            ref={textareaRef}
            className="message-input__field"
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            maxLength={maxChars}
          />
          {showCharCount && (
            <span className={`message-input__char-count ${charCount >= maxChars ? 'message-input__char-count--limit' : ''}`}>
              {charCount}/{maxChars}
            </span>
          )}
        </div>

        <button
          type="submit"
          className={`message-input__send ${message.trim() ? 'message-input__send--active' : ''}`}
          disabled={!message.trim() || disabled}
          aria-label="Send message"
        >
          <FiSend size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
