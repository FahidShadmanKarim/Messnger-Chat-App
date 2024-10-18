const express = require('express');
const { createConversation, getUserConversations, addParticipant,updateLastMessage } = require('../controllers/conversationController');

const router = express.Router();

// Route to create a new conversation
router.post('/create', createConversation);

// Route to get all conversations for a user
router.get('/user/:userId', getUserConversations);

// Route to add a participant to an existing conversation
router.put('/:conversationId/add-participant', addParticipant);

//route to update lastMessage
router.patch('/update-last-message/:conversationId', updateLastMessage )

module.exports = router;