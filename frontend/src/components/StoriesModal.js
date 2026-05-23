import React, { useState, useEffect } from 'react';

export default function StoriesModal({ storyGroup, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const activeStories = storyGroup.stories || [];
  const currentStory = activeStories[currentIndex];

  const duration = 5000; // 5 seconds per story

  // Reset progress and handle timer animation per story
  useEffect(() => {
    setProgress(0);
    if (!currentStory) return;

    const interval = 50; // Update progress every 50ms
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          handleNext();
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, storyGroup]);

  const handleNext = () => {
    if (currentIndex < activeStories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!currentStory) return null;

  // Check if content is a JSON text story payload
  let text = '';
  let gradientClass = 'bg-gradient-to-tr from-brand-pink to-brand-purple';
  let isTextPayload = false;

  if (currentStory.type === 'text') {
    try {
      const parsed = JSON.parse(currentStory.content);
      text = parsed.text;
      gradientClass = parsed.gradient || gradientClass;
      isTextPayload = true;
    } catch (e) {
      // Fallback if not stringified JSON
      text = currentStory.content;
      isTextPayload = true;
    }
  }

  // Format relative time helper
  const getRelativeTime = (dateStr) => {
    const created = new Date(dateStr);
    const diffMs = new Date() - created;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins || 1}m ago`;
    }
    return `${diffHours}h ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg h-full max-h-[85vh] md:rounded-3xl overflow-hidden bg-slate-950 flex flex-col justify-between shadow-2xl border border-white/10">
        
        {/* Progress Bars Indicator */}
        <div className="absolute top-4 left-0 right-0 z-30 px-4 flex space-x-1">
          {activeStories.map((story, index) => {
            let barWidth = '0%';
            if (index < currentIndex) barWidth = '100%';
            if (index === currentIndex) barWidth = `${progress}%`;
            return (
              <div key={story._id} className="h-[3px] flex-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-75"
                  style={{ width: barWidth }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Header Controls */}
        <div className="absolute top-6 left-0 right-0 z-30 px-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <img 
              src={storyGroup.user.avatar || 'https://via.placeholder.com/40'} 
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-white/30"
            />
            <div>
              <p className="font-bold text-sm leading-tight drop-shadow-md">{storyGroup.user.name}</p>
              <p className="text-[10px] text-white/70 drop-shadow-md">{getRelativeTime(currentStory.createdAt)}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-all border border-white/10 text-white font-bold"
          >
            ✕
          </button>
        </div>

        {/* Left & Right Tap Actions Overlay */}
        <div className="absolute inset-0 z-10 flex">
          <div onClick={handlePrev} className="w-[30%] h-full cursor-w-resize" title="Previous Story"></div>
          <div onClick={handleNext} className="w-[70%] h-full cursor-e-resize" title="Next Story"></div>
        </div>

        {/* Content Viewer Section */}
        <div className="flex-1 w-full flex items-center justify-center select-none bg-slate-900 relative">
          {currentStory.type === 'image' ? (
            <img 
              src={currentStory.content} 
              alt="Story Content"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className={`w-full h-full ${gradientClass} flex items-center justify-center p-8 text-center text-white`}>
              <p className="text-2xl font-extrabold max-h-[70%] overflow-y-auto break-words select-text">
                {text}
              </p>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="absolute bottom-6 left-0 right-0 z-30 px-6 flex justify-between items-center text-white/50 text-xs">
          <span>Tap left to rewind, right to skip</span>
          <span className="font-bold text-white/80">{currentIndex + 1} / {activeStories.length}</span>
        </div>

      </div>
    </div>
  );
}
