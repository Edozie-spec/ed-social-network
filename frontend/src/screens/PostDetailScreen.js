import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import CommentItem from '../components/CommentItem';
import { Store } from '../context/Store';

export default function PostDetailScreen() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const { state } = useContext(Store);
  const { userInfo } = state;

  const fetchPost = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}`)}/api/posts/${id}`);
      setPost(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}`)}/api/posts/${id}/comments`,
        { text: commentText },
        config
      );
      setPost({ ...post, comments: [...post.comments, data] });
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = (commentId) => {
    setPost({
      ...post,
      comments: post.comments.filter((c) => c._id !== commentId),
    });
  };

  if (!post) return <div className="text-center py-8 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="text-brand-purple hover:underline mb-4 block font-semibold">← Back</Link>
      <div className="glass-panel rounded-3xl p-6 mb-6">
        <div className="flex items-center mb-4">
          <img
            src={post.user?.avatar || 'https://via.placeholder.com/40'}
            alt=""
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <div>
            <Link to={`/profile/${post.user?._id}`} className="font-semibold hover:underline">
              {post.user?.name}
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{new Date(post.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <p className="text-gray-800 dark:text-gray-100 mb-3">{post.content}</p>
        {post.image && (
          <img src={post.image} alt="" className="w-full max-h-96 object-cover rounded-2xl mb-3" />
        )}
        <div className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          {post.likes?.length || 0} likes · {post.comments?.length || 0} comments
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 mb-6">
        <h3 className="font-bold mb-4 text-lg">Comments</h3>
        {post.comments && post.comments.length > 0 ? (
          post.comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={post._id}
              onDelete={handleDeleteComment}
            />
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No comments yet.</p>
        )}
        {userInfo && (
          <form onSubmit={handleComment} className="mt-4 flex space-x-2">
            <input
              type="text"
              className="flex-1 border border-gray-200 dark:border-slate-700 p-3 px-4 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-brand-pink to-brand-orange text-white font-bold px-6 py-2 rounded-full hover:shadow-lg hover:scale-105 transition-all"
            >
              Post
            </button>
          </form>
        )}
      </div>
    </div>
  );
}