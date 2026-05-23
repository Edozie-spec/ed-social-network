import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Store } from '../context/Store';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { state, dispatch } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      setBio(userInfo.bio || '');
      setAvatar(userInfo.avatar || '');
    }
  }, [userInfo, navigate]);

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      console.log('Sending profile update with:', { bio, avatar });
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}/api/users/profile`,
        { bio, avatar },
        config
      );
      console.log('Profile update response:', data);
      dispatch({
        type: 'USER_SIGNIN',
        payload: { ...userInfo, bio: data.bio, avatar: data.avatar },
      });
      setMessage('Profile updated');
      setError('');
    } catch (err) {
      console.error('Profile update error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}/api/users/change-password`,
        { oldPassword, newPassword },
        config
      );
      setMessage(data.message);
      setError('');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
      <div className="glass-panel rounded-3xl p-8 transition-colors duration-300">
        <h1 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-purple">Settings</h1>
        {message && <div className="bg-green-500/20 text-green-400 p-3 rounded-2xl mb-4 text-sm">{message}</div>}
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-2xl mb-4 text-sm">{error}</div>}

        <div className="flex items-center justify-between mb-8 p-4 bg-white/30 dark:bg-slate-800/50 rounded-2xl">
          <span className="font-semibold">Theme</span>
          <button
            onClick={toggleDarkMode}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
              darkMode ? 'bg-gradient-to-r from-brand-purple to-brand-pink' : 'bg-gray-400'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${
                darkMode ? 'translate-x-7' : 'translate-x-0'
              }`}
            ></span>
          </button>
        </div>

        <form onSubmit={updateProfile} className="mb-8">
          <h2 className="text-xl font-bold mb-3">Profile</h2>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              className="w-full border border-gray-200 dark:border-slate-700 p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all resize-none"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="3"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Avatar URL</label>
            <input
              type="text"
              className="w-full border border-gray-200 dark:border-slate-700 p-3 px-4 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold px-6 py-2 rounded-full hover:shadow-lg hover:scale-105 transition-all"
          >
            Update Profile
          </button>
        </form>

        <form onSubmit={changePassword}>
          <h2 className="text-xl font-bold mb-3">Change Password</h2>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Old Password</label>
            <input
              type="password"
              className="w-full border border-gray-200 dark:border-slate-700 p-3 px-4 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              className="w-full border border-gray-200 dark:border-slate-700 p-3 px-4 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              className="w-full border border-gray-200 dark:border-slate-700 p-3 px-4 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold px-6 py-2 rounded-full hover:shadow-lg hover:scale-105 transition-all"
          >
            Change Password
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200/30 dark:border-gray-600/30">
          <h2 className="text-xl font-bold mb-3 text-red-500">Danger Zone</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                const deleteAccount = async () => {
                  try {
                    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                    await axios.delete(`${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}/api/users/account`, config);
                    dispatch({ type: 'USER_SIGNOUT' });
                    navigate('/');
                  } catch (err) {
                    alert(err.response?.data?.message || 'Failed to delete account');
                  }
                };
                deleteAccount();
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition-all hover:scale-105"
          >
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}