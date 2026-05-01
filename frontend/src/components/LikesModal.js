import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function LikesModal({ postId, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const { data } = await axios.get(`http://127.0.0.1:5002/api/posts/${postId}/likes`);
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLikes();
  }, [postId]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose} 
    >
      <div
        className="bg-white dark:bg-sky-900 rounded-lg p-6 w-72 max-h-96 overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Liked by</h3>
          <button
            onClick={onClose}
            className="text-2xl leading-none hover:text-gray-500 dark:hover:text-gray-300"
          >
            &times;
          </button>
        </div>
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500">No likes yet.</p>
        ) : (
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user._id} className="flex items-center space-x-2">
                <img
                  src={user.avatar || 'https://via.placeholder.com/30'}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover"
                />
                <Link
                  to={`/profile/${user._id}`}
                  onClick={onClose}
                  className="hover:underline dark:text-gray-200"
                >
                  {user.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}