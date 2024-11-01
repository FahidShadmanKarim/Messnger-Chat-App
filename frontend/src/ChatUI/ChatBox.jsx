import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import { Send, PhoneCall, Video, Info, Paperclip, Smile } from 'lucide-react';

const ChatBox = ({ selectedConversationId, onlineUsers = {} }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { userId, userName } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState({});
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(baseUrl, {
      query: { userId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Socket connection handlers
    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      setError(null);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Failed to connect to chat server');
    });

    // Handle page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && socketRef.current) {
        if (!socketRef.current.connected) {
          socketRef.current.connect();
        }
      }
    };

    // Handle before unload
    const handleBeforeUnload = (e) => {
      if (socketRef.current) {
        socketRef.current.emit('userDisconnecting', { userId });
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (socketRef.current) {
        socketRef.current.emit('userDisconnecting', { userId });
        socketRef.current.disconnect();
      }
    };
  }, [userId, baseUrl]);

  // Fetch messages
  const fetchMessages = async () => {
    if (!selectedConversationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${baseUrl}/message/message/${selectedConversationId}`);
      setMessages(response.data.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle conversation change
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages();
      
      // Join the conversation room
      if (socketRef.current) {
        socketRef.current.emit('joinConversation', {
          conversationId: selectedConversationId,
          userId,
        });
      }
    }

    return () => {
      // Clear typing status when leaving conversation
      if (socketRef.current && selectedConversationId) {
        socketRef.current.emit('typing', {
          conversationId: selectedConversationId,
          isTyping: false
        });
      }
    };
  }, [selectedConversationId]);

  // Handle socket events for messages and typing
  useEffect(() => {
    if (!socketRef.current) return;

    // Handle incoming messages
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    // Handle typing status
    const handleTyping = ({ userId: typingUserId, conversationId, isTyping }) => {
      if (conversationId === selectedConversationId && typingUserId !== userId) {
        setOtherUserTyping(prev => ({
          ...prev,
          [typingUserId]: isTyping
        }));
      }
    };

    socketRef.current.on('receiveMessage', handleNewMessage);
    socketRef.current.on('userTyping', handleTyping);

    return () => {
      socketRef.current.off('receiveMessage', handleNewMessage);
      socketRef.current.off('userTyping', handleTyping);
    };
  }, [selectedConversationId, userId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing status
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socketRef.current || !selectedConversationId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Only emit if not already typing
    if (!typing) {
      setTyping(true);
      socketRef.current.emit('typing', {
        conversationId: selectedConversationId,
        isTyping: true
      });
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socketRef.current.emit('typing', {
        conversationId: selectedConversationId,
        isTyping: false
      });
    }, 1000);
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId || !socketRef.current) return;

    const messageData = {
      content: newMessage.trim(),
      conversationId: selectedConversationId,
      sender: {
        _id: userId,
        username: userName
      },
      seen: false,
      timestamp: new Date().toISOString()
    };

    try {
      // Optimistically add message to UI
      const optimisticMessage = { ...messageData, _id: Date.now().toString() };
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');

      // Stop typing indicator
      socketRef.current.emit('typing', {
        conversationId: selectedConversationId,
        isTyping: false
      });

      // Send message through socket
      socketRef.current.emit('sendMessage', messageData, (response) => {
        if (response.error) {
          console.error('Error sending message:', response.error);
          // Remove optimistic message and show error
          setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
          setError('Failed to send message');
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
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
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold">Chat</h2>
          {Object.values(otherUserTyping).some(Boolean) && (
            <span className="text-sm text-gray-500 italic">Someone is typing...</span>
          )}
        </div>
        <div className="flex space-x-4">
          <PhoneCall className="text-blue-500 cursor-pointer" />
          <Video className="text-blue-500 cursor-pointer" />
          <Info className="text-blue-500 cursor-pointer" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center">
            <span className="text-gray-500">Loading messages...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center">
            <span className="text-red-500">{error}</span>
          </div>
        ) : messages.length > 0 ? (
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
                {message.sender._id !== userId && (
                  <p className="text-xs font-semibold mb-1">
                    {message.sender.username}
                    {onlineUsers[message.sender._id] && 
                      <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    }
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                <div className="flex justify-end items-center space-x-2 mt-1">
                  <p className="text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  {message.seen && message.sender._id === userId && (
                    <span className="text-xs opacity-70">✓✓</span>
                  )}
                </div>
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
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Paperclip size={20} className="text-gray-500" />
          </button>
          <div className="flex-1 flex items-center bg-gray-100 rounded-full">
            <textarea
              className="flex-1 bg-transparent p-3 focus:outline-none resize-none max-h-32"
              placeholder="Type a message..."
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button className="p-2 hover:bg-gray-200 rounded-full">
              <Smile size={20} className="text-gray-500" />
            </button>
          </div>
          <button
            className={`p-3 rounded-full ${
              newMessage.trim() 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-gray-200'
            }`}
            onClick={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Send 
              className={newMessage.trim() ? 'text-white' : 'text-gray-400'} 
              size={20} 
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;