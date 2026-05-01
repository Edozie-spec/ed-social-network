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
        'http://127.0.0.1:5002/api/users/profile',
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
        'http://127.0.0.1:5002/api/users/change-password',
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
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white dark:bg-sky-900 rounded-lg shadow transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      {message && <div className="bg-green-100 text-green-700 p-2 rounded mb-3">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</div>}

      <div className="flex items-center justify-between mb-8 p-4 bg-gray-100 dark:bg-sky-800 rounded">
        <span className="font-medium">Theme</span>
        <button
          onClick={toggleDarkMode}
          className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
            darkMode ? 'bg-indigo-600' : 'bg-gray-400'
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
        <h2 className="text-xl font-semibold mb-3">Profile</h2>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            className="w-full border p-2 rounded bg-gray-50 dark:bg-sky-800 dark:border-sky-700 dark:text-white"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="3"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Avatar URL</label>
          <input
            type="text"
            className="w-full border p-2 rounded bg-gray-50 dark:bg-sky-800 dark:border-sky-700 dark:text-white"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Update Profile
        </button>
      </form>

      <form onSubmit={changePassword}>
        <h2 className="text-xl font-semibold mb-3">Change Password</h2>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Old Password</label>
          <input
            type="password"
            className="w-full border p-2 rounded bg-gray-50 dark:bg-sky-800 dark:border-sky-700 dark:text-white"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            className="w-full border p-2 rounded bg-gray-50 dark:bg-sky-800 dark:border-sky-700 dark:text-white"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Confirm New Password</label>
          <input
            type="password"
            className="w-full border p-2 rounded bg-gray-50 dark:bg-sky-800 dark:border-sky-700 dark:text-white"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Change Password
        </button>
      </form>

<div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
  <h2 className="text-xl font-semibold mb-3 text-red-600">Danger Zone</h2>
  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
    Once you delete your account, there is no going back. Please be certain.
  </p>
  <button
    onClick={() => {
      if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
        const deleteAccount = async () => {
          try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete('http://127.0.0.1:5002/api/users/account', config);
            dispatch({ type: 'USER_SIGNOUT' });
            navigate('/');
          } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete account');
          }
        };
        deleteAccount();
      }
    }}
    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
  >
    Delete My Account
  </button>
</div>

    </div>
  );
}