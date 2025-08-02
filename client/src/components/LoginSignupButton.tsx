import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { User, ChevronDown, LogOut, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';

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
      <Button 
        disabled 
        variant="outline" 
        size="sm"
        className="bg-white border-gray-300 text-gray-700 font-medium"
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  // Authenticated user state
  if (user) {
    const shouldShowImage = userProfile?.avatar && !imageError;
    
    return (
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-white hover:bg-gray-50 flex items-center gap-2"
        >
          {shouldShowImage ? (
            <img
              src={userProfile.avatar}
              alt={userProfile.display_name || user.displayName || 'User'}
              className="h-6 w-6 rounded-full object-cover"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-3 w-3 text-gray-600" />
            </div>
          )}
          <span className="text-sm font-medium">
            {userProfile?.display_name || user.displayName || user.email?.split('@')[0] || 'User'}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </Button>
        
        {/* User Account Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
            <div className="py-1">
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  {shouldShowImage ? (
                    <img
                      src={userProfile.avatar}
                      alt={userProfile.display_name || user.displayName || 'User'}
                      className="h-8 w-8 rounded-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {userProfile?.display_name || user.displayName || 'User'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.email}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  signOut();
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="inline mr-2 h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Unauthenticated state
  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-white hover:bg-gray-50 flex items-center gap-2"
        disabled={isSigningIn}
      >
        {isSigningIn ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <User className="h-4 w-4" />
        )}
        {isSigningIn ? 'Signing in...' : 'Login/Signup'}
        <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </Button>
      
      {/* Auth Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In with Google'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 