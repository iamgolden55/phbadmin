import { useState, useEffect, useCallback, useRef } from 'react';
import websocketService from '../services/websocket';

/**
 * React hook for managing WebSocket connection and real-time messaging
 * @param {string} token - JWT authentication token
 * @param {string} userId - Current user ID
 * @returns {Object} WebSocket state and methods
 */
export const useWebSocket = (token, userId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [error, setError] = useState(null);
  
  const currentConversationId = useRef(null);
  const typingTimeout = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (token && userId) {
      console.log('🔌 Initializing WebSocket connection with token:', token.substring(0, 20) + '...');
      console.log('🔌 Full token being passed:', token);
      websocketService.connect(token, userId);

      // Subscribe to connection events
      websocketService.subscribe('connection', 'main', (data) => {
        setIsConnected(data.status === 'connected' || data.status === 'reconnected');
        setConnectionStatus(data.status);
        if (data.status === 'error' || data.status === 'reconnect_error') {
          setError(data.error?.message || 'Connection error');
        } else {
          setError(null);
        }
      });

      // Subscribe to message events
      websocketService.subscribe('message', 'main', (messageData) => {
        console.log('📨 Received message:', messageData);
        
        // Only add messages for the current conversation
        if (messageData.conversation_id === currentConversationId.current) {
          setMessages(prev => {
            // Avoid duplicates
            const exists = prev.some(msg => msg.id === messageData.id);
            if (!exists) {
              return [...prev, messageData];
            }
            return prev;
          });
        }
      });

      // Subscribe to typing events
      websocketService.subscribe('typing', 'main', (typingData) => {
        console.log('⌨️ Typing event:', typingData);
        
        if (typingData.conversation_id === currentConversationId.current && 
            typingData.user_id !== userId) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (typingData.status === 'start') {
              newSet.add(typingData.user_id);
            } else {
              newSet.delete(typingData.user_id);
            }
            return newSet;
          });
        }
      });

      // Subscribe to presence events
      websocketService.subscribe('presence', 'main', (presenceData) => {
        console.log('👤 Presence update:', presenceData);
        
        setOnlineUsers(prev => {
          const newMap = new Map(prev);
          newMap.set(presenceData.user_id, {
            status: presenceData.status,
            lastSeen: presenceData.timestamp
          });
          return newMap;
        });
      });

      // Subscribe to emergency alerts  
      websocketService.subscribe('notification', 'main', (alertData) => {
        console.log('🚨 Emergency alert received:', alertData);
        // Handle emergency alerts (show notification, play sound, etc.)
        if (window.Notification && Notification.permission === 'granted') {
          new Notification('🚨 Emergency Alert', {
            body: alertData.message || 'Emergency situation requires immediate attention',
            icon: '/favicon.ico'
          });
        }
      });

      // Request notification permission
      if (window.Notification && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      return () => {
        console.log('🔌🚫 Cleaning up WebSocket connection');
        websocketService.unsubscribe('connection', 'main');
        websocketService.unsubscribe('message', 'main');
        websocketService.unsubscribe('typing', 'main');
        websocketService.unsubscribe('presence', 'main');
        websocketService.unsubscribe('notification', 'main');
        websocketService.disconnect();
      };
    } else {
      console.log('🔌 Skipping WebSocket connection - missing:', { hasToken: !!token, hasUserId: !!userId });
      return () => {
        // No cleanup needed since no connection was made
      };
    }
  }, [token, userId]);

  // Join conversation
  const joinConversation = useCallback((conversationId) => {
    console.log('🚪 Joining conversation from hook:', conversationId);
    
    // Don't rejoin the same conversation
    if (currentConversationId.current === conversationId) {
      console.log('🚪 Already in conversation:', conversationId);
      return;
    }
    
    // Leave current conversation first
    if (currentConversationId.current) {
      console.log('🚪🚶 Leaving current conversation:', currentConversationId.current);
      websocketService.leaveConversation();
    }
    
    // Update current conversation
    currentConversationId.current = conversationId;
    setMessages([]); // Clear previous messages
    setTypingUsers(new Set()); // Clear typing indicators
    
    // Join new conversation
    websocketService.joinConversation(conversationId);
  }, []);

  // Leave conversation
  const leaveConversation = useCallback(() => {
    console.log('🚪🚶 Leaving conversation from hook');
    websocketService.leaveConversation();
    currentConversationId.current = null;
    setMessages([]);
    setTypingUsers(new Set());
  }, []);

  // Send message
  const sendMessage = useCallback((messageData) => {
    if (!isConnected) {
      console.warn('⚠️ Cannot send message: Not connected');
      return false;
    }

    console.log('📤 Sending message from hook:', messageData);
    return websocketService.sendMessage({
      ...messageData,
      conversation_id: currentConversationId.current
    });
  }, [isConnected]);

  // Send typing indicator with auto-stop
  const sendTypingIndicator = useCallback((isTyping) => {
    if (!isConnected || !currentConversationId.current) {
      return;
    }

    console.log('⌨️ Sending typing indicator from hook:', isTyping);
    websocketService.sendTypingIndicator(currentConversationId.current, isTyping);

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      typingTimeout.current = setTimeout(() => {
        websocketService.sendTypingIndicator(currentConversationId.current, false);
      }, 3000);
    } else {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
        typingTimeout.current = null;
      }
    }
  }, [isConnected]);

  // Update presence status
  const updatePresence = useCallback((status) => {
    if (!isConnected) {
      return;
    }
    
    console.log('👤 Updating presence from hook:', status);
    websocketService.updatePresence(status);
  }, [isConnected]);

  // Mark messages as read
  const markMessagesRead = useCallback((messageId) => {
    if (!isConnected || !currentConversationId.current) {
      return;
    }

    console.log('👁️ Marking messages as read from hook:', messageId);
    websocketService.markMessagesRead(currentConversationId.current, messageId);
  }, [isConnected]);

  // Send emergency alert
  const sendEmergencyAlert = useCallback((alertData) => {
    if (!isConnected) {
      console.warn('⚠️ Cannot send emergency alert: Not connected');
      return false;
    }

    console.log('🚨 Sending emergency alert from hook:', alertData);
    return websocketService.sendEmergencyAlert(alertData);
  }, [isConnected]);

  // Get typing users list as array with names
  const getTypingUsers = useCallback(() => {
    return Array.from(typingUsers);
  }, [typingUsers]);

  // Get user online status
  const getUserStatus = useCallback((userId) => {
    return onlineUsers.get(userId) || { status: 'offline', lastSeen: null };
  }, [onlineUsers]);

  // Handle page visibility changes for presence
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isConnected) {
        const status = document.hidden ? 'away' : 'online';
        updatePresence(status);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, updatePresence]);

  // Set presence to online when connected
  useEffect(() => {
    if (isConnected) {
      updatePresence('online');
    }
  }, [isConnected, updatePresence]);

  return {
    // Connection state
    isConnected,
    connectionStatus,
    error,
    
    // Message state
    messages,
    typingUsers: getTypingUsers(),
    onlineUsers,
    
    // Actions
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTypingIndicator,
    updatePresence,
    markMessagesRead,
    sendEmergencyAlert,
    
    // Utilities
    getUserStatus,
    currentConversationId: currentConversationId.current,
    
    // WebSocket service direct access (for advanced usage)
    websocketService
  };
};

export default useWebSocket;