import React, { useState } from 'react';
import { useAuth } from './utils/AuthContext';
import Sidebar from './ChatUI/sidebar';
import ChatBox from './ChatUI/ChatBox';

const Home = () => {
  const { userId } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  return (
    <div className="flex h-screen bg-gray-200">
      {/* Sidebar for selecting conversations */}
      <Sidebar setSelectedConversation={setSelectedConversationId} />

      {/* ChatBox to display messages */}
      {selectedConversationId ? (
        <ChatBox selectedConversationId={selectedConversationId} />
      ) : (
        <div className="w-3/4 h-screen flex justify-center items-center">
          <p>Please select a conversation from the sidebar to view messages.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
