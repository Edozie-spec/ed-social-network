import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function ResetPasswordScreen() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}`)}/api/users/reset-password/${token}`,
        { newPassword }
      );
      setMessage(data.message);
      setError('');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="glass-panel rounded-3xl p-8">
        <h1 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-purple">Reset Password</h1>
        {message && <div className="bg-green-500/20 text-green-400 p-3 rounded-2xl mb-4 text-sm">{message}</div>}
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-2xl mb-4 text-sm">{error}</div>}
        <form onSubmit={submitHandler}>
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
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full border border-gray-200 dark:border-slate-700 p-3 px-4 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold py-3 rounded-full hover:shadow-lg hover:scale-105 transition-all"
          >
            Reset Password
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          <Link to="/login" className="text-brand-purple font-semibold hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}