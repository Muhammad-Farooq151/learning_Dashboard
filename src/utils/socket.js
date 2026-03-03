"use client";

import { io } from 'socket.io-client';
import { getStoredToken } from './authStorage';

let socket = null;

export const connectSocket = () => {
  if (socket?.connected) {
    return socket;
  }

  const token = getStoredToken();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  socket = io(API_URL.replace('/api', ''), {
    auth: {
      token: token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('[Socket.io] Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('[Socket.io] Disconnected from server');
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket.io] Connection error:', error.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  if (!socket || !socket.connected) {
    return connectSocket();
  }
  return socket;
};
