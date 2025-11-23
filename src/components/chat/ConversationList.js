import React, { useState, useEffect } from 'react';
import { Form, Spinner, Badge } from 'react-bootstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Avatar from '../Avatar';
import { messagingAPI } from '../../config/api';

/**
 * Component for displaying and managing conversations list
 */
const ConversationList = ({ 
  onConversationSelect, 
  selectedConversationId, 
  onlineUsers = new Map(),
  className = ""
}) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, emergency

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messagingAPI.getConversations({
        search: searchQuery,
        type: filter === 'emergency' ? 'emergency' : undefined
      });
      
      setConversations(response.results || response);
      setError(null);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Reload conversations when search or filter changes
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadConversations();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, filter]);

  // Format last message time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return minutes < 1 ? 'now' : `${minutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return days === 1 ? '1d' : `${days}d`;
    }
  };

  // Get user online status
  const getUserStatus = (userId) => {
    const status = onlineUsers.get(userId);
    return status?.status || 'offline';
  };

  // Get conversation avatar and name
  const getConversationDisplay = (conversation) => {
    if (conversation.conversation_type === 'direct') {
      // For direct messages, show other participant
      const otherParticipant = conversation.participants?.find(p => p.id !== conversation.current_user_id);
      return {
        name: otherParticipant?.name || conversation.title,
        avatar: otherParticipant?.avatar || null,
        status: getUserStatus(otherParticipant?.id)
      };
    } else {
      // For groups/channels, show group info
      return {
        name: conversation.title,
        avatar: conversation.conversation_type === 'department' ? 'D' : '#',
        status: 'group'
      };
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    if (filter === 'unread' && conv.unread_count === 0) return false;
    if (filter === 'emergency' && conv.priority_level !== 'emergency') return false;
    return true;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <i className="ri-error-warning-line fs-2 text-warning mb-2"></i>
        <p className="text-muted">{error}</p>
        <button className="btn btn-outline-primary btn-sm" onClick={loadConversations}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`conversation-list ${className}`}>
      {/* Search and Filter */}
      <div className="p-3 border-bottom">
        <Form.Control
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-2"
        />
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button
            className={`btn btn-sm ${filter === 'emergency' ? 'btn-danger' : 'btn-outline-danger'}`}
            onClick={() => setFilter('emergency')}
          >
            🚨 Emergency
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <PerfectScrollbar className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="text-center p-4">
            <i className="ri-chat-3-line fs-2 text-muted mb-2"></i>
            <p className="text-muted">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <div className="chat-group">
            {filteredConversations.map((conversation) => {
              const display = getConversationDisplay(conversation);
              const isSelected = conversation.id === selectedConversationId;
              const hasUnread = conversation.unread_count > 0;
              const isEmergency = conversation.priority_level === 'emergency';
              
              return (
                <div
                  key={conversation.id}
                  className={`chat-item ${hasUnread ? 'unread' : ''} ${isSelected ? 'selected' : ''} ${isEmergency ? 'emergency' : ''}`}
                  onClick={() => onConversationSelect(conversation)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Avatar */}
                  <div className="position-relative">
                    {display.avatar && typeof display.avatar === 'string' && display.avatar.startsWith('http') ? (
                      <Avatar img={display.avatar} status={display.status} />
                    ) : (
                      <div className="avatar">
                        <span className={`avatar-initial ${isEmergency ? 'bg-danger' : 'bg-primary'}`}>
                          {display.avatar || display.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                        {display.status === 'online' && (
                          <span className="avatar-status bg-success"></span>
                        )}
                      </div>
                    )}
                    {isEmergency && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        🚨
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="chat-item-body">
                    <div className="d-flex align-items-center mb-1">
                      <h6 className="mb-0 me-2">{display.name}</h6>
                      
                      {/* Badges */}
                      {conversation.conversation_type === 'group' && (
                        <Badge bg="secondary" className="me-1">Group</Badge>
                      )}
                      {conversation.conversation_type === 'department' && (
                        <Badge bg="info" className="me-1">Dept</Badge>
                      )}
                      {isEmergency && (
                        <Badge bg="danger" className="me-1">Emergency</Badge>
                      )}
                      
                      {/* Time */}
                      <small className="ms-auto text-muted">
                        {formatTime(conversation.last_message_time)}
                      </small>
                    </div>
                    
                    {/* Last Message */}
                    <div className="d-flex align-items-center">
                      <span className="text-muted small flex-1 text-truncate">
                        {conversation.last_message?.content || 'No messages yet'}
                      </span>
                      
                      {/* Unread Count */}
                      {hasUnread && (
                        <Badge bg="primary" pill className="ms-2">
                          {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PerfectScrollbar>
    </div>
  );
};

export default ConversationList;