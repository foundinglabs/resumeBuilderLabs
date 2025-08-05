import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { User, ChevronDown, LogOut, Loader2 } from 'lucide-react';
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

  // Handle sign in
  const handleSignIn = async () => {
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
          className="bg-white border-slate-300 text-slate-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
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
            className="bg-white hover:bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {shouldShowImage ? (
              <img
                src={userProfile.avatar}
                alt={userProfile.display_name || user.displayName || 'User'}
                className="h-6 w-6 rounded-full object-cover ring-2 ring-slate-200"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-slate-200">
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
              className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden"
            >
              <div className="py-1">
                <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center space-x-3">
                    {shouldShowImage ? (
                      <img
                        src={userProfile.avatar}
                        alt={userProfile.display_name || user.displayName || 'User'}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-200"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-slate-200">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {userProfile?.display_name || user.displayName || 'User'}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
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
                  className="block w-full text-left px-4 py-3 text-sm text-slate-700 hover:text-slate-900 transition-colors duration-200"
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
          className="bg-white hover:bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
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
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden"
          >
            <div className="py-1">
              <motion.button
                whileHover={{ backgroundColor: "#f1f5f9" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="block w-full text-left px-4 py-3 text-sm text-slate-700 hover:text-slate-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In with Google'
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 