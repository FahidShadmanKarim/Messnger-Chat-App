const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const userRoutes = require('./routes/userRoutes');
const socketHandler = require('./socketHandler');

const app = express();
const server = http.createServer(app);


connectDB();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/message', messageRoutes);
app.use('/conversation', conversationRoutes);
app.use('/users',userRoutes);

socketHandler(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});