// src/components/OrderTracker.jsx
import React, { useEffect, useState, useRef } from "react";

export default function OrderTracker({ orderId }) {
  const [updates, setUpdates] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!orderId) return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";

    // 🚀 Correct WebSocket URL (go through Nginx at port 3000)
    const wsUrl = `${protocol}://${window.location.hostname}:8000/ws/orders/${orderId}/`;


    console.log("Connecting WebSocket to:", wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected for order:", orderId);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed for order:", orderId);
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        setUpdates((prev) => [...prev, data]);
      } catch (err) {
        console.error("WebSocket JSON parse error:", err);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [orderId]);

  return (
    <div>
      <h3>Order {orderId} – Live Updates</h3>
      <ul>
        {updates.map((u, i) => (
          <li key={i}>
            {u.event ? `${u.event} — ${JSON.stringify(u)}` : JSON.stringify(u)}
          </li>
        ))}
      </ul>
    </div>
  );
}
