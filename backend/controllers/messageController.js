const messageService = require('../services/messageService');

// Controller function for sending a message
const sendMessage = async (req, res) => {
  console.log('Request body:', req.body); // Log the request body
  try {
    const { senderId, conversationId, content } = req.body;

    const newMessage = await messageService.sendMessage({
      senderId,
      conversationId,
      content,
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: newMessage,
    });
  } catch (error) {
    console.error('Error in sendMessage controller:', error.message); // Log any error
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMessages = async (req, res) => {
    try {
      const { conversationId } = req.params;
      
      // Call the service to fetch the messages
      const messages = await messageService.getMessages(conversationId);

  
      // Respond with the messages
      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  
module.exports = { sendMessage, getMessages };

