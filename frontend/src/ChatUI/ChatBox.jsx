import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import { Send, PhoneCall, Video, Info } from 'lucide-react';

const ChatBox = ({ selectedConversationId }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { userId, userName } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch messages
  const fetchMessages = async () => {
    if (!selectedConversationId) return;

    try {
      const response = await axios.get(`${baseUrl}/message/message/${selectedConversationId}`);
      setMessages(response.data.data);
    } catch (error) {
      console.error('Error fetching messages:', error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedConversationId]);

  // Socket connection
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedConversationId && socketRef.current) {
      socketRef.current.emit('joinConversation', {
        conversationId: selectedConversationId,
        userId,
      });

      socketRef.current.on('receiveMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('receiveMessage');
      }
    };
  }, [selectedConversationId, userId]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      content: newMessage,
      conversationId: selectedConversationId,
      sender: {
        _id: userId,
        username: userName
      },
      seen: false,
      timestamp: new Date().toISOString()
    };

    console.log(messageData);

    socketRef.current.emit('sendMessage', messageData);
    setNewMessage('');
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      {/* Chat header */}
      <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
        <h2 className="text-xl font-semibold">Chat</h2>
        <div className="flex space-x-4">
          <PhoneCall className="text-blue-500 cursor-pointer" />
          <Video className="text-blue-500 cursor-pointer" />
          <Info className="text-blue-500 cursor-pointer" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.sender._id === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg px-4 py-2 ${
                  message.sender._id === userId
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No messages yet.</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center bg-gray-100 rounded-full">
          <textarea
            className="flex-1 bg-transparent p-3 focus:outline-none resize-none"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
          />
          <button
            className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
            onClick={sendMessage}
          >
            <Send className="text-blue-500" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;