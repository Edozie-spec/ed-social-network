import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Store } from '../context/Store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { state, dispatch } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    if (userInfo) navigate('/');
  }, [userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://127.0.0.1:5002/api/users/login', { email, password });
      dispatch({ type: 'USER_SIGNIN', payload: data });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</div>}
      <form onSubmit={submitHandler}>
        <input type="email" placeholder="Email" className="w-full border p-2 rounded mb-2 bg-sky-100 dark:bg-sky-800 dark:text-gray-300" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full border p-2 rounded mb-2 bg-sky-100 dark:bg-sky-800 dark:text-gray-300" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Sign In</button>
      </form>
      
      <p className="text-right mb-2">
  <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">
    Forgot your password?
  </Link>
</p>
      <p className="mt-3 text-center">
        New user? <Link to="/register" className="text-indigo-600 hover:underline">Register</Link>
      </p>
    </div>
  );
}