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
      const { data } = await axios.post('http://127.0.0.1:5002/api/users/register', { name, email, password });
      dispatch({ type: 'USER_SIGNIN', payload: data });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</div>}
      <form onSubmit={submitHandler}>
        <input type="text" placeholder="Name" className="w-full border p-2 rounded mb-2 bg-sky-100 dark:bg-sky-800 dark:text-gray-300" value={name}
          onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" className="w-full border p-2 rounded mb-2 bg-sky-100 dark:bg-sky-800 dark:text-gray-300" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full border p-2 rounded mb-2 bg-sky-100 dark:bg-sky-800 dark:text-gray-300" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        <input type="password" placeholder="Confirm Password" className="w-full border p-2 rounded mb-2 bg-sky-100 dark:bg-sky-800 dark:text-gray-300" value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)} required />
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Register</button>
      </form>
      <p className="mt-3 text-center">
        Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Sign In</Link>
      </p>
    </div>
  );
}