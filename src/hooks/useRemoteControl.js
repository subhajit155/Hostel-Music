import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';

// STUN server configuration for robust NAT traversal
const PEER_CONFIG = {
  debug: 0,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
    ],
  },
};

const ROOM_PREFIX = 'hm-host-';

export const useRemoteControl = ({
  isHost = true,
  roomPin: initialPin = '',
  onCommandReceived = null,
  currentState = null,
} = {}) => {
  const [roomPin, setRoomPin] = useState(initialPin || '');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevicesCount, setConnectedDevicesCount] = useState(0);
  const [remoteState, setRemoteState] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle | connecting | connected | error | disconnected
  const [errorMessage, setErrorMessage] = useState('');

  const peerRef = useRef(null);
  const connectionsRef = useRef([]); // for host: list of client DataConnections
  const clientConnRef = useRef(null); // for client: connection to host
  const onCommandReceivedRef = useRef(onCommandReceived);
  const currentStateRef = useRef(currentState);

  useEffect(() => {
    onCommandReceivedRef.current = onCommandReceived;
  }, [onCommandReceived]);

  useEffect(() => {
    currentStateRef.current = currentState;
  }, [currentState]);

  // Generate a random 6-digit numeric PIN for easy typing
  const generatePin = useCallback(() => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }, []);

  // ── HOST MODE ─────────────────────────────────────────────────────────────
  const initHost = useCallback((customPin = '') => {
    if (peerRef.current) {
      peerRef.current.destroy();
    }

    const pin = customPin || generatePin();
    setRoomPin(pin);
    setConnectionStatus('connecting');
    setErrorMessage('');

    const peerId = `${ROOM_PREFIX}${pin}`;
    const peer = new Peer(peerId, PEER_CONFIG);
    peerRef.current = peer;

    peer.on('open', () => {
      setConnectionStatus('connected');
    });

    peer.on('connection', (conn) => {
      connectionsRef.current.push(conn);
      setConnectedDevicesCount(connectionsRef.current.length);

      conn.on('open', () => {
        // Send initial state snapshot to newly connected mobile remote
        if (currentStateRef.current) {
          conn.send({
            type: 'STATE_SYNC',
            payload: currentStateRef.current,
          });
        }
      });

      conn.on('data', (data) => {
        if (data && typeof data === 'object' && onCommandReceivedRef.current) {
          onCommandReceivedRef.current(data);
        }
      });

      const cleanupConn = () => {
        connectionsRef.current = connectionsRef.current.filter((c) => c !== conn);
        setConnectedDevicesCount(connectionsRef.current.length);
      };

      conn.on('close', cleanupConn);
      conn.on('error', cleanupConn);
    });

    peer.on('error', (err) => {
      // If PIN is taken, regenerate and retry
      if (err.type === 'unavailable-id') {
        const nextPin = generatePin();
        initHost(nextPin);
      } else {
        setErrorMessage(err.message || 'Peer connection error');
        setConnectionStatus('error');
      }
    });

    peer.on('disconnected', () => {
      peer.reconnect();
    });
  }, [generatePin]);

  // Broadcast state changes from Host to all connected Mobile Remotes
  const broadcastState = useCallback((statePayload) => {
    if (!connectionsRef.current.length) return;
    const msg = { type: 'STATE_SYNC', payload: statePayload };
    connectionsRef.current.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send(msg);
        } catch {
          /* connection error handled in listener */
        }
      }
    });
  }, []);

  // ── CLIENT / REMOTE MODE ──────────────────────────────────────────────────
  const connectToHost = useCallback((targetPin) => {
    if (!targetPin) return;

    if (peerRef.current) {
      peerRef.current.destroy();
    }

    setRoomPin(targetPin);
    setConnectionStatus('connecting');
    setErrorMessage('');

    const clientPeer = new Peer(PEER_CONFIG);
    peerRef.current = clientPeer;

    clientPeer.on('open', () => {
      const hostPeerId = `${ROOM_PREFIX}${targetPin}`;
      const conn = clientPeer.connect(hostPeerId, { reliable: true });
      clientConnRef.current = conn;

      conn.on('open', () => {
        setIsConnected(true);
        setConnectionStatus('connected');
      });

      conn.on('data', (data) => {
        if (data && data.type === 'STATE_SYNC' && data.payload) {
          setRemoteState(data.payload);
        }
      });

      conn.on('close', () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        setErrorMessage('Host disconnected. Check your connection or reconnect.');
      });

      conn.on('error', (err) => {
        setIsConnected(false);
        setConnectionStatus('error');
        setErrorMessage(err.message || 'Failed to connect to host');
      });
    });

    clientPeer.on('error', (err) => {
      setIsConnected(false);
      setConnectionStatus('error');
      if (err.type === 'peer-unavailable') {
        setErrorMessage(`Host code "${targetPin}" not found. Make sure the laptop tab is open.`);
      } else {
        setErrorMessage(err.message || 'Connection error. Please try again.');
      }
    });
  }, []);

  // Send command from Mobile Remote to Host Laptop
  const sendCommand = useCallback((cmd) => {
    if (clientConnRef.current && clientConnRef.current.open) {
      try {
        clientConnRef.current.send(cmd);
        // Haptic feedback on supported mobile devices
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(25);
        }
        return true;
      } catch (err) {
        console.error('Error sending command to host:', err);
      }
    }
    return false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  return {
    roomPin,
    isConnected,
    connectedDevicesCount,
    connectionStatus,
    errorMessage,
    remoteState,
    initHost,
    broadcastState,
    connectToHost,
    sendCommand,
  };
};
