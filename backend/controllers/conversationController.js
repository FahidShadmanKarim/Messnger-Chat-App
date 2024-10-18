// controllers/conversationController.js
const conversationService = require('../services/conversationService');

// Controller function for creating a new conversation
const createConversation = async (req, res) => {
  try {
    const { participantIds } = req.body; // Expecting an array of participant IDs
    const newConversation = await conversationService.createConversation(participantIds);

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully!',
      data: newConversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function for fetching a user's conversations
const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await conversationService.getUserConversations(userId);

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function for adding a participant to a conversation
const addParticipant = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { newParticipantId } = req.body;

    const updatedConversation = await conversationService.addParticipant(conversationId, newParticipantId);

    res.status(200).json({
      success: true,
      message: 'Participant added successfully',
      data: updatedConversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const updateLastMessage = async( req,res) =>{
    
  try {

        const { conversationId } = req.params;
        const { lastMessage } = req.body;
       

        const updatedConversation = await conversationService.updateLastMessage( conversationId, lastMessage );
        console.log(updatedConversation);
        res.status(200).json({
          success:true,
          message: 'Last message updated successfully',
          data: updatedConversation,
        });

      


  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }

}

module.exports = { createConversation, getUserConversations, addParticipant,updateLastMessage };
