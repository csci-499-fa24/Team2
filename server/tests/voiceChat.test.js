const http = require('http');
const WebSocket = require('ws');
const { setupWebRTCSocketServer } = require('../voiceChatServer');

describe('setupWebRTCSocketServer', () => {
  let server;
  let port;

  beforeAll((done) => {
    server = http.createServer();
    setupWebRTCSocketServer(server);
    server.listen(0, () => {
      port = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  test('establishes a WebSocket connection and sends initial info message', (done) => {
    const ws = new WebSocket(`ws://localhost:${port}/webrtc`);

    ws.on('open', () => {
      // Once open, we should receive an "info" message from the server
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data);
      expect(message.type).toBe('info');
      // The first connected client should be the initiator
      expect(message.initiator).toBe(true);
      ws.close();
      done();
    });
  });

  test('broadcasts messages from one client to all others', (done) => {
    const wsClient1 = new WebSocket(`ws://localhost:${port}/webrtc`);
    const wsClient2 = new WebSocket(`ws://localhost:${port}/webrtc`);

    let client1Ready = false;
    let client2Ready = false;

    wsClient1.on('open', () => {
      client1Ready = true;
      if (client1Ready && client2Ready) sendTestMessage();
    });

    wsClient2.on('open', () => {
      // second client will receive a different "initiator" value (false)
      client2Ready = true;
      if (client1Ready && client2Ready) sendTestMessage();
    });

    function sendTestMessage() {
      // once both clients are connected, client1 sends a message
      wsClient1.send(JSON.stringify({ type: 'chat', text: 'Hello, world!' }));
    }

    wsClient1.on('message', (data) => {
      const message = JSON.parse(data);
      // client1 will not receive its own broadcasted message back
      if (message.type === 'chat') {
        done.fail('Client1 should not receive its own message broadcast');
      }
    });

    wsClient2.on('message', (data) => {
      const message = JSON.parse(data);
      if (message.type === 'chat' && message.text === 'Hello, world!') {
        wsClient1.close();
        wsClient2.close();
        done();
      }
    });
  });

  test('removes a client from the list on close', (done) => {
    const wsClient1 = new WebSocket(`ws://localhost:${port}/webrtc`);
    const wsClient2 = new WebSocket(`ws://localhost:${port}/webrtc`);

    let client2Received = false;

    wsClient1.on('open', () => {
      // after opening, immediately close client1, this should remove it from the list.
      wsClient1.close();
    });

    wsClient1.on('close', () => {
      // once closed, let client2 send a message to ensure no errors occur
      if (wsClient2.readyState === WebSocket.OPEN) {
        wsClient2.send(JSON.stringify({ type: 'test', text: 'Are you there?' }));
      } else {
        wsClient2.on('open', () => {
          wsClient2.send(JSON.stringify({ type: 'test', text: 'Are you there?' }));
        });
      }
    });

    wsClient2.on('message', (data) => {
      const message = JSON.parse(data);
      if (message.type === 'test') {
        done.fail('Client2 should not receive its own message');
      }
    });

    setTimeout(() => {
      // if we got here without failures, it means removal worked.
      wsClient2.close();
      done();
    }, 300);
  });
});
