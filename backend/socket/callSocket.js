const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle call signaling
    socket.on('call:offer', ({ callId, receiverId, offer }) => {
      console.log(`Call offer from ${socket.userId} to ${receiverId}`);
      io.to(`user:${receiverId}`).emit('call:incoming', {
        callId,
        callerId: socket.userId,
        offer
      });
    });

    socket.on('call:answer', ({ callId, callerId, answer }) => {
      console.log(`Call answer from ${socket.userId} to ${callerId}`);
      io.to(`user:${callerId}`).emit('call:answered', {
        callId,
        answer
      });
    });

    socket.on('call:ice-candidate', ({ callId, targetId, candidate }) => {
      io.to(`user:${targetId}`).emit('call:ice-candidate', {
        callId,
        candidate
      });
    });

    socket.on('call:reject', ({ callId, callerId }) => {
      console.log(`Call rejected by ${socket.userId}`);
      io.to(`user:${callerId}`).emit('call:rejected', { callId });
    });

    socket.on('call:end', ({ callId, targetId }) => {
      console.log(`Call ended by ${socket.userId}`);
      io.to(`user:${targetId}`).emit('call:ended', { callId });
    });

    // Handle transcript updates
    socket.on('transcript:update', ({ callId, targetId, speaker, text }) => {
      io.to(`user:${targetId}`).emit('transcript:segment', {
        callId,
        speaker,
        text,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };
