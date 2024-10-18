const User = require('../models/User');
const bcrypt = require('bcrypt');

const signup = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Create the user in the database
  const newUser = await User.create({
    email: userData.email,
    username: userData.username,
    password: hashedPassword,
  });

  return newUser;
};

const login = async (credentials) => {
  
    const { email, password } = credentials;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
  
    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid password');
    }
  
    return { userId: user._id, userEmail:user.email,userName:user.username };
  };

module.exports = { signup,login };
