import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000';

// Create socket instance with autoConnect: false
// This allows manual control over when the connection is established
export const socket = io(SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

// Helper functions for socket management
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
