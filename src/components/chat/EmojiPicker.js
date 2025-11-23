import React, { useState, useRef, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';

/**
 * Emoji Picker Component for chat messages
 * Includes healthcare-relevant emojis and standard emoji categories
 */
const EmojiPicker = ({ onEmojiSelect, show, onHide }) => {
  const [activeCategory, setActiveCategory] = useState('recent');
  const [recentEmojis, setRecentEmojis] = useState(() => {
    const saved = localStorage.getItem('chat_recent_emojis');
    return saved ? JSON.parse(saved) : ['😊', '👍', '❤️', '😂', '😢', '🙏', '👏', '🔥'];
  });

  // Emoji categories with healthcare-relevant emojis
  const emojiCategories = {
    recent: {
      name: 'Recently Used',
      icon: 'ri-time-line',
      emojis: recentEmojis
    },
    people: {
      name: 'People & Emotions',
      icon: 'ri-emotion-happy-line',
      emojis: [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊',
        '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛',
        '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑',
        '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒',
        '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎'
      ]
    },
    medical: {
      name: 'Medical & Health',
      icon: 'ri-heart-pulse-line',
      emojis: [
        '🏥', '⚕️', '🩺', '💊', '💉', '🌡️', '🩹', '🦠', '🧬', '🧪', '🔬',
        '❤️', '🫀', '🧠', '🦷', '🦴', '👁️', '👂', '👃', '🫁', '🫃', '🤰',
        '🚑', '🏨', '🧑‍⚕️', '👨‍⚕️', '👩‍⚕️', '🧑‍🔬', '👨‍🔬', '👩‍🔬',
        '😷', '🤒', '🤕', '🤧', '🤢', '🤮', '😵', '🥴', '💚', '❤️‍🩹'
      ]
    },
    gestures: {
      name: 'Gestures & Hands',
      icon: 'ri-hand-heart-line',
      emojis: [
        '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕',
        '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤏', '💪', '🦾', '🖕', '✍️',
        '🙏', '🦶', '🦵', '🦿', '💄', '💋', '👄', '🦷', '👅', '👂', '🦻', '👃',
        '👣', '👁️', '👀', '🫦', '🫵', '🫴', '🫳', '🫰', '🤌', '🤏', '✊', '👊'
      ]
    },
    activities: {
      name: 'Activities',
      icon: 'ri-football-line',
      emojis: [
        '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓',
        '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿',
        '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️',
        '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏃', '🚶', '🧎', '🧍'
      ]
    },
    symbols: {
      name: 'Symbols',
      icon: 'ri-heart-line',
      emojis: [
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕',
        '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️',
        '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍',
        '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳'
      ]
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    // Add to recent emojis
    const updatedRecent = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 24);
    setRecentEmojis(updatedRecent);
    localStorage.setItem('chat_recent_emojis', JSON.stringify(updatedRecent));
    
    // Call parent callback
    onEmojiSelect(emoji);
    
    // Hide picker
    if (onHide) onHide();
  };

  // Update recent emojis category
  useEffect(() => {
    emojiCategories.recent.emojis = recentEmojis;
  }, [recentEmojis]);

  return (
    <div className="emoji-picker" style={{ width: '320px', maxHeight: '400px' }}>
      {/* Category Tabs */}
      <div className="emoji-categories border-bottom p-2">
        <div className="d-flex gap-1">
          {Object.entries(emojiCategories).map(([key, category]) => (
            <button
              key={key}
              className={`btn btn-sm ${activeCategory === key ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveCategory(key)}
              title={category.name}
              style={{ padding: '4px 8px' }}
            >
              <i className={category.icon} style={{ fontSize: '14px' }}></i>
            </button>
          ))}
        </div>
      </div>

      {/* Emoji Grid */}
      <div className="emoji-grid p-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <div className="mb-2">
          <small className="text-muted fw-bold">
            {emojiCategories[activeCategory]?.name}
          </small>
        </div>
        
        <div className="d-flex flex-wrap gap-1">
          {emojiCategories[activeCategory]?.emojis.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              className="btn btn-sm btn-outline-light emoji-btn"
              onClick={() => handleEmojiSelect(emoji)}
              style={{
                width: '32px',
                height: '32px',
                padding: '2px',
                fontSize: '16px',
                border: '1px solid transparent',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.borderColor = '#dee2e6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'transparent';
              }}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Empty state for recent emojis */}
        {activeCategory === 'recent' && recentEmojis.length === 0 && (
          <div className="text-center text-muted py-4">
            <i className="ri-emotion-line fs-3 mb-2"></i>
            <p className="mb-0">No recent emojis</p>
            <small>Use emojis to see them here</small>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="emoji-footer border-top p-2">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-1">
            {/* Most used healthcare emojis */}
            {['🏥', '⚕️', '💊', '❤️', '🙏'].map(emoji => (
              <button
                key={emoji}
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleEmojiSelect(emoji)}
                style={{ width: '28px', height: '28px', padding: '2px', fontSize: '14px' }}
              >
                {emoji}
              </button>
            ))}
          </div>
          <small className="text-muted">Healthcare Quick</small>
        </div>
      </div>
    </div>
  );
};

// Wrapper component for dropdown usage
export const EmojiPickerDropdown = ({ onEmojiSelect, children }) => {
  return (
    <Dropdown>
      <Dropdown.Toggle as="div" style={{ cursor: 'pointer' }}>
        {children}
      </Dropdown.Toggle>
      <Dropdown.Menu as="div" className="p-0" style={{ minWidth: 'auto' }}>
        <EmojiPicker onEmojiSelect={onEmojiSelect} />
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default EmojiPicker;