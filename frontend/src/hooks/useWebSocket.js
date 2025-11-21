import { useEffect, useRef, useState } from 'react';


export default function useWebSocket(orderId) {
const [connected, setConnected] = useState(false);
const [messages, setMessages] = useState([]);
const wsRef = useRef(null);


useEffect(() => {
if (!orderId) return;


const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const host = window.location.hostname;
const port = 8000; // your Daphne port
const url = `${protocol}://${host}:${port}/ws/orders/${orderId}/`;


const ws = new WebSocket(url);
wsRef.current = ws;


ws.onopen = () => {
setConnected(true);
};


ws.onmessage = (ev) => {
try {
const data = JSON.parse(ev.data);
setMessages(prev => [...prev, data]);
} catch (e) {
console.error('invalid message', e);
}
};


ws.onclose = () => setConnected(false);
ws.onerror = (e) => console.error('ws error', e);


return () => {
ws.close();
};
}, [orderId]);


return { connected, messages, send: (payload) => wsRef.current?.send(JSON.stringify(payload)) };
}