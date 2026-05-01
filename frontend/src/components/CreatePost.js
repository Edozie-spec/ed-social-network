import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Store } from '../context/Store';

export default function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const { state } = useContext(Store);
  const { userInfo } = state;

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.post(
        'http://127.0.0.1:5002/api/posts',
        { content, image },
        config
      );
      onPostCreated(data);
      setContent('');
      setImage('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <form onSubmit={submitHandler}>
        <textarea
          className="w-full border p-2 rounded mb-2 bg-sky-100 dark:bg-sky-800 dark:text-gray-300"
          rows="3"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <input
          type="text"
          className="w-full border p-2 rounded mb-2 bg-sky-100 dark:bg-sky-800 dark:text-gray-300"
          placeholder="Image URL (optional)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Post
        </button>
      </form>
    </div>
  );
}