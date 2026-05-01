import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Store } from '../context/Store';
import LikesModal from './LikesModal';

export default function PostCard({ post, refresh }) {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [likes, setLikes] = useState(post.likes || []);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editImage, setEditImage] = useState(post.image || '');
  const [showLikes, setShowLikes] = useState(false);
  const navigate = useNavigate();

  const isLiked = userInfo && likes.includes(userInfo._id);
  const isOwner = userInfo && post.user?._id === userInfo._id;

  const handleLike = async () => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(
        `http://127.0.0.1:5002/api/posts/like/${post._id}`,
        {},
        config
      );
      setLikes(data.likes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`http://127.0.0.1:5002/api/posts/${post._id}`, config);
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
        `http://127.0.0.1:5002/api/posts/${post._id}`,
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
    <div className="bg-white dark:bg-sky-900 rounded-lg shadow p-4 mb-4 text-gray-900 dark:text-white">
      <div className="flex items-center mb-3">
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
        <form onSubmit={handleEdit} className="mb-3">
          <textarea
            className="w-full border p-2 rounded bg-gray-50 dark:bg-sky-800 dark:border-sky-700 dark:text-white mb-2"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows="3"
            required
          />
          <input
            type="text"
            className="w-full border p-2 rounded bg-gray-50 dark:bg-sky-800 dark:border-sky-700 dark:text-white mb-2"
            placeholder="Image URL (optional)"
            value={editImage}
            onChange={(e) => setEditImage(e.target.value)}
          />
          <div className="space-x-2">
            <button type="submit" className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
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
        </>
      )}

      <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300">
        <button onClick={handleLike} className="flex items-center space-x-1">
          <span>{isLiked ? '❤️' : '🤍'}</span>
        </button>
        <span
          onClick={() => setShowLikes(true)}
          className="cursor-pointer hover:underline"
        >
          {likes.length}
        </span>

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