import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { Store } from '../context/Store';
import StoriesModal from './StoriesModal';

export default function StoriesBar() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [groupedStories, setGroupedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals / Dropdowns state
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textStory, setTextStory] = useState('');
  const [selectedGradient, setSelectedGradient] = useState('bg-gradient-to-tr from-brand-pink to-brand-purple');
  const [activeStoryGroup, setActiveStoryGroup] = useState(null);

  const fileInputRef = useRef(null);

  const gradients = [
    { name: 'Sunset Silk', class: 'bg-gradient-to-tr from-brand-pink to-brand-purple' },
    { name: 'Neon Dream', class: 'bg-gradient-to-tr from-purple-600 to-cyan-500' },
    { name: 'Firefly Glow', class: 'bg-gradient-to-tr from-orange-500 to-brand-pink' },
    { name: 'Aurora Borealis', class: 'bg-gradient-to-tr from-green-400 to-blue-600' },
  ];

  const fetchStories = async () => {
    if (!userInfo) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}/api/stories`, config);
      setGroupedStories(data);
    } catch (err) {
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [userInfo]);

  const handleLocalImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (limit to 5MB on client side just to be safe, express parses up to 50MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}/api/stories`,
          { content: base64String, type: 'image' },
          config
        );
        setShowAddMenu(false);
        fetchStories();
      } catch (err) {
        console.error('Error uploading image story:', err);
        alert('Failed to upload image story.');
      }
    };
  };

  const handleTextStorySubmit = async (e) => {
    e.preventDefault();
    if (!textStory.trim()) return;

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const contentPayload = JSON.stringify({
        text: textStory,
        gradient: selectedGradient
      });

      await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}/api/stories`,
        { content: contentPayload, type: 'text' },
        config
      );

      setTextStory('');
      setShowTextModal(false);
      setShowAddMenu(false);
      fetchStories();
    } catch (err) {
      console.error('Error uploading text story:', err);
      alert('Failed to upload text story.');
    }
  };

  if (!userInfo) return null;

  return (
    <div className="w-full mb-8 relative">
      <div className="glass-panel rounded-3xl p-4 flex items-center space-x-4 overflow-x-auto scrollbar-hide shadow-inner">
        {/* "+ Add Story" circle */}
        <div className="flex flex-col items-center flex-shrink-0 cursor-pointer relative">
          <div 
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-pink via-brand-purple to-brand-orange p-[3px] transition-all hover:scale-105 active:scale-95"
          >
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-2 border-white dark:border-slate-900 relative">
              <img 
                src={userInfo.avatar || 'https://via.placeholder.com/60'} 
                alt="My Avatar"
                className="w-full h-full rounded-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-light leading-none">+</span>
              </div>
            </div>
          </div>
          <span className="text-xs mt-2 font-medium truncate max-w-[70px]">Your Story</span>

          {/* Styled dropdown menu for story selection */}
          {showAddMenu && (
            <div className="absolute top-20 left-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-gray-200/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-3 w-48 animate-fade-in">
              <button 
                onClick={() => fileInputRef.current.click()}
                className="w-full text-left p-2.5 px-3 rounded-xl hover:bg-gradient-to-r hover:from-brand-purple hover:to-brand-pink hover:text-white flex items-center space-x-2 transition-all text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                <span>🖼️</span>
                <span>Upload Image</span>
              </button>
              <button 
                onClick={() => setShowTextModal(true)}
                className="w-full text-left p-2.5 px-3 rounded-xl hover:bg-gradient-to-r hover:from-brand-purple hover:to-brand-pink hover:text-white flex items-center space-x-2 transition-all text-sm font-semibold text-gray-700 dark:text-gray-200 mt-1"
              >
                <span>✍️</span>
                <span>Write Text</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLocalImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          )}
        </div>

        {/* Loading display */}
        {loading ? (
          <div className="flex space-x-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex flex-col items-center flex-shrink-0 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-slate-700"></div>
                <div className="w-12 h-3 bg-gray-300 dark:bg-slate-700 mt-2 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          groupedStories.map((group) => {
            const hasUnread = true; // For premium glow
            return (
              <div 
                key={group.user._id} 
                onClick={() => setActiveStoryGroup(group)}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer"
              >
                <div className={`w-16 h-16 rounded-full p-[3px] transition-all hover:scale-105 active:scale-95 ${
                  hasUnread 
                    ? 'bg-gradient-to-tr from-brand-pink via-brand-purple to-brand-orange animate-heartbeat' 
                    : 'bg-gray-300 dark:bg-slate-700'
                }`}>
                  <img 
                    src={group.user.avatar || 'https://via.placeholder.com/60'} 
                    alt={group.user.name} 
                    className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-900"
                  />
                </div>
                <span className="text-xs mt-2 font-semibold truncate max-w-[75px]">{group.user.name}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Styled text story Modal */}
      {showTextModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 relative shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold mb-4">Create Text Story</h3>
            <form onSubmit={handleTextStorySubmit} className="space-y-4">
              {/* Preview Box */}
              <div className={`w-full h-64 rounded-2xl ${selectedGradient} flex items-center justify-center p-6 text-center text-white shadow-inner relative overflow-hidden transition-all duration-500`}>
                <span className="text-xl font-bold break-words w-full max-h-full overflow-y-auto">
                  {textStory || 'Type your story...'}
                </span>
              </div>

              {/* Gradient Options */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Select Style</span>
                <div className="flex space-x-2">
                  {gradients.map((grad) => (
                    <button
                      key={grad.name}
                      type="button"
                      onClick={() => setSelectedGradient(grad.class)}
                      className={`w-8 h-8 rounded-full border-2 ${grad.class} ${
                        selectedGradient === grad.class ? 'border-white ring-2 ring-brand-purple' : 'border-transparent'
                      }`}
                      title={grad.name}
                    />
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <textarea
                value={textStory}
                onChange={(e) => setTextStory(e.target.value)}
                maxLength={200}
                className="w-full border border-gray-200 dark:border-slate-700 p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all text-sm"
                placeholder="What's on your mind? (Max 200 chars)"
                rows={3}
                required
              />

              {/* Buttons */}
              <div className="flex space-x-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowTextModal(false)}
                  className="bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 font-bold py-2 px-5 rounded-full text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold py-2 px-6 rounded-full hover:shadow-lg transition-all text-sm"
                >
                  Share Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Render Stories Viewer Modal */}
      {activeStoryGroup && (
        <StoriesModal 
          storyGroup={activeStoryGroup} 
          onClose={() => {
            setActiveStoryGroup(null);
            fetchStories(); // Refresh stories list
          }}
        />
      )}
    </div>
  );
}
