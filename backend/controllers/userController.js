// controllers/userController.js

const User = require('../models/User');

// Controller function to handle user search
const searchUsers = async (req, res) => {
  const searchTerm = req.query.q; // Get the search term from the query parameter

  try {
    const users = await User.find({
      $or: [
        { username: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive match for username
        { email: { $regex: searchTerm, $options: 'i' } },    // Case-insensitive match for email
      ],
    });

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error searching users' });
  }
};

module.exports = { searchUsers };
