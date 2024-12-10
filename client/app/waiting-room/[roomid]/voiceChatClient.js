import React, { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';

function VoiceChat({ signalingServerUrl }) {
  const [initiator, setInitiator] = useState(false);
  const [roleSet, setRoleSet] = useState(false);
  const wsRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const checkIntervalRef = useRef(null);

  useEffect(() => {
    // Ensure role is set to empty string initially if it doesn't exist
    if (!localStorage.getItem('role')) {
      localStorage.setItem('role', '');
    }

    // Start an interval that checks for role changes
    checkIntervalRef.current = setInterval(() => {
      const currentRole = localStorage.getItem('role');
      if (currentRole === 'initiator' || currentRole === 'responder') {
        clearInterval(checkIntervalRef.current);
        const isInitiator = currentRole === 'initiator';
        setInitiator(isInitiator);
        setRoleSet(true);
      }
    }, 500); // check every half second

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Once roleSet is true, we know initiator is set
    // Connect to the signaling server and set up peer.
    if (roleSet) {
      wsRef.current = new WebSocket(signalingServerUrl);

      wsRef.current.onopen = async () => {
        console.log('Connected to signaling server');
        // Once connected, immediately set up the peer
        await setupPeer(initiator);
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // If we receive a signal from the other peer, forward it to the SimplePeer instance
        if (data.signal && peerRef.current) {
          peerRef.current.signal(data.signal);
        }
      };

      wsRef.current.onclose = () => {
        console.log('Signaling server connection closed');
      };

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
        if (peerRef.current) {
          peerRef.current.destroy();
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleSet]);

  async function setupPeer(isInitiator) {
    // Get local audio stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // Create a new SimplePeer instance
      peerRef.current = new SimplePeer({
        initiator: isInitiator,
        trickle: false,
        stream: stream
      });

      peerRef.current.on('signal', (data) => {
        // Send signaling data to the other peer via the server
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ signal: data }));
        }
      });

      peerRef.current.on('connect', () => {
        console.log('Peer connected!');
      });

      peerRef.current.on('stream', (remoteStream) => {
        // When we get a remote stream, play it
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.play().catch((err) => {
            console.error('Play failed', err);
          });
        }
      });

      peerRef.current.on('error', (err) => {
        console.error('Peer error:', err);
      });

    } catch (err) {
      console.error('Error getting user media:', err);
    }
  }

  return (
    <div>
      <h2>Voice Chat</h2>
      {!roleSet && <p>Waiting for role to be set in localStorage...</p>}
      {roleSet && <p>{initiator ? 'You are the initiator' : 'You are a responder'}</p>}
      <audio ref={remoteAudioRef} autoPlay playsInline controls={false} />
    </div>
  );
}

export default VoiceChat;
