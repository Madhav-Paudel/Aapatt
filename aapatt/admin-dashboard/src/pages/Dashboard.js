import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { socket } from '../main.jsx';

export default function Dashboard({ apiUrl }) {
  const [activeCount, setActiveCount] = useState(0);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    function onCreated(payload) {
      setActiveCount((c) => c + 1);
      setEvents((e) => [{ type: 'created', payload, ts: Date.now() }, ...e].slice(0, 50));
    }
    socket.on('request:created', onCreated);
    return () => socket.off('request:created', onCreated);
  }, []);

  return (
    <div style={{ fontFamily: 'Inter, system-ui', padding: 24 }}>
      <h1 style={{ color: '#1565C0' }}>Aapatt Admin Dashboard</h1>
      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        <div style={{ borderLeft: '4px solid #E53935', padding: 16, background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
          <div>Active Emergencies</div>
          <div style={{ fontSize: 28, color: '#E53935' }}>{activeCount}</div>
        </div>
      </div>
      <h2 style={{ marginTop: 24 }}>Live Events</h2>
      <ul>
        {events.map((e, idx) => (
          <li key={idx}>{e.type} — {JSON.stringify(e.payload)}</li>
        ))}
      </ul>
    </div>
  );
}
