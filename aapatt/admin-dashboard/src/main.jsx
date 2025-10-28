import React from 'react';
import { createRoot } from 'react-dom/client';
import { io } from 'socket.io-client';
import Dashboard from './pages/Dashboard.js';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const socket = io(apiUrl, { transports: ['websocket'] });

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Dashboard apiUrl={apiUrl} />
  </React.StrictMode>
);
