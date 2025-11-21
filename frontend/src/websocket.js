export const connectWS = (onMessageCallback) => {
  const ws = new WebSocket(process.env.REACT_APP_WS_URL);

  ws.onopen = () => console.log("WS Connected");
  ws.onmessage = (e) => {
    console.log("WS Message:", e.data);
    if (onMessageCallback) onMessageCallback(JSON.parse(e.data));
  };
  ws.onerror = (e) => console.error("WS Error:", e);
  ws.onclose = () => {
    console.log("WS Closed, reconnecting in 3s...");
    setTimeout(() => connectWS(onMessageCallback), 3000);
  };

  return ws;
};
