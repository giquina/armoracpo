import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import { IconWrapper } from '../../utils/IconWrapper';
import { supabase, ProtectionAssignment, AssignmentMessage } from '../../lib/supabase';
import { messageService } from '../../services/messageService';
import { ChatListItem } from '../../components/messages';
import { EmptyState, LoadingSpinner } from '../../components/ui';
import '../../styles/global.css';
import './Messages.css';
import DevPanel from '../../components/dev/DevPanel';

interface Conversation {
  assignment: ProtectionAssignment;
  lastMessage?: AssignmentMessage;
  unreadCount: number;
}

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  const loadConversations = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: cpoData } = await supabase
        .from('protection_officers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (cpoData) {
        const { data: assignments } = await supabase
          .from('protection_assignments')
          .select('*')
          .eq('cpo_id', cpoData.id)
          .order('scheduled_start_time', { ascending: false });

        if (assignments) {
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

          convos.sort((a, b) => {
            const timeA = a.lastMessage?.created_at || a.assignment.scheduled_start_time;
            const timeB = b.lastMessage?.created_at || b.assignment.scheduled_start_time;
            return new Date(timeB).getTime() - new Date(timeA).getTime();
          });

          setConversations(convos);
          setFilteredConversations(convos);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();

    const interval = setInterval(() => loadConversations(), 30000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = conversations.filter((conv) => {
      const principalName = conv.assignment.principal_name.toLowerCase();
      const location = conv.assignment.pickup_location.toLowerCase();
      const lastMessageText = conv.lastMessage?.message.toLowerCase() || '';

      return principalName.includes(query) ||
             location.includes(query) ||
             lastMessageText.includes(query);
    });

    setFilteredConversations(filtered);
  }, [searchQuery, conversations]);

  const activeConversations = filteredConversations.filter(
    (conv) => conv.assignment.status === 'active' || conv.assignment.status === 'assigned' || conv.assignment.status === 'en_route'
  );

  const archivedConversations = filteredConversations.filter(
    (conv) => conv.assignment.status === 'completed' || conv.assignment.status === 'cancelled'
  );

  const displayedConversations = activeTab === 'active' ? activeConversations : archivedConversations;

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const handleRefresh = () => {
    loadConversations(true);
  };

  if (loading) {
    return (
      <div className="messages-screen">
        <LoadingSpinner size="lg" />
      <DevPanel />

      </div>
    );
  }

  return (
    <div className="messages-screen safe-top safe-bottom">
      {/* Header */}
      <div className="messages-header">
        <div className="messages-header__top">
          <h1 className="messages-header__title">Messages</h1>
          <button
            className="messages-header__refresh"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh messages"
          >
            <IconWrapper icon={FiRefreshCw} size={20} className={refreshing ? 'spinning' : ''} />
          </button>
        </div>
        <p className="messages-header__subtitle">
          Communications with Principals {totalUnread > 0 && `• ${totalUnread} unread`}
        </p>
      </div>

      {/* Search Bar */}
      <div className="messages-search">
        <div className="messages-search__input-wrapper">
          <IconWrapper icon={FiSearch} className="messages-search__icon" size={18} />
          <input
            type="text"
            className="messages-search__input"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="messages-search__clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="messages-tabs">
        <button
          className={`messages-tabs__button ${activeTab === 'active' ? 'messages-tabs__button--active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active ({activeConversations.length})
        </button>
        <button
          className={`messages-tabs__button ${activeTab === 'archived' ? 'messages-tabs__button--active' : ''}`}
          onClick={() => setActiveTab('archived')}
        >
          Archived ({archivedConversations.length})
        </button>
      </div>

      {/* Conversations List */}
      <div className="messages-list">
        {displayedConversations.length === 0 ? (
          <EmptyState
            icon="💬"
            title={searchQuery ? 'No matches found' : `No ${activeTab} conversations`}
            description={
              searchQuery
                ? 'Try adjusting your search terms'
                : activeTab === 'active'
                ? 'Once you accept an assignment, you can communicate with your principal here.'
                : 'Completed and cancelled assignments will appear here.'
            }
            action={
              !searchQuery && activeTab === 'active'
                ? {
                    label: 'Browse Available Assignments',
                    onClick: () => navigate('/jobs')
                  }
                : undefined
            }
          />
        ) : (
          displayedConversations.map((conversation) => (
            <ChatListItem
              key={conversation.assignment.id}
              assignment={conversation.assignment}
              lastMessage={conversation.lastMessage}
              unreadCount={conversation.unreadCount}
              onClick={() => navigate(`/messages/${conversation.assignment.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Messages;
