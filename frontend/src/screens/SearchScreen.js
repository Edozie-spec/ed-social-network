import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SearchScreen() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const [localKeyword, setLocalKeyword] = useState(keyword);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLocalKeyword(keyword);
    const fetchUsers = async () => {
      if (!keyword.trim()) {
        setUsers([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}`)}/api/users/search?keyword=${keyword}`);
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [keyword]);

  const submitSearch = (e) => {
    e.preventDefault();
    if (localKeyword.trim()) {
      navigate(`/search?keyword=${localKeyword.trim()}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Input for Mobile/Direct Access */}
      <form onSubmit={submitSearch} className="mb-8 md:hidden">
        <div className="relative">
          <input
            type="text"
            className="w-full border border-gray-200 dark:border-slate-700 p-4 px-6 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all shadow-sm"
            placeholder="Search for friends, family..."
            value={localKeyword}
            onChange={(e) => setLocalKeyword(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold px-6 rounded-full hover:shadow-lg transition-all"
          >
            Search
          </button>
        </div>
      </form>

      {keyword && (
        <h1 className="text-2xl font-extrabold mb-6">
          Search results for "<span className="italic text-brand-purple">{keyword}</span>"
        </h1>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">Searching...</div>
      ) : users.length === 0 && keyword ? (
        <div className="text-center py-8 text-gray-400">No users found.</div>
      ) : users.length === 0 && !keyword ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
          <span className="text-5xl mb-4">🔍</span>
          <p>Type a name to search for users.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Link
              key={user._id}
              to={`/profile/${user._id}`}
              className="glass-panel rounded-3xl p-5 flex items-center space-x-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-purple/10 transition-all duration-300"
            >
              <img
                src={user.avatar || 'https://via.placeholder.com/40'}
                alt=""
                className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-purple/30"
              />
              <div>
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
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