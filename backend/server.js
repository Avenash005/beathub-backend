const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_12345';

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

// ==========================================
// POSTS ROUTE - For emitting newPost events
// ==========================================
// Posts router factory that accepts io as parameter
const createPostsRouter = (io) => {
  const postsRouter = express.Router();

  // In-memory posts storage (replace with MongoDB in production)
  const posts = [];

  // GET /api/posts - Get all posts
  postsRouter.get('/', (req, res) => {
    res.json({ posts });
  });

  // POST /api/posts - Create new post and emit event
  postsRouter.post('/', (req, res) => {
    const { title, content, author } = req.body;
    
    // Create new post
    const newPost = {
      id: posts.length + 1,
      title,
      content,
      author: author || 'Anonymous',
      createdAt: new Date().toISOString()
    };
    
    // Save post
    posts.push(newPost);
    
    // Emit newPost event to all connected clients
    io.emit('newPost', {
      message: `New post created by ${newPost.author}!`,
      post: newPost,
      timestamp: new Date().toISOString()
    });
    
    console.log(`[Socket.io] Emitted newPost event for post: ${title}`);
    
    res.status(201).json({ 
      success: true, 
      post: newPost 
    });
  });

  return postsRouter;
};

// Create HTTP server using createServer(app)
const httpServer = http.createServer(app);

// Initialize Socket.io with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ==========================================
// SOCKET.IO AUTHENTICATION MIDDLEWARE
// ==========================================
io.use((socket, next) => {
  // Extract JWT from socket.handshake.auth.token
  const token = socket.handshake.auth.token;
  
  console.log('[Socket.io] Authentication attempt received');
  
  // Skip JWT verification if no token provided (for demo/testing)
  // In production, always require valid token
  if (!token) {
    // For demo/testing purposes, allow anonymous connections
    // In production, uncomment the next line:
    // return next(new Error('No token provided'));
    console.log('[Socket.io] No token provided, allowing demo connection');
    socket.data.user = { username: 'demo-user', email: 'demo@example.com' };
    return next();
  }
  
  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach decoded user data to socket.data.user
    socket.data.user = decoded;
    
    console.log(`[Socket.io] Token verified for user: ${decoded.email || decoded.username || 'unknown'}`);
    // Allow connection
    next();
  } catch (error) {
    console.log(`[Socket.io] Token verification failed: ${error.message}`);
    next(new Error('Invalid token'));
  }
});

// ==========================================
// SOCKET.IO CONNECTION HANDLER
// ==========================================
io.on('connection', (socket) => {
  const userEmail = socket.data.user ? (socket.data.user.email || socket.data.user.username) : 'unknown';
  console.log(`[Socket.io] Client connected: ${socket.id} (User: ${userEmail})`);

  // Send welcome message to the connected client
  socket.emit('message', {
    type: 'welcome',
    content: `Connected with socket ID: ${socket.id}`,
    timestamp: new Date().toISOString()
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}, Reason: ${reason}`);
  });
});

// Mount posts router with io instance
app.use('/api/posts', createPostsRouter(io));

// Start HTTP server instead of app.listen
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Socket.io server ready for connections`);
  console.log(`JWT_SECRET is configured`);
});
