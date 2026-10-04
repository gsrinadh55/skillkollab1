import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.emitQueue = [];
  }

  connect(userId, token) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(SOCKET_URL, {
      auth: { token, userId },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    // Attach any queued listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket.on(event, callback);
      });
    });
    this.listeners.clear();

    this.socket.on('connect', () => {
      console.log('⚡ [Socket.IO] Connected successfully with ID:', this.socket.id);
      this.isConnected = true;
      window.dispatchEvent(new CustomEvent('socket_status', { detail: { connected: true } }));
      
      // Flush emit queue
      this.emitQueue.forEach(({ event, data, callback }) => {
        this.socket.emit(event, data, callback);
      });
      this.emitQueue = [];
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ [Socket.IO] Disconnected:', reason);
      this.isConnected = false;
      window.dispatchEvent(new CustomEvent('socket_status', { detail: { connected: false } }));
    });

    this.socket.on('connect_error', (error) => {
      console.warn('🔇 [Socket.IO] Connection attempt failed (offline demo fallback active):', error.message);
      this.isConnected = false;
    });

    return this.socket;
  }

  emit(event, data, callback) {
    if (!this.socket || !this.isConnected) {
      console.warn(`[Socket.IO Offline] Event '${event}' queued for later.`, data);
      this.emitQueue.push({ event, data, callback });
      return;
    }
    this.socket.emit(event, data, callback);
  }

  on(event, callback) {
    if (!this.socket) {
      // Register for later when connected
      if (!this.listeners.has(event)) this.listeners.set(event, []);
      this.listeners.get(event).push(callback);
      return;
    }
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) {
      if (this.listeners.has(event)) {
        this.listeners.set(event, this.listeners.get(event).filter(cb => cb !== callback));
      }
      return;
    }
    this.socket.off(event, callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export const socketService = new SocketService();
export default socketService;
