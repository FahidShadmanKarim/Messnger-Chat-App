const User = require('../models/User'); // Adjust the path based on your project structure

// Fetch users by IDs
const getUsersByIds = async (userIds) => {
  try {
    const users = await User.find({ _id: { $in: userIds } }, 'username'); // Only fetch usernames
    return users;
  } catch (error) {
    throw new Error('Error fetching users: ' + error.message);
  }
};

module.exports = {
  getUsersByIds,
};