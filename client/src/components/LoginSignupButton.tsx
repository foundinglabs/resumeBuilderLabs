import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { User, ChevronDown, LogOut, Loader2, LogIn, UserPlus, Mail } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

export const LoginSignupButton: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user, userProfile, loading, signIn, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [user]);

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setShowDropdown(false);
      await signIn();
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle navigation to login page
  const handleNavigateToLogin = () => {
    setShowDropdown(false);
    setLocation('/login');
  };

  // Handle navigation to signup page
  const handleNavigateToSignup = () => {
    setShowDropdown(false);
    setLocation('/signup');
  };

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Button 
          disabled 
          variant="outline" 
          size="sm"
          className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </Button>
      </motion.div>
    );
  }

  // Authenticated user state
  if (user) {
    const shouldShowImage = userProfile?.avatar && !imageError;
    
    return (
      <div className="relative" ref={dropdownRef}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-slate-200 hover:text-slate-800 dark:hover:text-white flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {shouldShowImage ? (
              <img
                src={userProfile.avatar}
                alt={userProfile.display_name || user.displayName || 'User'}
                className="h-6 w-6 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-600"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-slate-200 dark:ring-slate-600">
                <User className="h-3 w-3 text-white" />
              </div>
            )}
            <span className="text-sm font-medium">
              {userProfile?.display_name || user.displayName || user.email?.split('@')[0] || 'User'}
            </span>
            <motion.div
              animate={{ rotate: showDropdown ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </Button>
        </motion.div>
        
        {/* User Account Dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
            >
              <div className="py-1">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-700 dark:to-slate-800">
                  <div className="flex items-center space-x-3">
                    {shouldShowImage ? (
                      <img
                        src={userProfile.avatar}
                        alt={userProfile.display_name || user.displayName || 'User'}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-600"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-slate-200 dark:ring-slate-600">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {userProfile?.display_name || user.displayName || 'User'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ backgroundColor: "#f1f5f9" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowDropdown(false);
                    signOut();
                  }}
                  className="block w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                >
                  <LogOut className="inline mr-2 h-4 w-4" />
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Unauthenticated state
  return (
    <div className="relative" ref={dropdownRef}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-slate-200 hover:text-slate-800 dark:hover:text-white flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
          disabled={isSigningIn}
        >
          {isSigningIn ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <User className="h-4 w-4" />
          )}
          {isSigningIn ? 'Signing in...' : 'Login/Signup'}
          <motion.div
            animate={{ rotate: showDropdown ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </Button>
      </motion.div>
      
      {/* Auth Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
          >
            <div className="py-1">
              {/* Quick Google Sign In */}
              <motion.button
                whileHover={{ backgroundColor: "#f1f5f9" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="block w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-b border-slate-100 dark:border-slate-700"
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="inline mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="px-4 py-2">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">or</span>
                  </div>
                </div>
              </div>

              {/* Login Option */}
              <motion.button
                whileHover={{ backgroundColor: "#f1f5f9" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNavigateToLogin}
                className="block w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
              >
                <LogIn className="inline mr-2 h-4 w-4" />
                Sign In
              </motion.button>

              {/* Signup Option */}
              <motion.button
                whileHover={{ backgroundColor: "#f1f5f9" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNavigateToSignup}
                className="block w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
              >
                <UserPlus className="inline mr-2 h-4 w-4" />
                Create Account
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 