import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import StoriesBar from '../components/StoriesBar';
import { Store } from '../context/Store';

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [feedType, setFeedType] = useState('all'); // 'all' or 'following'
  const [loading, setLoading] = useState(false);
  const { state } = useContext(Store);
  const { userInfo } = state;

  const fetchAllPosts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}/api/posts`);
      setPosts(data);
    } catch (err) {
      console.error('Error fetching all posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowingPosts = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}/api/posts/following`, config);
      setPosts(data);
    } catch (err) {
      console.error('Error fetching following posts:', err);
      setFeedType('all'); 
      fetchAllPosts();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (feedType === 'all') {
      fetchAllPosts();
    } else {
      if (!userInfo) {
        setFeedType('all');
        fetchAllPosts();
        return;
      }
      fetchFollowingPosts();
    }
  }, [feedType, userInfo]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <div>
      <StoriesBar />
      {userInfo && <CreatePost onPostCreated={handlePostCreated} />}

      <div className="flex space-x-4 mb-8 justify-center">
        <button
          onClick={() => setFeedType('all')}
          className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
            feedType === 'all'
              ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-lg scale-105'
              : 'glass-panel text-gray-800 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-slate-800/80'
          }`}
        >
          All Posts
        </button>
        {userInfo && (
          <button
            onClick={() => setFeedType('following')}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
              feedType === 'following'
                ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-lg scale-105'
                : 'glass-panel text-gray-800 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-slate-800/80'
            }`}
          >
            Following
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {feedType === 'following'
            ? 'No posts from people you follow. Follow someone!'
            : 'No posts yet. Be the first to post!'}
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            refresh={feedType === 'all' ? fetchAllPosts : fetchFollowingPosts}
          />
        ))
      )}
    </div>
  );
}