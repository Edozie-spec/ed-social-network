import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Store } from '../context/Store';
import { useSocket } from '../context/SocketContext';

export default function NotificationDrawer({ isOpen, onClose, onCountChange }) {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!userInfo) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}/api/notifications`, config);
      setNotifications(data);

      const unread = data.filter((n) => !n.isRead).length;
      if (onCountChange) onCountChange(unread);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userInfo]);

  // Listen on Socket.io for live notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      fetchNotifications();
    };

    socket.on('new_notification', handleNewNotification);
    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  const markAllRead = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}/api/notifications/read`, {}, config);
      
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onCountChange) onCountChange(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getRelativeTime = (dateStr) => {
    const created = new Date(dateStr);
    const diffMs = new Date() - created;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${diffMins || 1}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return created.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />

      {/* Side Panel Drawer */}
      <div className="fixed top-0 right-0 z-50 w-80 sm:w-96 h-screen glass-panel rounded-l-3xl shadow-2xl border-l border-white/20 p-6 flex flex-col justify-between animate-fade-in transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200/20">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🔔</span>
            <h2 className="text-xl font-bold">Notifications</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/20 dark:hover:bg-slate-800/40 flex items-center justify-center transition-all text-sm font-bold text-gray-500 dark:text-gray-400"
          >
            ✕
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 scrollbar-hide">
          {loading && notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              <span className="text-4xl block mb-2">🎉</span>
              No new alerts yet!
            </div>
          ) : (
            notifications.map((n) => {
              let icon = '📢';
              let text = '';
              
              if (n.type === 'reaction') {
                icon = '❤️';
                text = `${n.sender?.name} reacted to your post`;
              } else if (n.type === 'comment') {
                icon = '💬';
                text = `${n.sender?.name} commented on your post`;
              } else if (n.type === 'follow') {
                icon = '👤';
                text = `${n.sender?.name} started following you`;
              } else if (n.type === 'message') {
                icon = '✉️';
                text = `New message from ${n.sender?.name}`;
              }

              return (
                <div 
                  key={n._id}
                  className={`flex items-start space-x-3 p-3 rounded-2xl border transition-all ${
                    n.isRead 
                      ? 'bg-white/20 dark:bg-slate-900/20 border-transparent text-gray-600 dark:text-gray-300' 
                      : 'bg-gradient-to-r from-brand-purple/10 to-brand-pink/10 border-brand-purple/20 text-gray-900 dark:text-white font-semibold'
                  }`}
                >
                  <span className="text-xl mt-0.5">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs break-words">{text}</p>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{getRelativeTime(n.createdAt)}</span>
                  </div>
                  {!n.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-pink self-center flex-shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Action button at bottom */}
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAllRead}
            className="w-full bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold p-3 rounded-full hover:shadow-lg transition-all text-sm mt-4"
          >
            Mark All as Read
          </button>
        )}
        
      </div>
    </>
  );
}
