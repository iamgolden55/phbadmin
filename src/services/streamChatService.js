/**
 * Stream Chat service placeholder
 * Temporarily disabled to resolve import errors
 */

class StreamChatService {
  constructor() {
    this.client = null;
    this.user = null;
    this.isConnected = false;
  }

  async connect(user, streamToken) {
    console.log('Stream Chat service temporarily disabled');
    return null;
  }

  async disconnect() {
    console.log('Stream Chat service temporarily disabled');
  }

  getConnectionStatus() {
    return {
      isConnected: false,
      client: false,
      user: null,
      disabled: true
    };
  }
}

// Create singleton instance
const streamChatService = new StreamChatService();

export default streamChatService;