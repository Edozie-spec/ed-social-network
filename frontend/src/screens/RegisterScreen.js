import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Store } from '../context/Store';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { state, dispatch } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    if (userInfo) navigate('/');
  }, [userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}/api/users/register`, { name, email, password });
      dispatch({ type: 'USER_SIGNIN', payload: data });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="glass-panel rounded-3xl p-8">
        <h1 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-purple">Register</h1>
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-2xl mb-4 text-sm">{error}</div>}
        <form onSubmit={submitHandler}>
          <input
            type="text"
            placeholder="Name"
            className="w-full border border-gray-200 dark:border-slate-700 p-3 px-4 rounded-full mb-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-200 dark:border-slate-700 p-3 px-4 rounded-full mb-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-200 dark:border-slate-700 p-3 px-4 rounded-full mb-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full border border-gray-200 dark:border-slate-700 p-3 px-4 rounded-full mb-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold py-3 rounded-full hover:shadow-lg hover:scale-105 transition-all"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-purple font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}