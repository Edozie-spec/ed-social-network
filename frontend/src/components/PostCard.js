import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Store } from '../context/Store';
import LikesModal from './LikesModal';

export default function PostCard({ post, refresh }) {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [likes, setLikes] = useState(post.likes || []);
  const [reactions, setReactions] = useState(post.reactions || []);
  const [poll, setPoll] = useState(post.poll || null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editImage, setEditImage] = useState(post.image || '');
  const [showLikes, setShowLikes] = useState(false);
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);
  const navigate = useNavigate();

  const isLiked = userInfo && likes.includes(userInfo._id);
  const isOwner = userInfo && post.user?._id === userInfo._id;

  const handleReact = async (type) => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}`)}/api/posts/react/${post._id}`,
        { type },
        config
      );
      setLikes(data.likes);
      setReactions(data.reactions);
      setShowReactionsMenu(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (optionIndex) => {
    if (!userInfo) return navigate('/login');
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}`)}/api/posts/vote/${post._id}`,
        { optionIndex },
        config
      );
      setPoll(data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Vote failed');
    }
  };

  const handleLike = async () => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}`)}/api/posts/like/${post._id}`,
        {},
        config
      );
      setLikes(data.likes);
      if (data.reactions) setReactions(data.reactions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}`)}/api/posts/${post._id}`, config);
      if (refresh) refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}`)}/api/posts/${post._id}`,
        { content: editContent, image: editImage },
        config
      );
      post.content = data.content;
      post.image = data.image;
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 mb-6 text-gray-900 dark:text-white hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-purple/10 transition-all duration-300">
      <div className="flex items-center mb-4">
        <img
          src={post.user?.avatar || 'https://via.placeholder.com/40'}
          alt=""
          className="w-10 h-10 rounded-full object-cover mr-3"
        />
        <div className="flex-1">
          <Link to={`/profile/${post.user?._id}`} className="font-semibold hover:underline">
            {post.user?.name}
          </Link>
          <p className="text-gray-500 dark:text-gray-300 text-sm">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
        {isOwner && (
          <div className="space-x-2">
            <button
              onClick={() => {
                setEditing(!editing);
                setEditContent(post.content);
                setEditImage(post.image || '');
              }}
              className="text-blue-500 hover:underline text-sm"
            >
              Edit
            </button>
            <button onClick={handleDelete} className="text-red-500 hover:underline text-sm">
              Delete
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleEdit} className="mb-4">
          <textarea
            className="w-full border border-gray-200 dark:border-slate-700 p-4 rounded-3xl mb-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all resize-none"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows="3"
            required
          />
          <input
            type="text"
            className="w-full border border-gray-200 dark:border-slate-700 p-3 px-4 rounded-full mb-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
            placeholder="Image URL (optional)"
            value={editImage}
            onChange={(e) => setEditImage(e.target.value)}
          />
          <div className="space-x-2 flex">
            <button
              type="submit"
              className="bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold px-5 py-2 rounded-full hover:shadow-lg hover:scale-105 transition-all text-sm"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="bg-gray-500 text-white font-bold px-5 py-2 rounded-full hover:bg-gray-600 transition-all text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="text-gray-800 dark:text-gray-100 mb-3">{post.content}</p>
          {post.image && (
            <img
              src={post.image}
              alt=""
              className="w-full max-h-96 object-cover rounded mb-3"
            />
          )}

          {poll && poll.options && poll.options.length > 0 && (
            <div className="mt-4 mb-4 border border-gray-200 dark:border-slate-700 rounded-xl p-4 bg-gray-50/50 dark:bg-slate-800/50">
              <h4 className="font-bold mb-3">{poll.question}</h4>
              <div className="space-y-2">
                {poll.options.map((opt, i) => {
                  const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes.length, 0);
                  const votePercentage = totalVotes === 0 ? 0 : Math.round((opt.votes.length / totalVotes) * 100);
                  const hasVoted = userInfo && opt.votes.includes(userInfo._id);
                  const anyVoted = userInfo && poll.options.some(o => o.votes.includes(userInfo._id));

                  return (
                    <div 
                      key={i} 
                      onClick={() => !anyVoted && handleVote(i)}
                      className={`relative overflow-hidden rounded-lg border p-3 cursor-pointer transition-all ${
                        hasVoted ? 'border-brand-purple bg-brand-purple/10' : 'border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700'
                      } ${anyVoted ? 'cursor-default' : ''}`}
                    >
                      {anyVoted && (
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-brand-purple/20 dark:bg-brand-purple/40 transition-all duration-1000"
                          style={{ width: `${votePercentage}%` }}
                        />
                      )}
                      <div className="relative flex justify-between items-center z-10">
                        <span className="font-medium text-sm">{opt.text}</span>
                        {anyVoted && <span className="text-xs font-bold">{votePercentage}%</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-right">
                {poll.options.reduce((acc, curr) => acc + curr.votes.length, 0)} votes
              </p>
            </div>
          )}
        </>
      )}

      <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-300 mt-2 relative">
        <div className="relative flex items-center">
          <button 
            onMouseEnter={() => setShowReactionsMenu(true)}
            onMouseLeave={() => setTimeout(() => setShowReactionsMenu(false), 300)}
            onClick={handleLike} 
            className="flex items-center space-x-1 hover:scale-110 transition-transform active:animate-heartbeat"
          >
            <span className="text-xl">
              {reactions.some(r => r.user === userInfo?._id) 
                ? (reactions.find(r => r.user === userInfo?._id)?.type === 'heart' ? '❤️' 
                 : reactions.find(r => r.user === userInfo?._id)?.type === 'laugh' ? '😂'
                 : reactions.find(r => r.user === userInfo?._id)?.type === 'fire' ? '🔥'
                 : reactions.find(r => r.user === userInfo?._id)?.type === 'wow' ? '😮'
                 : reactions.find(r => r.user === userInfo?._id)?.type === 'sad' ? '😢'
                 : '❤️') 
                : '🤍'}
            </span>
          </button>
          <span
            onClick={() => setShowLikes(true)}
            className="cursor-pointer hover:underline ml-1"
          >
            {likes.length}
          </span>

          {showReactionsMenu && (
            <div 
              onMouseEnter={() => setShowReactionsMenu(true)}
              onMouseLeave={() => setShowReactionsMenu(false)}
              className="absolute bottom-8 left-0 flex space-x-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl rounded-full p-2 animate-fade-in z-20"
            >
              {[
                { type: 'heart', emoji: '❤️' },
                { type: 'laugh', emoji: '😂' },
                { type: 'fire', emoji: '🔥' },
                { type: 'wow', emoji: '😮' },
                { type: 'sad', emoji: '😢' },
              ].map(reaction => (
                <button
                  key={reaction.type}
                  onClick={() => handleReact(reaction.type)}
                  className="text-2xl hover:scale-150 transition-transform"
                >
                  {reaction.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <Link to={`/post/${post._id}`} className="flex items-center space-x-1 hover:text-indigo-400">
          <span>💬</span>
          <span>{post.comments?.length || 0}</span>
        </Link>
      </div>

      {showLikes && (
        <LikesModal postId={post._id} onClose={() => setShowLikes(false)} />
      )}
    </div>
  );
}