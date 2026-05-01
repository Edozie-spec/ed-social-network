import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://127.0.0.1:5002/api/users/forgot-password', { email });
      setMessage(data.message + ' (Check the server console for the reset link.)');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setMessage('');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-sky-900 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
      {message && <div className="bg-green-100 text-green-700 p-2 rounded mb-3">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</div>}
      <form onSubmit={submitHandler}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            type="email"
            className="w-full border p-2 rounded bg-gray-50 dark:bg-sky-800 dark:border-sky-700 dark:text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
          Send Reset Link
        </button>
      </form>
      <p className="mt-4 text-center">
        Remember your password?{' '}
        <Link to="/login" className="text-indigo-600 hover:underline">Sign In</Link>
      </p>
    </div>
  );
}