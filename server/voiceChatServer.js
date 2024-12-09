const WebSocket = require('ws');

function setupWebRTCSocketServer() {
  const wss = new WebSocket.Server({ noServer: true });
  let clients = [];

  wss.on('connection', (ws) => {
    clients.push(ws);
    const clientId = clients.indexOf(ws);

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
