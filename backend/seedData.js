const mongoose = require('mongoose');
const User = require('./models/User');  // Make sure to have User model
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const dotenv = require('dotenv');
dotenv.config();

// Connect to MongoDB

const DATABASE_URL = process.env.DATABASE_URL;
mongoose.connect(`${DATABASE_URL}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to seed users, conversation, and messages
const seedData = async () => {
  try {
    // Clear existing data (optional)
    await User.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});

    // Create two users
    const user1 = await User.create({
      username: 'user1',
      email: 'user1@example.com',
      password: 'hashed_password1',  // Use proper password hashing logic
    });
    const user2 = await User.create({
      username: 'user2',
      email: 'user2@example.com',
      password: 'hashed_password2',  // Use proper password hashing logic
    });

    // Create a conversation between the two users
    const conversation = await Conversation.create({
      participants: [user1._id, user2._id],
    });

    // Create messages in the conversation
    const message1 = await Message.create({
      content: 'Hello, user2!',
      conversationId: conversation._id,
      sender: user1._id,
      timestamp: new Date(),
    });

    const message2 = await Message.create({
      content: 'Hi, user1! How are you?',
      conversationId: conversation._id,
      sender: user2._id,
      timestamp: new Date(),
    });

    // Update the conversation with the last message
    conversation.lastMessage = message2._id;  // Set last message to the most recent one
    await conversation.save();

    console.log('Seeding completed successfully!');
    process.exit();  // Exit the script
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);  // Exit the script with an error
  }
};

// Run the seed function
seedData();
