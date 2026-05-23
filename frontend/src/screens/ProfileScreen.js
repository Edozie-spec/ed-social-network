import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { Store } from '../context/Store';

export default function ProfileScreen() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const { state, dispatch } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}`)}/api/users/profile/${id}`);
      setProfile(data);
      const postsRes = await axios.get(`${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}/api/posts`);
      const userPosts = postsRes.data.filter((post) => post.user._id === id);
      setPosts(userPosts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleFollow = async () => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.put(`${process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://10.45.224.225:5520'}`)}/api/users/follow/${id}`, {}, config);
      fetchProfile(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) return <div className="text-center py-8 text-gray-400">Loading...</div>;

  // followers is populated as objects with {_id, name, avatar}, so we compare _id strings
  const isFollowing = userInfo && profile.followers.some(
    (f) => (f._id || f).toString() === userInfo._id.toString()
  );

  return (
    <div>
      <div className="glass-panel rounded-3xl p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8">
        <img
          src={profile.avatar || 'https://via.placeholder.com/100'}
          alt=""
          className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-purple/30"
        />
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-extrabold">{profile.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{profile.bio}</p>
          <div className="flex space-x-6 mt-3 text-sm justify-center sm:justify-start">
            <span><strong>{profile.followers.length}</strong> followers</span>
            <span><strong>{profile.following.length}</strong> following</span>
          </div>
          {userInfo && userInfo._id !== profile._id && (
            <button
              onClick={handleFollow}
              className={`mt-3 px-6 py-2 rounded-full font-semibold text-white transition-all duration-300 ${
                isFollowing
                  ? 'bg-gray-500 hover:bg-gray-600'
                  : 'bg-gradient-to-r from-brand-purple to-brand-pink hover:shadow-lg hover:scale-105'
              }`}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      </div>
      <h2 className="text-xl font-bold mb-4">Posts</h2>
      {posts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No posts yet.</p>
      ) : (
        posts.map((post) => <PostCard key={post._id} post={post} refresh={fetchProfile} />)
      )}
    </div>
  );
}