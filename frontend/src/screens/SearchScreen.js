import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function SearchScreen() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!keyword.trim()) return;
      setLoading(true);
      try {
        const { data } = await axios.get(`http://127.0.0.1:5002/api/users/search?keyword=${keyword}`);
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [keyword]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Search results for "<span className="italic">{keyword}</span>"
      </h1>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Searching...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No users found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Link
              key={user._id}
              to={`/profile/${user._id}`}
              className="bg-white dark:bg-sky-900 p-4 rounded-lg shadow flex items-center space-x-3 hover:shadow-lg transition"
            >
              <img
                src={user.avatar || 'https://via.placeholder.com/40'}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {user.bio || 'No bio yet'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}