//import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
//import { toast } from 'react-hot-toast';

export default function ForgotPassword() {
  // This page is not needed if you don't use email-based reset.
  // You can remove this file or just show a message.
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
          <p className="text-gray-400 mb-4">
            Please use the "Forgot password?" link on the login page to reset your password.
          </p>
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}