/**
 * WebSocket service for real-time healthcare messaging
 * Connects to Django Channels WebSocket backend using native WebSocket
 */
class WebSocketService {
  constructor() {
    this.presenceSocket = null;
    this.notificationSocket = null;
    this.chatSocket = null;
    this.typingSocket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.messageCallbacks = new Map();
    this.presenceCallbacks = new Map();
    this.typingCallbacks = new Map();
    this.connectionCallbacks = new Map();
    this.currentConversationId = null;
    this.userId = null;
    this.token = null;
  }

  /**
   * Initialize WebSocket connections
   * @param {string} token - JWT token for authentication
   * @param {string} userId - Current user ID
   */
  connect(token, userId) {
    // If already connected with the same token and user, don't reconnect
    if (this.isConnected && this.token === token && this.userId === userId) {
      return;
    }

    console.log('🔑 WebSocket service received token:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('👤 WebSocket service received userId:', userId);

    // If we have a different token/user, disconnect first
    if (this.isConnected && (this.token !== token || this.userId !== userId)) {
      console.log('🔄 Token or user changed, reconnecting...');
      this.disconnect();
    }

    this.token = token;
    this.userId = userId;

    // Get WebSocket URL from environment or default to localhost
    const wsHost = process.env.REACT_APP_WS_HOST || '127.0.0.1:8000';
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseWsUrl = `${wsProtocol}//${wsHost}`;
    
    console.log('🔌 Connecting to Django Channels WebSocket:', baseWsUrl);

    // Connect to presence WebSocket for online status
    this.connectPresence(baseWsUrl);
    
    // Connect to notifications WebSocket for system alerts
    this.connectNotifications(baseWsUrl);
    
    this.notifyConnectionChange('connecting');
  }

  /**
   * Connect to presence WebSocket for online/offline status
   */
  connectPresence(baseWsUrl) {
    const presenceUrl = `${baseWsUrl}/ws/presence/?token=${this.token}`;
    console.log('🟢 Connecting to presence WebSocket:', presenceUrl);
    
    this.presenceSocket = new WebSocket(presenceUrl);
    
    this.presenceSocket.onopen = () => {
      console.log('✅ Presence WebSocket connected');
      this.updateConnectionStatus();
    };
    
    this.presenceSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handlePresenceMessage(data);
      } catch (error) {
        console.error('❌ Error parsing presence message:', error);
      }
    };
    
    this.presenceSocket.onclose = () => {
      console.log('🔴 Presence WebSocket disconnected');
      this.updateConnectionStatus();
      this.attemptReconnect('presence');
    };
    
    this.presenceSocket.onerror = (error) => {
      console.error('❌ Presence WebSocket error:', error);
      this.notifyConnectionChange('error', error);
    };
  }

  /**
   * Connect to notifications WebSocket for system alerts
   */
  connectNotifications(baseWsUrl) {
    const notificationsUrl = `${baseWsUrl}/ws/notifications/?token=${this.token}`;
    console.log('🔔 Connecting to notifications WebSocket:', notificationsUrl);
    
    this.notificationSocket = new WebSocket(notificationsUrl);
    
    this.notificationSocket.onopen = () => {
      console.log('✅ Notifications WebSocket connected');
      this.updateConnectionStatus();
    };
    
    this.notificationSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleNotificationMessage(data);
      } catch (error) {
        console.error('❌ Error parsing notification message:', error);
      }
    };
    
    this.notificationSocket.onclose = () => {
      console.log('🔴 Notifications WebSocket disconnected');
      this.updateConnectionStatus();
      this.attemptReconnect('notifications');
    };
    
    this.notificationSocket.onerror = (error) => {
      console.error('❌ Notifications WebSocket error:', error);
      this.notifyConnectionChange('error', error);
    };
  }

  /**
   * Join a conversation for real-time messaging
   * @param {string} conversationId - The conversation ID to join
   */
  joinConversation(conversationId) {
    if (this.currentConversationId === conversationId && 
        this.chatSocket && 
        this.chatSocket.readyState === WebSocket.OPEN) {
      console.log('💬 Already connected to conversation:', conversationId);
      return; // Already connected to this conversation
    }

    console.log('💬 Switching to conversation:', conversationId);

    // Leave current conversation if connected
    if (this.chatSocket) {
      this.leaveConversation();
    }

    this.currentConversationId = conversationId;
    
    const wsHost = process.env.REACT_APP_WS_HOST || '127.0.0.1:8000';
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseWsUrl = `${wsProtocol}//${wsHost}`;
    
    console.log('💬 Token for conversation join:', this.token ? `${this.token.substring(0, 20)}...` : 'null');
    const chatUrl = `${baseWsUrl}/ws/chat/${conversationId}/?token=${this.token}`;
    console.log('💬 Joining conversation WebSocket:', chatUrl);
    
    this.chatSocket = new WebSocket(chatUrl);
    
    this.chatSocket.onopen = () => {
      console.log('✅ Chat WebSocket connected for conversation:', conversationId);
      this.updateConnectionStatus();
      
      // Send join message
      this.chatSocket.send(JSON.stringify({
        type: 'join_conversation',
        conversation_id: conversationId,
        user_id: this.userId
      }));
    };
    
    this.chatSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleChatMessage(data);
      } catch (error) {
        console.error('❌ Error parsing chat message:', error);
      }
    };
    
    this.chatSocket.onclose = () => {
      console.log('🔴 Chat WebSocket disconnected');
      this.updateConnectionStatus();
      this.attemptReconnect('chat');
    };
    
    this.chatSocket.onerror = (error) => {
      console.error('❌ Chat WebSocket error:', error);
      this.notifyConnectionChange('error', error);
    };

    // Also connect typing indicator for this conversation
    this.connectTyping(baseWsUrl, conversationId);
  }

  /**
   * Connect to typing indicator WebSocket for a conversation
   */
  connectTyping(baseWsUrl, conversationId) {
    console.log('⌨️ Token for typing connection:', this.token ? `${this.token.substring(0, 20)}...` : 'null');
    const typingUrl = `${baseWsUrl}/ws/typing/${conversationId}/?token=${this.token}`;
    console.log('⌨️ Connecting to typing WebSocket:', typingUrl);
    
    this.typingSocket = new WebSocket(typingUrl);
    
    this.typingSocket.onopen = () => {
      console.log('✅ Typing WebSocket connected');
      this.updateConnectionStatus();
    };
    
    this.typingSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleTypingMessage(data);
      } catch (error) {
        console.error('❌ Error parsing typing message:', error);
      }
    };
    
    this.typingSocket.onclose = () => {
      console.log('🔴 Typing WebSocket disconnected');
      this.updateConnectionStatus();
    };
    
    this.typingSocket.onerror = (error) => {
      console.error('❌ Typing WebSocket error:', error);
    };
  }

  /**
   * Leave current conversation
   */
  leaveConversation() {
    if (this.chatSocket) {
      console.log('👋 Leaving conversation:', this.currentConversationId);
      
      // Send leave message
      if (this.chatSocket.readyState === WebSocket.OPEN) {
        this.chatSocket.send(JSON.stringify({
          type: 'leave_conversation',
          conversation_id: this.currentConversationId,
          user_id: this.userId
        }));
      }
      
      this.chatSocket.close();
      this.chatSocket = null;
    }
    
    if (this.typingSocket) {
      this.typingSocket.close();
      this.typingSocket = null;
    }
    
    this.currentConversationId = null;
    this.updateConnectionStatus();
  }

  /**
   * Send a message to the current conversation
   * @param {Object} messageData - The message data to send
   */
  sendMessage(messageData) {
    if (!this.chatSocket || this.chatSocket.readyState !== WebSocket.OPEN) {
      console.error('❌ Cannot send message: Chat WebSocket not connected');
      return false;
    }

    console.log('📤 Sending message:', messageData);
    
    this.chatSocket.send(JSON.stringify({
      type: 'send_message',
      ...messageData
    }));
    
    return true;
  }

  /**
   * Send typing indicator
   * @param {boolean} isTyping - Whether the user is typing
   */
  sendTypingIndicator(isTyping) {
    if (!this.typingSocket || this.typingSocket.readyState !== WebSocket.OPEN) {
      return false;
    }

    this.typingSocket.send(JSON.stringify({
      type: 'typing_indicator',
      is_typing: isTyping,
      user_id: this.userId,
      conversation_id: this.currentConversationId
    }));
    
    return true;
  }

  /**
   * Mark messages as read
   * @param {string} messageId - The latest message ID that was read
   */
  markMessagesRead(messageId) {
    if (!this.chatSocket || this.chatSocket.readyState !== WebSocket.OPEN) {
      return false;
    }

    this.chatSocket.send(JSON.stringify({
      type: 'mark_read',
      message_id: messageId,
      conversation_id: this.currentConversationId,
      user_id: this.userId
    }));
    
    return true;
  }

  /**
   * Handle presence messages (online/offline status)
   */
  handlePresenceMessage(data) {
    console.log('🟢 Presence update:', data);
    
    // Notify presence callbacks
    this.presenceCallbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error('❌ Error in presence callback:', error);
      }
    });
  }

  /**
   * Handle notification messages (system alerts)
   */
  handleNotificationMessage(data) {
    console.log('🔔 Notification:', data);
    
    // Handle different notification types
    switch (data.type) {
      case 'emergency_alert':
        console.log('🚨 Emergency alert received:', data);
        break;
      case 'mention':
        console.log('👤 Mention received:', data);
        break;
      default:
        console.log('📢 General notification:', data);
    }
  }

  /**
   * Handle chat messages
   */
  handleChatMessage(data) {
    console.log('💬 Chat message:', data);
    
    // Notify message callbacks
    this.messageCallbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error('❌ Error in message callback:', error);
      }
    });
  }

  /**
   * Handle typing indicator messages
   */
  handleTypingMessage(data) {
    console.log('⌨️ Typing indicator:', data);
    
    // Notify typing callbacks
    this.typingCallbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error('❌ Error in typing callback:', error);
      }
    });
  }

  /**
   * Update overall connection status
   */
  updateConnectionStatus() {
    const presenceConnected = this.presenceSocket?.readyState === WebSocket.OPEN;
    const notificationsConnected = this.notificationSocket?.readyState === WebSocket.OPEN;
    const chatConnected = this.chatSocket?.readyState === WebSocket.OPEN;
    
    // Consider connected if presence and notifications are connected
    // Chat connection is per-conversation and optional for overall status
    const wasConnected = this.isConnected;
    this.isConnected = presenceConnected && notificationsConnected;
    
    if (this.isConnected && !wasConnected) {
      this.notifyConnectionChange('connected');
      this.reconnectAttempts = 0;
    } else if (!this.isConnected && wasConnected) {
      this.notifyConnectionChange('disconnected');
    }
    
    // If we have a conversation but chat isn't connected, we're still connecting to that chat
    const conversationStatus = this.currentConversationId ? 
      (chatConnected ? 'connected' : 'connecting') : 'none';
    
    console.log('🔌 Connection status:', {
      overall: this.isConnected,
      presence: presenceConnected,
      notifications: notificationsConnected,
      chat: chatConnected,
      conversation: conversationStatus,
      conversationId: this.currentConversationId
    });
  }

  /**
   * Notify connection status changes
   */
  notifyConnectionChange(status, error = null) {
    console.log('🔌 Connection status changed:', status);
    
    this.connectionCallbacks.forEach((callback) => {
      try {
        callback({ status, error });
      } catch (error) {
        console.error('❌ Error in connection callback:', error);
      }
    });
  }

  /**
   * Attempt to reconnect a specific WebSocket
   */
  attemptReconnect(socketType) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached');
      this.notifyConnectionChange('reconnect_failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Attempting to reconnect ${socketType} (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      this.notifyConnectionChange('reconnecting');
      
      const wsHost = process.env.REACT_APP_WS_HOST || '127.0.0.1:8000';
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const baseWsUrl = `${wsProtocol}//${wsHost}`;
      
      switch (socketType) {
        case 'presence':
          this.connectPresence(baseWsUrl);
          break;
        case 'notifications':
          this.connectNotifications(baseWsUrl);
          break;
        case 'chat':
          if (this.currentConversationId) {
            this.joinConversation(this.currentConversationId);
          }
          break;
      }
    }, delay);
  }

  /**
   * Subscribe to events
   * @param {string} eventType - Type of event (message, presence, typing, connection)
   * @param {string} callbackId - Unique ID for the callback
   * @param {Function} callback - Callback function
   */
  subscribe(eventType, callbackId, callback) {
    switch (eventType) {
      case 'message':
        this.messageCallbacks.set(callbackId, callback);
        break;
      case 'presence':
        this.presenceCallbacks.set(callbackId, callback);
        break;
      case 'typing':
        this.typingCallbacks.set(callbackId, callback);
        break;
      case 'connection':
        this.connectionCallbacks.set(callbackId, callback);
        break;
      default:
        console.warn('Unknown event type:', eventType);
    }
  }

  /**
   * Unsubscribe from events
   * @param {string} eventType - Type of event
   * @param {string} callbackId - Unique ID for the callback
   */
  unsubscribe(eventType, callbackId) {
    switch (eventType) {
      case 'message':
        this.messageCallbacks.delete(callbackId);
        break;
      case 'presence':
        this.presenceCallbacks.delete(callbackId);
        break;
      case 'typing':
        this.typingCallbacks.delete(callbackId);
        break;
      case 'connection':
        this.connectionCallbacks.delete(callbackId);
        break;
    }
  }

  /**
   * Disconnect all WebSockets
   */
  disconnect() {
    console.log('🔌 Disconnecting all WebSocket connections');
    
    if (this.chatSocket) {
      this.chatSocket.close();
      this.chatSocket = null;
    }
    
    if (this.typingSocket) {
      this.typingSocket.close();
      this.typingSocket = null;
    }
    
    if (this.presenceSocket) {
      this.presenceSocket.close();
      this.presenceSocket = null;
    }
    
    if (this.notificationSocket) {
      this.notificationSocket.close();
      this.notificationSocket = null;
    }
    
    this.isConnected = false;
    this.currentConversationId = null;
    this.notifyConnectionChange('disconnected');
  }

  /**
   * Update user presence status
   * @param {string} status - Status to set (online, away, offline)
   */
  updatePresence(status) {
    if (!this.presenceSocket || this.presenceSocket.readyState !== WebSocket.OPEN) {
      console.log('🔴 Cannot update presence: Presence WebSocket not connected');
      return false;
    }

    console.log('👤 Updating presence status to:', status);
    
    this.presenceSocket.send(JSON.stringify({
      type: 'update_presence',
      status: status,
      user_id: this.userId,
      timestamp: new Date().toISOString()
    }));
    
    return true;
  }

  /**
   * Send emergency alert
   * @param {Object} alertData - Emergency alert data
   */
  sendEmergencyAlert(alertData) {
    if (!this.notificationSocket || this.notificationSocket.readyState !== WebSocket.OPEN) {
      console.log('🔴 Cannot send emergency alert: Notifications WebSocket not connected');
      return false;
    }

    console.log('🚨 Sending emergency alert:', alertData);
    
    this.notificationSocket.send(JSON.stringify({
      type: 'emergency_alert',
      ...alertData,
      timestamp: new Date().toISOString()
    }));
    
    return true;
  }

  /**
   * Get current connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      presenceConnected: this.presenceSocket?.readyState === WebSocket.OPEN,
      notificationsConnected: this.notificationSocket?.readyState === WebSocket.OPEN,
      chatConnected: this.chatSocket?.readyState === WebSocket.OPEN,
      typingConnected: this.typingSocket?.readyState === WebSocket.OPEN,
      currentConversationId: this.currentConversationId,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;