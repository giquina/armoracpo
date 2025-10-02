import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMoreVertical } from 'react-icons/fi';
import { supabase, ProtectionAssignment, AssignmentMessage } from '../../lib/supabase';
import { messageService } from '../../services/messageService';
import { ChatBubble, TypingIndicator, QuickReplyTemplates, MessageInput } from '../../components/messages';
import { StatusBadge, LoadingSpinner, Card } from '../../components/ui';
import '../../styles/global.css';
import './MessageChat.css';

const MessageChat: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<AssignmentMessage[]>([]);
  const [assignment, setAssignment] = useState<ProtectionAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const loadChatData = useCallback(async () => {
    try {
      if (!assignmentId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: assignmentData } = await supabase
        .from('protection_assignments')
        .select('*')
        .eq('id', assignmentId)
        .single();

      if (assignmentData) setAssignment(assignmentData);

      const msgs = await messageService.getMessages(assignmentId);
      setMessages(msgs);

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

    const markRead = async () => {
      try {
        await messageService.markAllAsRead(assignmentId, userId);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markRead();

    const unsubscribe = messageService.subscribeToMessages(assignmentId, (message) => {
      if (mounted) {
        setMessages((prev) => [...prev, message]);
        messageService.markAllAsRead(assignmentId, userId).catch(error => {
          console.error('Error marking new message as read:', error);
        });

        // Simulate typing indicator for principal messages
        if (message.sender_type === 'principal') {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 1000);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [assignmentId, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText: string) => {
    if (!assignmentId || !userId) return;

    try {
      await messageService.sendMessage(assignmentId, userId, 'cpo', messageText);
      setShowQuickReplies(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleQuickReply = (replyText: string) => {
    handleSendMessage(replyText);
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
      <div className="message-chat">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="message-chat">
        <div className="message-chat__error">Assignment not found</div>
      </div>
    );
  }

  return (
    <div className="message-chat safe-top">
      {/* Header */}
      <div className="message-chat__header">
        <button
          className="message-chat__back"
          onClick={() => navigate('/messages')}
          aria-label="Back to messages"
        >
          <FiArrowLeft size={24} />
        </button>

        <div className="message-chat__header-info">
          <div className="message-chat__principal">
            <div className="message-chat__principal-avatar">
              {assignment.principal_photo_url ? (
                <img src={assignment.principal_photo_url} alt={assignment.principal_name} />
              ) : (
                <span>{assignment.principal_name.charAt(0)}</span>
              )}
            </div>
            <div className="message-chat__principal-details">
              <h2 className="message-chat__principal-name">{assignment.principal_name}</h2>
              <p className="message-chat__principal-status">
                {assignment.status === 'active' ? 'Assignment Active' : 'Assignment Scheduled'}
              </p>
            </div>
          </div>
        </div>

        <button
          className="message-chat__menu"
          aria-label="More options"
        >
          <FiMoreVertical size={20} />
        </button>
      </div>

      {/* Assignment Context Card */}
      <div className="message-chat__context">
        <Card>
          <div className="message-chat__context-content">
            <div className="message-chat__context-badges">
              <StatusBadge status={assignment.status} size="sm" />
              <span className="badge badge-navy">
                {getAssignmentTypeLabel(assignment.assignment_type)}
              </span>
              <span className={`badge badge-threat-${assignment.threat_level}`}>
                {assignment.threat_level.toUpperCase()}
              </span>
            </div>
            <p className="message-chat__context-location">
              📍 {assignment.pickup_location}
            </p>
            {assignment.special_instructions && (
              <p className="message-chat__context-instructions">
                ℹ️ {assignment.special_instructions}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Messages Container */}
      <div className="message-chat__messages" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="message-chat__empty">
            <p>No messages yet. Start the conversation with your principal.</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              isSent={message.sender_type === 'cpo'}
            />
          ))
        )}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies (Collapsible) */}
      {showQuickReplies && (
        <QuickReplyTemplates onSelect={handleQuickReply} />
      )}

      {/* Input Area */}
      <div className="message-chat__input-area">
        <button
          className="message-chat__quick-replies-toggle"
          onClick={() => setShowQuickReplies(!showQuickReplies)}
        >
          {showQuickReplies ? 'Hide' : 'Quick Replies'}
        </button>
        <MessageInput
          onSend={handleSendMessage}
          placeholder={`Message ${assignment.principal_name}...`}
        />
      </div>
    </div>
  );
};

export default MessageChat;
