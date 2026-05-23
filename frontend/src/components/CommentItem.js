import React, { useContext } from 'react';
import axios from 'axios';
import { Store } from '../context/Store';

export default function CommentItem({ comment, postId, onDelete }) {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const handleDelete = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.delete(
        `${process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}`)}/api/posts/${postId}/comments/${comment._id}`,
        config
      );
      onDelete(comment._id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-200/30 dark:border-slate-700/30 last:border-0">
      <img
        src={comment.user?.avatar || 'https://via.placeholder.com/32'}
        alt=""
        className="w-8 h-8 rounded-full object-cover mt-1"
      />
      <div className="flex-1">
        <p className="text-sm font-semibold">{comment.user?.name}</p>
        <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.text}</p>
      </div>
      {userInfo && comment.user?._id === userInfo._id && (
        <button onClick={handleDelete} className="text-red-400 text-sm hover:underline">
          Delete
        </button>
      )}
    </div>
  );
}