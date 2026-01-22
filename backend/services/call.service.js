// WebRTC Signaling with Socket.io
const socketManager = require('./socket/socketManager');

// Store active call sessions
const activeCalls = new Map();

class CallService {
  initializeSocketHandlers(io) {
    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);
      
      // User joins with their ID
      socket.on('register-user', (userId) => {
        socket.userId = userId;
        socket.join(userId);
        console.log(`User ${userId} registered with socket ${socket.id}`);
      });

      // Initiate call
      socket.on('call-user', async ({ to, from, offer, callType }) => {
        console.log(`Call initiated: ${from} calling ${to}, type: ${callType}`);
        
        // Store call information
        const callId = `${from}-${to}-${Date.now()}`;
        activeCalls.set(callId, {
          callerId: from,
          receiverId: to,
          callType,
          status: 'ringing',
          startTime: Date.now()
        });

        // Send call notification to receiver
        io.to(to).emit('incoming-call', {
          callId,
          from,
          offer,
          callType
        });
      });

      // Answer call
      socket.on('answer-call', ({ to, answer, callId }) => {
        console.log(`Call answered: ${callId}`);
        
        // Update call status
        const call = activeCalls.get(callId);
        if (call) {
          call.status = 'active';
        }

        // Send answer to caller
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

      // End call
      socket.on('end-call', ({ callId, to }) => {
        console.log(`Call ended: ${callId}`);
        
        // Remove from active calls
        const call = activeCalls.get(callId);
        if (call) {
          call.status = 'ended';
          call.endTime = Date.now();
          call.duration = Math.floor((call.endTime - call.startTime) / 1000);
          
          // Notify other party
          if (to) {
            io.to(to).emit('call-ended', { callId });
          }
          
          // Clean up after 30 seconds
          setTimeout(() => {
            activeCalls.delete(callId);
          }, 30000);
        }
      });

      // Reject call
      socket.on('reject-call', ({ callId, to }) => {
        console.log(`Call rejected: ${callId}`);
        
        const call = activeCalls.get(callId);
        if (call) {
          call.status = 'rejected';
          activeCalls.delete(callId);
          
          // Notify caller
          io.to(to).emit('call-rejected', { callId });
        }
      });

      // Translation during call
      socket.on('translate-speech', async ({ text, from, to, targetUserId }) => {
        try {
          const translationService = require('./translation.service');
          const translated = await translationService.translate(text, from, to);
          
          // Send translated text to the other party
          io.to(targetUserId).emit('translated-speech', {
            original: text,
            translated,
            fromLang: from,
            toLang: to
          });
        } catch (error) {
          console.error('Translation error:', error);
        }
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        
        // End any active calls for this user
        for (const [callId, call] of activeCalls.entries()) {
          if (call.callerId === socket.userId || call.receiverId === socket.userId) {
            const otherUserId = call.callerId === socket.userId ? call.receiverId : call.callerId;
            io.to(otherUserId).emit('call-ended', { callId, reason: 'user-disconnected' });
            activeCalls.delete(callId);
          }
        }
      });
    });
  }

  getActiveCall(callId) {
    return activeCalls.get(callId);
  }

  getAllActiveCalls() {
    return Array.from(activeCalls.values());
  }
}

module.exports = new CallService();
