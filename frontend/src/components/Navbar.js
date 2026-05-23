import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Store } from '../context/Store';
import { useSocket } from '../context/SocketContext';
import NotificationDrawer from './NotificationDrawer';

export default function Navbar() {
  const { state, dispatch } = useContext(Store);
  const { userInfo } = state;
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  
  // Notification Drawer & Badge states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadChats, setUnreadChats] = useState(0);

  const signoutHandler = () => {
    dispatch({ type: 'USER_SIGNOUT' });
    navigate('/login');
  };

  const submitSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?keyword=${keyword.trim()}`);
      setKeyword('');
    }
  };

  // Fetch initial chat unread count and notification unread count
  const fetchUnreadCounts = async () => {
    if (!userInfo) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      // 1. Fetch conversations
      const chatsRes = await axios.get(`${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}/api/chats`, config);
      const unreadMsgs = chatsRes.data.filter(
        (c) => c.lastMessage && !c.lastMessage.isRead && c.lastMessage.sender !== userInfo._id
      ).length;
      setUnreadChats(unreadMsgs);

      // 2. Fetch notifications
      const notifsRes = await axios.get(`${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}/api/notifications`, config);
      const unreadAlerts = notifsRes.data.filter((n) => !n.isRead).length;
      setUnreadNotifications(unreadAlerts);
    } catch (err) {
      console.error('Error fetching unread counts:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCounts();
  }, [userInfo]);

  // Socket triggers for counts updating in real-time
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (newMessage) => {
      // If we are not currently active in that chat, or just to increment
      setUnreadChats((prev) => prev + 1);
    };

    const handleNewNotification = () => {
      setUnreadNotifications((prev) => prev + 1);
    };

    socket.on('message_received', handleMessageReceived);
    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('message_received', handleMessageReceived);
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  return (
    <header className="glass-panel sticky top-0 z-40 transition-colors duration-300">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Brand */}
        <Link
          to="/"
          className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-purple tracking-tight hover:scale-105 transition-transform"
        >
          ED
        </Link>

        {/* Search - Hidden on small screens */}
        <form onSubmit={submitSearch} className="hidden md:block flex-1 max-w-md mx-4">
          <input
            type="text"
            className="w-full border border-gray-200 dark:border-slate-700 p-2 px-4 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
            placeholder="Search users..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </form>

        {/* Navigation Actions */}
        <nav className="flex items-center space-x-4">
          {userInfo ? (
            <>
              {/* Profile Avatar */}
              <Link
                to={`/profile/${userInfo._id}`}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold"
              >
                <img
                  src={userInfo.avatar || 'https://via.placeholder.com/30'}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-sky-700"
                />
                <span className="hidden sm:inline">{userInfo.name}</span>
              </Link>

              {/* Chat Inbox Badged Link */}
              <Link
                to="/chats"
                className="relative text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-lg flex items-center p-1.5 rounded-full hover:bg-white/20"
                title="Chats"
                onClick={() => setUnreadChats(0)} // Reset count on click to inbox
              >
                <span>✉️</span>
                {unreadChats > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-pink text-white font-extrabold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
                    {unreadChats}
                  </span>
                )}
              </Link>

              {/* Notification Badged Button */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="relative text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-lg flex items-center p-1.5 rounded-full hover:bg-white/20 focus:outline-none"
                title="Notifications"
              >
                <span>🔔</span>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-purple text-white font-extrabold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Settings and Sign Out (Desktop Only) */}
              <Link
                to="/settings"
                className="hidden md:block text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold"
              >
                Settings
              </Link>
              
              <button
                onClick={signoutHandler}
                className="hidden md:block text-gray-700 dark:text-gray-200 hover:text-red-500 dark:hover:text-red-400 font-semibold"
              >
                Sign Out
              </button>

              {/* Mobile Menu Toggle (Mobile Only) */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-700 dark:text-gray-200 text-2xl p-1 focus:outline-none"
              >
                ☰
              </button>

              {/* Mobile Dropdown Menu */}
              {isMobileMenuOpen && (
                <div className="absolute top-16 right-4 w-48 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 md:hidden animate-fade-in">
                  <Link 
                    to="/search" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium"
                  >
                    🔍 Search Users
                  </Link>
                  <Link 
                    to="/settings" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium"
                  >
                    ⚙️ Settings
                  </Link>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signoutHandler();
                    }}
                    className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>

      {/* Slide-out Notification Drawer */}
      <NotificationDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onCountChange={(count) => setUnreadNotifications(count)}
      />
    </header>
  );
}