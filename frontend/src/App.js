import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/Store';
import Navbar from './components/Navbar';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import SearchScreen from './screens/SearchScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';

function App() {
  return (
    <StoreProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-sky-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          <Navbar />
          <main className="container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              <Route path="/profile/:id" element={<ProfileScreen />} />
              <Route path="/post/:id" element={<PostDetailScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path='/search' element={<SearchScreen />} />
              <Route path='/forgot-password' element={<ForgotPasswordScreen />} />
              <Route path='/reset-password/:token' element={<ResetPasswordScreen />} />
            </Routes>
          </main>
        </div>
      </Router>
    </StoreProvider>
  );
}

export default App;