// services/conversationService.js
const Conversation = require('../models/Conversation');

// Create a new conversation
const createConversation = async (participantIds) => {
  // Ensure participantIds are unique and valid
  if (!participantIds || participantIds.length < 2) {
    throw new Error('At least two participants are required to create a conversation');
  }

  // Create a new conversation with the given participants
  const newConversation = await Conversation.create({
    participants: participantIds,
    createdAt: Date.now(),
    lastMessage: null, // Initially no messages in the conversation
  });

  return newConversation;
};

// Fetch conversations for a specific user
const getUserConversations = async (userId) => {
  // Find all conversations where the user is a participant
  const conversations = await Conversation.find({ participants: userId })
    .populate('participants', 'username') // Populate usernames of participants
    .sort({ updatedAt: -1 }); // Sort by most recent activity

  return conversations;
};

const updateLastMessage = async( conversationId , lastMessage ) => {
    
  const conversations = await Conversation.findById(conversationId);
  console.log(conversations.lastMessage);
  console.log(lastMessage);
 
  conversations.lastMessage = lastMessage || conversations.lastMessage;
  conversations.save();

  return conversations;
  
}

// Add a new participant to a conversation
const addParticipant = async (conversationId, newParticipantId) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Add the new participant if they're not already in the conversation
  if (!conversation.participants.includes(newParticipantId)) {
    conversation.participants.push(newParticipantId);
    await conversation.save();
  }

  return conversation;
};

module.exports = {
  createConversation,
  getUserConversations,
  addParticipant,
  updateLastMessage,
};
