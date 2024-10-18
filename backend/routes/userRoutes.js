const express = require('express');
const { searchUsers } = require('../controllers/userController'); // Import the search controller
const router = express.Router();

// Route to search users by username or email
router.get('/search', searchUsers);

module.exports = router;