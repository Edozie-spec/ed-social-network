import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { Store } from '../context/Store';
import { useSocket } from '../context/SocketContext';

export default function ChatBox({ conversation, onNewMessage }) {
  const { socket, onlineUsers } = useSocket();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const scrollRef = useRef(null);

  const recipient = conversation.participants.find(
    (p) => p._id !== userInfo._id
  );

  const isRecipientOnline = recipient && onlineUsers.includes(recipient._id);

  // Fetch conversation message history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}`)}/api/chats/${conversation._id}/messages`,
          config
        );
        setMessages(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();

    if (socket) {
      socket.emit('join_chat', conversation._id);
    }
  }, [conversation, socket, userInfo]);

  // Socket listener for new messages & typing indicators
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (newMessage) => {
      if (newMessage.conversation._id === conversation._id || newMessage.conversation === conversation._id) {
        setMessages((prev) => [...prev, newMessage]);
        if (onNewMessage) onNewMessage(newMessage);
      }
    };

    const handleTyping = ({ room, userId }) => {
      if (room === conversation._id && userId !== userInfo._id) {
        setIsTyping(true);
        setTypingUser(recipient?.name);
      }
    };

    const handleStopTyping = ({ room }) => {
      if (room === conversation._id) {
        setIsTyping(false);
      }
    };

    socket.on('message_received', handleMessageReceived);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    return () => {
      socket.off('message_received', handleMessageReceived);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
    };
  }, [socket, conversation, userInfo, recipient, onNewMessage]);

  // Scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle typing triggers
  const handleInputChange = (e) => {
    setText(e.target.value);

    if (!socket) return;

    socket.emit('typing', { room: conversation._id, userId: userInfo._id });

    // Stop typing timeout
    const lastTypingTime = new Date().getTime();
    const timerLength = 2000;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength) {
        socket.emit('stop_typing', { room: conversation._id, userId: userInfo._id });
      }
    }, timerLength);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}/api/chats/message`,
        { conversationId: conversation._id, text },
        config
      );

      setMessages((prev) => [...prev, data]);
      setText('');

      if (socket) {
        socket.emit('stop_typing', { room: conversation._id, userId: userInfo._id });
        socket.emit('new_message', data);
      }

      if (onNewMessage) onNewMessage(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-[550px] glass-panel rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/20 bg-white/20 dark:bg-slate-800/40 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={recipient?.avatar || 'https://via.placeholder.com/40'}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
            {isRecipientOnline && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            )}
          </div>
          <div>
            <h3 className="font-bold">{recipient?.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isRecipientOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white/10 dark:bg-slate-950/20">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Say hello to start the conversation! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender._id === userInfo._id;
            return (
              <div
                key={msg._id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3.5 px-4 rounded-3xl text-sm shadow-md transition-all ${
                    isMe
                      ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white rounded-br-none'
                      : 'glass-panel text-gray-800 dark:text-white rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="glass-panel p-3 px-4 rounded-3xl rounded-bl-none text-xs text-gray-500 flex items-center space-x-1.5 shadow-sm">
              <span className="italic">{typingUser} is typing</span>
              <span className="flex space-x-0.5 items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-300"></span>
              </span>
            </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Footer input */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-200/20 bg-white/20 dark:bg-slate-800/40 flex space-x-2">
        <input
          type="text"
          className="flex-1 border border-gray-200 dark:border-slate-700 p-3 px-5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all text-sm"
          placeholder="Type a message..."
          value={text}
          onChange={handleInputChange}
          required
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-brand-pink to-brand-orange text-white font-bold p-3 px-6 rounded-full hover:shadow-lg hover:scale-105 transition-all text-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
}
