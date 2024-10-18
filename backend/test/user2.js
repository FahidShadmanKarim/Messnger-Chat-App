const io = require('socket.io-client');

// Connect to the server
const socket = io('http://localhost:5000');

// When connected, join a conversation
socket.on('connect', () => {
  console.log('Connected to the server:', socket.id);

  // User 2 joins conversation
  socket.emit('joinConversation', {
    conversationId: '123456',  // Replace with actual conversationId
    userId: 'user2Id'          // Replace with actual user2Id
  });

  // Send a message
  socket.emit('sendMessage', {
    conversationId: '123456',
    senderId: 'user2Id',
    content: 'Hello from User 2!'
  });
});

// Listen for new messages
socket.on('receiveMessage', (message) => {
  console.log('Message received:', message);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
