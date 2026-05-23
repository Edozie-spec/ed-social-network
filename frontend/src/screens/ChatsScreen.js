import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Store } from '../context/Store';
import { useSocket } from '../context/SocketContext';
import ChatBox from '../components/ChatBox';

export default function ChatsScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const { onlineUsers } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch conversations and followed users
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}/api/chats`, config);
        setConversations(data);
        
        // Fetch user profile to get following list
        const profileRes = await axios.get(`${process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}`)}/api/users/profile/${userInfo._id}`);
        setFollowing(profileRes.data.following || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [userInfo]);

  const handleStartChat = async (recipientId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}/api/chats/conversation`,
        { userId: recipientId },
        config
      );
      
      // If conversation is already in listing, select it
      const exists = conversations.find((c) => c._id === data._id);
      if (!exists) {
        setConversations((prev) => [data, ...prev]);
      }
      setActiveChat(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewMessage = (newMessage) => {
    // Reorder conversations list to bring active one to top
    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c._id === activeChat?._id) {
          return { ...c, lastMessage: newMessage, updatedAt: newMessage.createdAt };
        }
        return c;
      });
      return [...updated].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading Chats...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left panel: Conversations List */}
      <div className={`md:col-span-1 flex-col space-y-4 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="glass-panel rounded-3xl p-5">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          {conversations.length === 0 ? (
            <div className="text-sm text-gray-400 py-2">
              No chat history yet. Select a friend below to start!
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {conversations.map((chat) => {
                const recipient = chat.participants.find((p) => p._id !== userInfo._id);
                const isOnline = recipient && onlineUsers.includes(recipient._id);
                const isSelected = activeChat?._id === chat._id;
                return (
                  <div
                    key={chat._id}
                    onClick={() => setActiveChat(chat)}
                    className={`flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-brand-purple/20 to-brand-pink/20 border border-brand-purple/30'
                        : 'hover:bg-white/30 dark:hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={recipient?.avatar || 'https://via.placeholder.com/35'}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border border-white dark:border-slate-900 rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{recipient?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {chat.lastMessage ? chat.lastMessage.text : 'Start chatting'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Following / Friends List to Start Chat */}
        <div className="glass-panel rounded-3xl p-5">
          <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">Friends & Family</h3>
          {following.length === 0 ? (
            <div className="text-xs text-gray-400">
              Follow people on their profile pages to start private DMs with them!
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {following.map((friend) => {
                const isOnline = onlineUsers.includes(friend._id);
                return (
                  <div key={friend._id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10">
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="relative">
                        <img
                          src={friend.avatar || 'https://via.placeholder.com/30'}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white dark:border-slate-900 rounded-full"></span>
                        )}
                      </div>
                      <span className="text-xs font-semibold truncate">{friend.name}</span>
                    </div>
                    <button
                      onClick={() => handleStartChat(friend._id)}
                      className="bg-brand-purple/20 hover:bg-brand-purple text-brand-purple hover:text-white font-bold p-1 px-3 rounded-full text-[10px] transition-all"
                    >
                      Chat
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right panel: Active Chat Box */}
      <div className={`md:col-span-2 flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <div className="flex flex-col h-full relative">
            {/* Mobile Back Button */}
            <button 
              onClick={() => setActiveChat(null)}
              className="md:hidden absolute -top-4 left-0 z-10 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm rounded-full font-bold flex items-center space-x-1 shadow-md"
            >
              <span>←</span>
              <span>Inbox</span>
            </button>
            <ChatBox conversation={activeChat} onNewMessage={handleNewMessage} />
          </div>
        ) : (
          <div className="h-[550px] glass-panel rounded-3xl flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <span className="text-5xl mb-4">💬</span>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">Your Inbox</h3>
            <p className="text-sm max-w-sm mt-1">
              Select an active conversation from the list or start a new private message with friends and family you follow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
