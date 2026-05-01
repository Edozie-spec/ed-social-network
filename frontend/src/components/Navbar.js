import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store } from '../context/Store';

export default function Navbar() {
  const { state, dispatch } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');

  const signoutHandler = () => {
    dispatch({ type: 'USER_SIGNOUT' });
    navigate('/login');
  };

  const submitSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?keyword=${keyword.trim()}`);
      setKeyword('');
    }
  };

  return (
    <header className="bg-white dark:bg-sky-900 shadow sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Brand */}
        <Link
          to="/"
          className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
        >
          ED
        </Link>

        <form onSubmit={submitSearch} className="flex-1 max-w-md mx-4">
          <input
            type="text"
            className="w-full border p-2 rounded bg-gray-50 dark:bg-sky-800 dark:border-sky-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search users..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </form>

      
        <nav className="flex items-center space-x-4">
          {userInfo ? (
            <>
              <Link
                to={`/profile/${userInfo._id}`}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <img
                  src={userInfo.avatar || 'https://via.placeholder.com/30'}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-sky-700"
                />
                <span className="hidden sm:inline">{userInfo.name}</span>
              </Link>
              <Link
                to="/settings"
                className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Settings
              </Link>
              <button
                onClick={signoutHandler}
                className="text-gray-700 dark:text-gray-200 hover:text-red-500 dark:hover:text-red-400"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}