// Socket.io API endpoint for Vercel
// Note: Socket.io doesn't work well with Vercel serverless
// This is a workaround using polling and WebSocket upgrades

const { Server } = require('socket.io');

// Store active calls in memory (note: this won't persist across serverless invocations)
// For production, use Redis or a database
const activeCalls = new Map();
const userSockets = new Map();

module.exports = (req, res) => {
  if (!res.socket.server.io) {
    console.log('🔌 Initializing Socket.io server on Vercel...');
    
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true
    });

    // Initialize Socket handlers
    io.on('connection', (socket) => {
      console.log(`✅ Socket connected: ${socket.id}`);
      
      // Register user
      socket.on('register-user', (userId) => {
        socket.userId = userId;
        socket.join(userId);
        userSockets.set(userId, socket.id);
        console.log(`📝 Registering user: ${userId} with socket ${socket.id}`);
        socket.emit('registered', { userId, socketId: socket.id });
      });

      // Call initiation
      socket.on('call-user', ({ to, from, fromName, offer, callType, remoteName }) => {
        console.log(`📞 Initiating call from ${fromName} (${from}) to ${remoteName} (${to})`);
        
        const callId = `${from}-${to}-${Date.now()}`;
        activeCalls.set(callId, {
          callerId: from,
          receiverId: to,
          callType,
          status: 'ringing',
          startTime: Date.now()
        });

        // Send to recipient
        io.to(to).emit('incoming-call', {
          callId,
          from,
          fromName: fromName || 'Unknown',
          offer,
          callType,
          remoteUserId: from
        });
        
        console.log(`📞 Call notification sent to ${to}`);
      });

      // Answer call
      socket.on('answer-call', ({ to, answer, callId }) => {
        console.log(`✅ Call answered: ${callId}`);
        
        const call = activeCalls.get(callId);
        if (call) {
          call.status = 'active';
        }

        io.to(to).emit('call-answered', {
          answer,
          callId
        });
      });

      // ICE candidate exchange
      socket.on('ice-candidate', ({ to, candidate }) => {
        io.to(to).emit('ice-candidate', {
          candidate,
          from: socket.userId
        });
      });

      // Reject call
      socket.on('reject-call', ({ to, callId }) => {
        console.log(`❌ Call rejected: ${callId}`);
        
        activeCalls.delete(callId);
        
        io.to(to).emit('call-rejected', { callId });
      });

      // End call
      socket.on('end-call', ({ to, callId }) => {
        console.log(`📴 Call ended: ${callId}`);
        
        activeCalls.delete(callId);
        
        io.to(to).emit('call-ended', { callId });
      });

      // Live translation during call
      socket.on('translate-speech', ({ to, text, targetLanguage }) => {
        io.to(to).emit('translated-speech', {
          text,
          targetLanguage
        });
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`❌ Socket disconnected: ${socket.id}`);
        if (socket.userId) {
          userSockets.delete(socket.userId);
        }
      });

      // Connection error
      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
      });
    });

    res.socket.server.io = io;
    console.log('✅ Socket.io server initialized on Vercel');
  } else {
    console.log('♻️  Socket.io server already running');
  }

  res.end();
};
