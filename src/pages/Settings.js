import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import CineScopeLogo from "./Homecomponents/cslogo";

const emojiOptions = [
  '😀', '😎', '🤩', '🧐', '👩', '👨', '👧', '👦', '👩‍🎤', '👨‍🎤', 
  '🦸‍♀️', '🦸‍♂️', '🧙‍♀️', '🧙‍♂️', '👽', '🤖', '🐶', '🐱', '🦊', '🐼'
];

const genreOptions = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
  'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
  'Thriller', 'War', 'Western'
];

// Add your supported languages here
const languageOptions = [
  'English', 'Hindi', 'Telugu', 'Tamil', 'Malayalam', 'Kannada'
];

export default function Settings({ profile, profiles, onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState('');
  const [profileEmoji, setProfileEmoji] = useState('👤');
  const [preferredGenres, setPreferredGenres] = useState([]);
  const [preferredLanguages, setPreferredLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // Find the index of the selected profile
  const profileIdx = profiles?.findIndex(
    p => p.name === profile?.name && p.profile_emoji === profile?.profile_emoji
  );

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setProfileEmoji(profile.profile_emoji || '👤');
      setPreferredGenres(profile.preferred_genres || []);
      setPreferredLanguages(profile.preferred_languages || []);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (profileIdx !== undefined && profileIdx !== -1) {
        const response = await fetch(`http://localhost:5000/user/profile/${profileIdx}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name,
            profile_emoji: profileEmoji
          }),
        });
        if (response.ok) {
          toast.success('Profile updated successfully!');
          if (onProfileUpdate) {
            onProfileUpdate({ name, profile_emoji: profileEmoji });
          }
          navigate('/');
        } else {
          toast.error('Failed to update profile');
        }
      } else {
        const response = await fetch('http://localhost:5000/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name,
            profile_emoji: profileEmoji
          }),
        });
        if (response.ok) {
          toast.success('Profile updated successfully!');
          if (onProfileUpdate) {
            onProfileUpdate({ name, profile_emoji: profileEmoji });
          }
          navigate('/');
        } else {
          toast.error('Failed to update profile');
        }
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const body = {
        preferred_genres: preferredGenres,
        preferred_languages: preferredLanguages
      };
      if (profileIdx !== undefined && profileIdx !== -1) {
        const response = await fetch(`http://localhost:5000/user/preferences/${profileIdx}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body),
        });
        if (response.ok) {
          toast.success('Preferences updated successfully!');
        } else {
          toast.error('Failed to update preferences');
        }
      } else {
        const response = await fetch('http://localhost:5000/user/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body),
        });
        if (response.ok) {
          toast.success('Preferences updated successfully!');
        } else {
          toast.error('Failed to update preferences');
        }
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGenre = (genre) => {
    setPreferredGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre) 
        : [...prev, genre]
    );
  };

  const toggleLanguage = (lang) => {
    setPreferredLanguages(prev =>
      prev.includes(lang)
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  // Password reset logic (local, not email)
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to reset password.');
        setIsLoading(false);
        return;
      }
      const response = await fetch('http://localhost:5000/user/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_password: newPassword }),
      });
      if (response.ok) {
        toast.success('Password reset successfully!');
        setResetPasswordOpen(false);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <CineScopeLogo />
          <h2 className="text-3xl font-bold text-white mt-4">Settings</h2>
        </div>
        
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 font-medium ${activeTab === 'preferences' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
          >
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 font-medium ${activeTab === 'account' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
          >
            Account
          </button>
        </div>
        
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Edit Profile</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profile Emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setProfileEmoji(emoji)}
                      className={`text-2xl p-2 rounded-full ${profileEmoji === emoji ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'preferences' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Genre Preferences</h3>
            <p className="text-gray-400 mb-6">Select your favorite genres to get better recommendations</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
              {genreOptions.map(genre => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    preferredGenres.includes(genre)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            <h3 className="text-xl font-bold text-white mb-4 mt-8">Language Preferences</h3>
            <p className="text-gray-400 mb-6">Select your favorite languages to get better recommendations</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {languageOptions.map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    preferredLanguages.includes(lang)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleSavePreferences}
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </button>
          </motion.div>
        )}
        
        {activeTab === 'account' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Account Settings</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Change Password</h4>
                <button
                  onClick={() => setResetPasswordOpen((v) => !v)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  {resetPasswordOpen ? "Cancel" : "Reset Password"}
                </button>
                {resetPasswordOpen && (
                  <form onSubmit={handlePasswordReset} className="mt-4 space-y-3">
                    <input
                      type="password"
                      placeholder="New Password"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                )}
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-lg font-medium text-white mb-2">Danger Zone</h4>
                <button
                  onClick={() => toast.error('This feature is not implemented yet')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Account
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  Warning: This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

