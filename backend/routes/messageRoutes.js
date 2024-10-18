const express = require('express');
const { sendMessage, getMessages } = require('../controllers/messageController');

const router = express.Router();

// POST request to send a message
router.post('/send', sendMessage);

// GET request to get messages for a conversation
router.get('/message/:conversationId', getMessages);

module.exports = router;

