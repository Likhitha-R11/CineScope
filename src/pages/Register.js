import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const emojiOptions = [
  '😀', '😎', '🤩', '🧐', '👩', '👨', '👧', '👦', '👩‍🎤', '👨‍🎤', 
  '🦸‍♀️', '🦸‍♂️', '🧙‍♀️', '🧙‍♂️', '👽', '🤖', '🐶', '🐱', '🦊', '🐼'
];

export default function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    profileEmoji: '👤',
    acceptedTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (!formData.acceptedTerms) {
      toast.error('You must accept the terms and conditions');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          profile_emoji: formData.profileEmoji,
          accepted_terms: formData.acceptedTerms
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Registration successful!');
        navigate('/login'); // Redirect to sign in page after registration
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400">Join CineScope today</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Choose Profile Emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, profileEmoji: emoji }))}
                      className={`text-2xl p-2 rounded-full ${formData.profileEmoji === emoji ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="terms"
                  name="acceptedTerms"
                  type="checkbox"
                  checked={formData.acceptedTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-700"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                  I agree to the{' '}
                  <button type="button" className="text-purple-400 hover:underline" onClick={() => {
                    toast(
                      <div className="max-w-md p-4 bg-gray-800 rounded-lg">
                        <h3 className="font-bold text-white mb-2">Terms and Conditions</h3>
                        <p className="text-gray-300 text-sm">
                          By using CineScope, you agree to our terms of service. All movie data is provided by TMDb.
                          The data belongs to TMDb and is used under their terms of service.
                        </p>
                      </div>,
                      { duration: 6000 }
                    );
                  }}>
                    Terms and Conditions
                  </button>
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

