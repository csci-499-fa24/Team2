const WebSocket = require('ws');

let wss;
let clients = [];

function setupWebRTCSocketServer() {
  // Create a WebSocket server on a separate port or on the same server.
  // For simplicity, we assume it's on port 8081. Adjust as needed.
  wss = new WebSocket.Server({ port: 8081 });

  wss.on('connection', (ws) => {
    clients.push(ws);
    const clientId = clients.indexOf(ws);

    // Send initial info message so the client knows if it should be initiator
    // For simplicity: the first client connected will be the initiator.
    // All subsequent clients are responders.
    const isInitiator = clientId === 0;
    ws.send(JSON.stringify({ type: 'info', initiator: isInitiator }));

    ws.on('message', (message) => {
      let parsed;
      try {
        parsed = JSON.parse(message);
      } catch (err) {
        console.error('Failed to parse message', err);
        return;
      }

      // Broadcast this signaling message to all other connected clients
      // except the sender
      clients.forEach((client, index) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsed));
        }
      });
    });

    ws.on('close', () => {
      clients = clients.filter((client) => client !== ws);
    });
  });

  console.log('WebRTC signaling server is running on ws://localhost:8081');
}

module.exports = { setupWebRTCSocketServer };
