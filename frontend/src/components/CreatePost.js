import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Store } from '../context/Store';

export default function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  
  // Poll State
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const { state } = useContext(Store);
  const { userInfo } = state;

  const handleOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}/api/posts`,
        { 
          content, 
          image,
          pollQuestion: showPoll ? pollQuestion : undefined,
          pollOptions: showPoll ? pollOptions : undefined
        },
        config
      );
      onPostCreated(data);
      setContent('');
      setImage('');
      setShowPoll(false);
      setPollQuestion('');
      setPollOptions(['', '']);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 mb-8 shadow-lg transition-all duration-300">
      <form onSubmit={submitHandler}>
        <textarea
          className="w-full border border-gray-200 dark:border-slate-700 p-4 rounded-3xl mb-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-pink transition-all resize-none"
          rows="3"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <input
          type="text"
          className="w-full border border-gray-200 dark:border-slate-700 p-3 px-4 rounded-full mb-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-pink transition-all"
          placeholder="Image URL (optional)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
        
        {showPoll && (
          <div className="mb-4 bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
            <input
              type="text"
              placeholder="Ask a question..."
              className="w-full mb-2 p-2 rounded border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              required={showPoll}
            />
            {pollOptions.map((opt, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Option ${index + 1}`}
                className="w-full mb-2 p-2 rounded border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white"
                value={opt}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required={showPoll && index < 2} // First two options required
              />
            ))}
            {pollOptions.length < 5 && (
              <button type="button" onClick={addOption} className="text-sm text-brand-purple hover:underline">
                + Add Option
              </button>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowPoll(!showPoll)}
            className="text-gray-500 hover:text-brand-purple transition-colors font-medium flex items-center space-x-1"
          >
            <span>📊</span>
            <span>{showPoll ? 'Remove Poll' : 'Add Poll'}</span>
          </button>
          
          <button
            type="submit"
            className="bg-gradient-to-r from-brand-pink to-brand-orange text-white font-bold px-6 py-2 rounded-full hover:shadow-lg hover:scale-105 transition-all"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
}