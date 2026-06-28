import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  position: relative;
  color: white;
  background-image: url('/horizontal_combined_movie_poster.png');
  background-size: 90%;
  background-position: center;
  background-repeat: no-repeat;
  isolation: isolate;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(8, 8, 8, 0.6); /* dark overlay */
    z-index: -1;
  }
`;

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotConfirm, setForgotConfirm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        onLogin(data.access_token, data.user);
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Local forgot password (no email, just set new password)
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotPassword || !forgotConfirm) {
      toast.error('Please fill all fields');
      return;
    }
    if (forgotPassword !== forgotConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      // Must be logged in to reset password (token required)
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
        body: JSON.stringify({ new_password: forgotPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Password reset successfully! You can now login.');
        setForgotOpen(false);
        setForgotPassword('');
        setForgotConfirm('');
      } else {
        toast.error(data.error || 'Password reset failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">Sign in to your CineScope account</p>
          </div>

          {!forgotOpen ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  className="text-sm text-purple-400 hover:text-purple-300"
                  onClick={() => setForgotOpen(true)}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label htmlFor="forgotPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  id="forgotPassword"
                  type="password"
                  value={forgotPassword}
                  onChange={(e) => setForgotPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="forgotConfirm" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="forgotConfirm"
                  type="password"
                  value={forgotConfirm}
                  onChange={(e) => setForgotConfirm(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="text-sm text-gray-400 hover:text-gray-200"
                  onClick={() => setForgotOpen(false)}
                >
                  Back to Login
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {!forgotOpen && (
            <div className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </LoginContainer>
  );
}

