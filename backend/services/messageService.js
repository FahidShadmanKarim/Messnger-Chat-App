const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const sendMessage = async (messageData) => {
  console.log('Sending message:', messageData); // Log incoming data
  const { senderId, conversationId, content } = messageData;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new Error('Conversation not found!');
  }

  const newMessage = await Message.create({
    conversationId,
    sender: senderId,
    content,
  });

  

  conversation.lastMessage = newMessage._id;
  conversation.updatedAt = Date.now();
  await conversation.save();

  return newMessage;
};


const getMessages = async (conversationId, userId) => {

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
  
  
    // Fetch and return messages
    const messages = await Message.find({ conversationId })
      .populate('sender', 'username')
      .sort({ timestamp: 1 });
  
    return messages;
  };


module.exports = { sendMessage,getMessages };
