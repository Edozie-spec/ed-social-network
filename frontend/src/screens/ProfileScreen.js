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
      const { data } = await axios.get(`http://127.0.0.1:5002/api/users/profile/${id}`);
      setProfile(data);
      const postsRes = await axios.get('http://127.0.0.1:5002/api/posts');
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
      await axios.put(`http://127.0.0.1:5002/api/users/follow/${id}`, {}, config);
      fetchProfile(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) return <div>Loading...</div>;

  const isFollowing = userInfo && profile.followers.includes(userInfo._id);

  return (
    <div>
      <div className="bg-white dark:bg-sky-800 rounded-lg shadow p-6 mb-6 flex items-center space-x-6">
        <img
          src={profile.avatar || 'https://via.placeholder.com/100'}
          alt=""
          className="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">{profile.bio}</p>
          <div className="flex space-x-4 mt-2 text-sm">
            <span><strong>{profile.followers.length}</strong> followers</span>
            <span><strong>{profile.following.length}</strong> following</span>
          </div>
          {userInfo && userInfo._id !== profile._id && (
            <button
              onClick={handleFollow}
              className={`mt-2 px-4 py-1 rounded-full text-white ${
                isFollowing ? 'bg-gray-500' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4">Posts</h2>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post) => <PostCard key={post._id} post={post} refresh={fetchProfile} />)
      )}
    </div>
  );
}