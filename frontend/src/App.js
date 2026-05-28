import React, { useEffect, useState } from 'react';
import { socket, connectSocket, disconnectSocket } from './services/socket';
import './App.css';

function App() {
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  // Helper to add logs to the log display
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { message, timestamp }]);
  };

  useEffect(() => {
    // Add listeners for connect, disconnect, and connect_error events
    const handleConnect = () => {
      setConnected(true);
      setSocketId(socket.id);
      setError(null);
      addLog(`Connected! Socket ID: ${socket.id}`);
      console.log(`[Socket] Connected with ID: ${socket.id}`);
    };

    const handleDisconnect = (reason) => {
      setConnected(false);
      setSocketId(null);
      addLog(`Disconnected: ${reason}`);
      console.log(`[Socket] Disconnected. Reason: ${reason}`);
    };

    const handleConnectError = (err) => {
      setError(err.message);
      addLog(`Connection Error: ${err.message}`);
      console.error(`[Socket] Connection Error:`, err);
    };

    // Add event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Call socket.connect() in useEffect as per requirements
    connectSocket();

    // Cleanup function for proper lifecycle management
    return () => {
      // Remove event listeners using socket.off()
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);

      // Disconnect socket using socket.disconnect()
      disconnectSocket();
    };
  }, []);

  // Test REST API functionality
  const testRestApi = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/home');
      const data = await response.json();
      addLog(`REST API Response: ${JSON.stringify(data)}`);
    } catch (err) {
      addLog(`REST API Error: ${err.message}`);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Creator's Platform</h1>
        <p>Socket.io Integration Demo</p>
      </header>

      <main className="App-content">
        {/* Connection Status */}
        <div className="status-card">
          <h2>Connection Status</h2>
          <p className={connected ? 'status-connected' : 'status-disconnected'}>
            {connected ? '● Connected' : '○ Disconnected'}
          </p>
          {socketId && <p>Socket ID: <code>{socketId}</code></p>}
          {error && <p className="error">Error: {error}</p>}
        </div>

        {/* REST API Test */}
        <div className="api-card">
          <h2>REST API Test</h2>
          <button onClick={testRestApi}>Test API</button>
        </div>

        {/* Socket Logs */}
        <div className="logs-card">
          <h2>Socket Logs</h2>
          <div className="logs-container">
            {logs.map((log, index) => (
              <div key={index} className="log-entry">
                <span className="log-time">[{log.timestamp}]</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
            {logs.length === 0 && <p className="no-logs">No logs yet...</p>}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
