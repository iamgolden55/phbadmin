import React from 'react';

/**
 * Component to display typing indicators
 */
const TypingIndicator = ({ typingUsers = [], className = "" }) => {
  if (!typingUsers || typingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return "Someone is typing";
    } else if (typingUsers.length === 2) {
      return "2 people are typing";
    } else {
      return `${typingUsers.length} people are typing`;
    }
  };

  return (
    <div className={`typing-indicator ${className}`}>
      <i className="ri-pencil-line me-1"></i>
      <span>{getTypingText()}</span>
      <div className="typing-dots ms-2">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default TypingIndicator;