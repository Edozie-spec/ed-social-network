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
      const { data } = await axios.get(`http://127.0.0.1:5002/api/posts/${id}`);
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
        `http://127.0.0.1:5002/api/posts/${id}/comments`,
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

  if (!post) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="text-indigo-600 hover:underline mb-4 block">← Back</Link>
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center mb-3">
          <img
            src={post.user?.avatar || 'https://via.placeholder.com/40'}
            alt=""
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <div>
            <Link to={`/profile/${post.user?._id}`} className="font-semibold hover:underline">
              {post.user?.name}
            </Link>
            <p className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <p className="text-gray-800 mb-3">{post.content}</p>
        {post.image && (
          <img src={post.image} alt="" className="w-full max-h-96 object-cover rounded mb-3" />
        )}
        <div className="text-gray-600 text-sm">
          {post.likes?.length || 0} likes · {post.comments?.length || 0} comments
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="font-semibold mb-3">Comments</h3>
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
          <p className="text-gray-500">No comments yet.</p>
        )}
        {userInfo && (
          <form onSubmit={handleComment} className="mt-4 flex">
            <input
              type="text"
              className="flex-1 border p-2 rounded-l bg-sky-100 dark:bg-sky-800 dark:text-gray-300"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-r">
              Post
            </button>
          </form>
        )}
      </div>
    </div>
  );
}