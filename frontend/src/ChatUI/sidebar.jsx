import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Search, Settings, Edit, LogOut } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const Sidebar = ({ setSelectedConversation }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { userId, logout } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlineUsers, setOnlineUsers] = useState({});
  const navigate = useNavigate();
  const socket = React.useRef(null);

  // Set up socket connection
  useEffect(() => {
    socket.current = io(baseUrl, {
      query: { userId },
    });

    // Emit the "userOnline" event to notify others that this user is online
    socket.current.emit('userOnline', { userId });

    // Listen for online/offline status updates
    socket.current.on('updateUserStatus', ({ userId: updatedUserId, status }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [updatedUserId]: status === 'online',
      }));

    });

    // Listen for all active users from server
    socket.current.on('allActiveUsers', (activeUsers) => {
      setOnlineUsers(activeUsers); // Set all active users
      console.log(activeUsers)
    });

    // Clean up and notify the server when the user disconnects
    return () => {
      socket.current.emit('userOffline', { userId });
      socket.current.disconnect();
    };
  }, [baseUrl, userId]);

  // Fetch conversations for the user
  const fetchConversations = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/conversation/user/${userId}`);
      setConversations(response.data.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [userId, baseUrl]);

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId, fetchConversations]);

  const handleLogout = async () => {
    try {
      socket.current.emit('userOffline', { userId });
      await logout();
      navigate('/login');
      // Update onlineUsers to set the current user offline
      setOnlineUsers((prev) => ({ ...prev, [userId]: false }));
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Get user initials for avatars
  const getInitials = (username) => {
    if (!username) return '';
    return username.split(' ').map((word) => word[0]).join('');
  };

  // Handle user search input
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() !== '') {
      try {
        const response = await axios.get(`${baseUrl}/users/search?q=${value}`);
        setSearchResults(response.data.data);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Handle user click to initiate chat
  const handleUserClick = async (userIdToChatWith) => {
    try {
      let conversation = conversations.find((conv) =>
        conv.participants.some((participant) => participant._id === userIdToChatWith)
      );

      if (!conversation) {
        const response = await axios.post(`${baseUrl}/conversation/create`, {
          participantIds: [userId, userIdToChatWith],
        });
        conversation = response.data.data;
        setConversations((prevConversations) => [...prevConversations, conversation]);
      }

      setSelectedConversation(conversation._id);
      setSearchResults([]);
      setSearchTerm('');
    } catch (error) {
      console.error('Error handling user click:', error);
    }
  };

  return (
    <div className="w-80 h-screen bg-gray-100 flex flex-col border-r border-gray-300">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-gray-300">
        <h2 className="text-2xl font-bold text-gray-800">Chats</h2>
        <div className="flex space-x-2">
          <button className="p-2 rounded-full hover:bg-gray-200">
            <Settings size={20} className="text-gray-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-200">
            <Edit size={20} className="text-gray-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-200" onClick={handleLogout}>
            <LogOut size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search Messenger"
            className="w-full py-2 pl-10 pr-4 rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search size={20} className="absolute left-3 top-2 text-gray-500" />
        </div>
      </div>

      {/* Display search results or conversation list */}
      <ul className="flex-1 overflow-y-auto">
        {searchTerm && searchResults.length > 0 ? (
          searchResults.map((user) => (
            <li
              key={user._id}
              className="px-4 py-3 flex items-center space-x-3 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleUserClick(user._id)}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden bg-gray-300 flex items-center justify-center text-white font-bold">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={`${user.username}'s avatar`}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-xl">{getInitials(user.username)}</span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center">
                  {/* Online/Offline Status Indicator */}
                  <div
                    className={`w-3 h-3 rounded-full ${
                      onlineUsers[user._id] ? 'bg-green-500' : 'bg-red-500'
                    } mr-2`}
                  />
                  <p className="font-semibold text-gray-800">{user.username}</p>
                </div>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </li>
          ))
        ) : conversations.length > 0 ? (
          conversations
            .filter((conversation) => conversation.lastMessage !== null)
            .map((conversation) => (
              <li
                key={conversation._id}
                className="px-4 py-3 flex items-center space-x-3 hover:bg-gray-200 cursor-pointer"
                onClick={() => setSelectedConversation(conversation._id)}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden bg-gray-300 flex items-center justify-center text-white font-bold">
                  {conversation.participants
                    ?.filter((participant) => participant?._id !== userId)
                    .map((participant) => (
                      <div key={participant._id} className="relative">
                        {participant?.avatarUrl ? (
                          <img
                            src={participant.avatarUrl}
                            alt={`${participant.username}'s avatar`}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span key={participant._id} className="text-xl">
                            {getInitials(participant?.username)}
                          </span>
                        )}

                        {/* Online/Offline Status Indicator */}
                        <div
                          className={`w-3 h-3 rounded-full absolute bottom-0 right-0 border-2 border-white ${
                            onlineUsers[participant._id] ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                    ))}
                </div>

                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="font-semibold text-gray-800">
                      {conversation.participants
                        ?.filter((participant) => participant?._id !== userId)
                        .map((participant) => participant?.username)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              </li>
            ))
        ) : (
          <p className="p-4 text-gray-500">No conversations found.</p>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
