type WebSocketMessageHandler = (data: any) => void;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageHandlers = new Set<WebSocketMessageHandler>();
  private isConnected = false;
  private isMounted = true;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (!this.isMounted || this.isConnected) return;

    this.cleanup();

    console.log(`[WebSocket] Connecting to: ${this.url}`);

    try {
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('[WebSocket] Failed to create WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      if (!this.isMounted) return;
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('[WebSocket] Connected successfully');
    };

    this.ws.onmessage = (event) => {
      if (!this.isMounted) return;
      
      try {
        const data = JSON.parse(event.data);
        this.notifyMessageHandlers(data);
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    };

    this.ws.onclose = (event) => {
      if (!this.isMounted) return;
      
      this.isConnected = false;
      console.log(`[WebSocket] Disconnected (code: ${event.code}, reason: ${event.reason || 'No reason provided'})`);
      
      if (event.code !== 1000 && event.code !== 1005) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };
  }

  private scheduleReconnect() {
    if (!this.isMounted || this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached. Please refresh the page.');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`[WebSocket] Attempting to reconnect in ${delay/1000} seconds... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      if (this.isMounted) {
        this.reconnectAttempts++;
        this.connect();
      }
    }, delay);
  }

  send(message: any) {
    if (this.isConnected && this.ws) {
      try {
        const messageString = typeof message === 'string' ? message : JSON.stringify(message);
        this.ws.send(messageString);
      } catch (error) {
        console.error('[WebSocket] Error sending message:', error);
      }
    }
  }

  addMessageHandler(handler: WebSocketMessageHandler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  private notifyMessageHandlers(data: any) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('[WebSocket] Error in message handler:', error);
      }
    });
  }

  private cleanup() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      
      this.ws = null;
    }
  }

  disconnect() {
    this.isMounted = false;
    this.cleanup();
    this.messageHandlers.clear();
  }
}

// Create a singleton instance
export const webSocketManager = new WebSocketManager(
  `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${import.meta.env.VITE_WEBSOCKET_HOST || 'localhost:3005'}`
);
