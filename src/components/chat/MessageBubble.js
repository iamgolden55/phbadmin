import React, { useState } from 'react';
import { Nav, Dropdown } from 'react-bootstrap';
import Avatar from '../Avatar';

/**
 * Component for displaying individual message bubbles
 */
const MessageBubble = ({ 
  message, 
  isOwnMessage = false, 
  showAvatar = true,
  onReply,
  onEdit,
  onDelete,
  getUserStatus
}) => {
  const [showActions, setShowActions] = useState(false);

  // Format message timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get message status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <i className="ri-time-line text-muted"></i>;
      case 'sent':
        return <i className="ri-check-line text-muted"></i>;
      case 'delivered':
        return <i className="ri-check-double-line text-muted"></i>;
      case 'read':
        return <i className="ri-check-double-line text-primary"></i>;
      case 'failed':
        return <i className="ri-error-warning-line text-danger"></i>;
      default:
        return null;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    if (!priority || priority === 'routine') return null;
    
    const configs = {
      urgent: { icon: 'ri-alarm-warning-line', color: 'warning', text: 'Urgent' },
      emergency: { icon: 'ri-alarm-line', color: 'danger', text: 'Emergency' }
    };
    
    const config = configs[priority];
    if (!config) return null;
    
    return (
      <span className={`badge bg-${config.color} me-2`}>
        <i className={`${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  // Render message content based on type
  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'text':
        return (
          <div className="message-text">
            {getPriorityBadge(message.priority_level)}
            {message.content}
          </div>
        );
      
      case 'image':
        return (
          <div className="message-image">
            {getPriorityBadge(message.priority_level)}
            <img 
              src={message.content} 
              alt="Shared image"
              className="img-fluid rounded"
              style={{ maxWidth: '300px', cursor: 'pointer' }}
              onClick={() => window.open(message.content, '_blank')}
            />
            {message.caption && (
              <div className="mt-2 text-muted small">{message.caption}</div>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className="message-file">
            {getPriorityBadge(message.priority_level)}
            <div className="d-flex align-items-center p-3 bg-light rounded">
              <i className="ri-file-line fs-4 me-3 text-primary"></i>
              <div className="flex-1">
                <div className="fw-medium">{message.filename || 'File'}</div>
                <small className="text-muted">{message.filesize || 'Unknown size'}</small>
              </div>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => window.open(message.content, '_blank')}
              >
                <i className="ri-download-line"></i>
              </button>
            </div>
          </div>
        );
      
      case 'location':
        return (
          <div className="message-location">
            {getPriorityBadge(message.priority_level)}
            <div className="d-flex align-items-center p-3 bg-light rounded">
              <i className="ri-map-pin-line fs-4 me-3 text-success"></i>
              <div className="flex-1">
                <div className="fw-medium">Location</div>
                <small className="text-muted">{message.content}</small>
              </div>
              <button 
                className="btn btn-outline-success btn-sm"
                onClick={() => window.open(`https://maps.google.com/?q=${message.content}`, '_blank')}
              >
                <i className="ri-external-link-line"></i>
              </button>
            </div>
          </div>
        );
      
      case 'system':
        return (
          <div className="message-system text-center">
            <small className="text-muted fst-italic">
              <i className="ri-information-line me-1"></i>
              {message.content}
            </small>
          </div>
        );
      
      default:
        return (
          <div className="message-text">
            {getPriorityBadge(message.priority_level)}
            {message.content}
          </div>
        );
    }
  };

  // System messages have special styling
  if (message.message_type === 'system') {
    return (
      <div className="system-message text-center my-2">
        {renderMessageContent()}
      </div>
    );
  }

  return (
    <div 
      className={`msg-item ${isOwnMessage ? 'reverse' : ''} ${message.priority_level === 'emergency' ? 'emergency' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar (only for other users' messages) */}
      {!isOwnMessage && showAvatar && (
        <Avatar 
          img={message.sender?.avatar} 
          status={getUserStatus ? getUserStatus(message.sender?.id) : 'offline'}
        />
      )}

      {/* Message Content */}
      <div className="msg-body">
        <div className="d-flex align-items-start gap-3">
          <div className="flex-1">
            {/* Sender name (for group chats) */}
            {!isOwnMessage && showAvatar && (
              <div className="sender-name mb-1">
                <small className="text-muted fw-medium">
                  {message.sender?.name || 'Unknown User'}
                </small>
              </div>
            )}

            {/* Reply context */}
            {message.reply_to && (
              <div className="reply-context mb-2 p-2 bg-light rounded border-start border-primary border-3">
                <small className="text-muted">
                  <i className="ri-reply-line me-1"></i>
                  Replying to: {message.reply_to.content?.substring(0, 50)}...
                </small>
              </div>
            )}

            {/* Message Bubble */}
            <div className="msg-bubble">
              {renderMessageContent()}
              
              {/* Mentions */}
              {message.mentions && message.mentions.length > 0 && (
                <div className="mt-2">
                  {message.mentions.map((mention, index) => (
                    <span key={index} className="badge bg-info me-1">
                      @{mention}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Timestamp and Status */}
              <div className="d-flex align-items-center justify-content-between mt-2">
                <span className="message-time text-muted small">
                  {formatTime(message.timestamp || message.created_at)}
                </span>
                {isOwnMessage && (
                  <div className="message-status">
                    {getStatusIcon(message.status)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="msg-actions">
              <Nav className="nav-icon flex-column">
                {onReply && (
                  <Nav.Link 
                    href="#" 
                    title="Reply"
                    onClick={(e) => {
                      e.preventDefault();
                      onReply(message);
                    }}
                  >
                    <i className="ri-reply-line"></i>
                  </Nav.Link>
                )}
                
                <Dropdown align="end">
                  <Dropdown.Toggle as="a" className="nav-link">
                    <i className="ri-more-fill"></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => navigator.clipboard.writeText(message.content)}>
                      <i className="ri-file-copy-line me-2"></i>
                      Copy
                    </Dropdown.Item>
                    
                    {isOwnMessage && onEdit && message.message_type === 'text' && (
                      <Dropdown.Item onClick={() => onEdit(message)}>
                        <i className="ri-edit-line me-2"></i>
                        Edit
                      </Dropdown.Item>
                    )}
                    
                    {(isOwnMessage || message.sender?.role === 'admin') && onDelete && (
                      <>
                        <Dropdown.Divider />
                        <Dropdown.Item 
                          className="text-danger"
                          onClick={() => onDelete(message)}
                        >
                          <i className="ri-delete-bin-line me-2"></i>
                          Delete
                        </Dropdown.Item>
                      </>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </Nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;