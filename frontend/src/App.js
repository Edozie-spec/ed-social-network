import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import ChatsScreen from './screens/ChatsScreen';
import OfflineIndicator from './components/OfflineIndicator';

function App() {
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [showInstallBtn, setShowInstallBtn] = React.useState(false);

  React.useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });

    window.addEventListener('appinstalled', () => {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
        setShowInstallBtn(false);
      });
    }
  };
  return (
    <Router>
        <div className="min-h-screen mesh-bg transition-colors duration-500 font-sans">
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
              <Route path='/chats' element={<ChatsScreen />} />
              <Route path='/forgot-password' element={<ForgotPasswordScreen />} />
              <Route path='/reset-password/:token' element={<ResetPasswordScreen />} />
            </Routes>
          </main>
          <OfflineIndicator />
          {showInstallBtn && (
            <div className="fixed bottom-4 left-4 z-50">
              <button 
                onClick={handleInstallClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded shadow-lg transition duration-300 flex items-center space-x-2"
              >
                <span>📱</span>
                <span>Install App</span>
              </button>
            </div>
          )}
        </div>
      </Router>
  );
}

export default App;