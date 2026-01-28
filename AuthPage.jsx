import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : { username: formData.username, email: formData.email, password: formData.password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        // Store token
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Redirect or callback
        if (onAuthSuccess) {
          onAuthSuccess(data.data);
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <motion.h1 
            className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-purple-500 to-pink-500 mb-2"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            ROBOX
          </motion.h1>
          <p className="text-gray-400 text-lg font-medium">
            Premium Roblox Marketplace
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-700">
          {/* Toggle Tabs */}
          <div className="flex bg-gray-900/50">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 text-lg font-bold transition-all ${
                isLogin 
                  ? 'bg-gradient-to-r from-emerald-500 to-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 text-lg font-bold transition-all ${
                !isLogin 
                  ? 'bg-gradient-to-r from-emerald-500 to-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Username (Register only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-all"
                  placeholder="Choose a username"
                  required={!isLogin}
                />
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-all"
                placeholder="your@email.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Confirm Password (Register only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-all"
                  placeholder="••••••••"
                  required={!isLogin}
                />
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500 rounded-xl p-3 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
                loading
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-purple-600 text-white hover:shadow-2xl hover:scale-105'
              }`}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Processing...
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </motion.button>

            {/* Forgot Password Link (Login only) */}
            {isLogin && (
              <div className="text-center">
                <a href="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                  Forgot your password?
                </a>
              </div>
            )}
          </form>

          {/* Benefits (Register only) */}
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 px-8 py-6 border-t border-gray-700"
            >
              <h3 className="text-sm font-bold text-emerald-400 mb-3">New User Benefits:</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  100 Points Welcome Bonus
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  Access to Exclusive Mystery Boxes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  Premium Roblox Accounts
                </li>
              </ul>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
