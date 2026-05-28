const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// REST API Routes (must continue working)
app.get('/api/home', (req, res) => {
  res.json({ message: 'Welcome to Creator\'s Platform API', status: 'online' });
});

app.get('/api/users', (req, res) => {
  res.json({ users: ['User1', 'User2', 'User3'] });
});

app.post('/api/data', (req, res) => {
  res.json({ received: req.body, status: 'success' });
});

// Create HTTP server using createServer(app)
const httpServer = http.createServer(app);

// Initialize Socket.io with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection event handler
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Send welcome message to the connected client
  socket.emit('message', {
    type: 'welcome',
    content: `Connected with socket ID: ${socket.id}`,
    timestamp: new Date().toISOString()
  });

  // Socket.io disconnect event handler
  socket.on('disconnect', (reason) => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}, Reason: ${reason}`);
  });
});

// Start HTTP server instead of app.listen
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Socket.io server ready for connections`);
});
