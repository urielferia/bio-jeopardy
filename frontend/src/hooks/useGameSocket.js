import { useState, useEffect, useCallback, useRef } from 'react';

export const useGameSocket = () => {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    // Connect to the Python server on port 8000
    const host = window.location.hostname || 'localhost';
    const ws = new WebSocket(`ws://${host}:8000/ws`);

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (e) {
        console.error("Error parsing WS message", e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
      // Optional: implement reconnect logic here
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = useCallback((type, payload = {}) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...payload }));
    }
  }, []);

  return { isConnected, lastMessage, sendMessage, clearLastMessage: () => setLastMessage(null) };
};
