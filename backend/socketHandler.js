const { Server } = require('socket.io');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const { redisClient } = require('./config/redisClient');

const HEARTBEAT_INTERVAL = 10000; // 10 seconds for checking inactive users
const OFFLINE_TIMEOUT = 30000; // 30 seconds without heartbeat to mark offline

const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Middleware for user authentication
  io.use((socket, next) => {
    const userId = socket.handshake.query.userId;
    if (!userId) {
      return next(new Error('Authentication error: userId is required'));
    }
    socket.userId = userId;
    next();
  });

  // Helper to manage user connections
  const addUserConnection = async (userId, socketId) => {
    try {
      await redisClient.sAdd(`user:${userId}:sockets`, socketId);
      await redisClient.set(`user:${userId}:online`, String(true));
      await redisClient.set(`user:${userId}:lastHeartbeat`, Date.now());
      io.emit('updateUserStatus', { userId, status: 'online' });
      console.log(`[${new Date().toISOString()}] User ${userId} connected with socket ID ${socketId}`);
    } catch (error) {
      console.error('Error adding user connection:', error);
    }
  };

  const removeUserConnection = async (userId, socketId) => {
    try {
      await redisClient.sRem(`user:${userId}:sockets`, socketId);
      const remainingSockets = await redisClient.sCard(`user:${userId}:sockets`);
      if (remainingSockets === 0) {
        await redisClient.set(`user:${userId}:online`, String(false));
        io.emit('updateUserStatus', { userId, status: 'offline' });
      }
      console.log(`[${new Date().toISOString()}] User ${userId} disconnected from socket ID ${socketId}`);
    } catch (error) {
      console.error('Error removing user connection:', error);
    }
  };

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    await addUserConnection(userId, socket.id);

    // Heartbeat listener to update last activity time
    socket.on('heartbeat', async () => {
      await redisClient.set(`user:${userId}:lastHeartbeat`, Date.now());
    });

    // Join conversation room
    socket.on('joinConversation', ({ conversationId }) => {
      socket.join(conversationId);
      console.log(`User ${userId} joined conversation ${conversationId}`);
    });

    // Handle user typing status
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit('userTyping', {
        userId,
        conversationId,
        isTyping,
      });
    });

    // Handle incoming messages
    socket.on('sendMessage', async (messageData, callback) => {
      try {
        const newMessage = new Message({
          content: messageData.content,
          conversationId: messageData.conversationId,
          sender: messageData.sender,
          timestamp: new Date(),
        });

        await newMessage.save();

        // Emit message to all in the conversation
        io.to(messageData.conversationId).emit('receiveMessage', newMessage);

        // Update the last message for the conversation
        await Conversation.findByIdAndUpdate(messageData.conversationId, {
          lastMessage: newMessage._id,
          updatedAt: new Date(),
        });

        callback({ success: true });
      } catch (error) {
        console.error('Error sending message:', error);
        callback({ error: 'Failed to send message' });
      }
    });

    // Handle disconnect event
    socket.on('disconnect', async () => {
      await removeUserConnection(userId, socket.id);
    });
  });

  // Periodic check for inactive users based on heartbeats
  const checkForInactiveUsers = async () => {
    try {
      const userKeys = await redisClient.keys('user:*:lastHeartbeat');
      const now = Date.now();

      for (const userKey of userKeys) {
        const lastHeartbeat = await redisClient.get(userKey);
        if (now - lastHeartbeat > OFFLINE_TIMEOUT) {
          const userId = userKey.split(':')[1];
          await redisClient.set(`user:${userId}:online`, String(false));
          io.emit('updateUserStatus', { userId, status: 'offline' });
          console.log(`User ${userId} marked offline due to inactivity`);
        }
      }
    } catch (error) {
      console.error('Error checking inactive users:', error);
    }
  };

  // Run the heartbeat check every HEARTBEAT_INTERVAL
  setInterval(checkForInactiveUsers, HEARTBEAT_INTERVAL);
};

module.exports = socketHandler;
