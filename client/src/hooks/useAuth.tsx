import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';


interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile (simplified without Supabase)
  const fetchUserProfile = async (firebaseUser: User) => {
    // Create a simple user profile from Firebase user data
    const profile = {
      id: firebaseUser.uid,
      firebase_uid: firebaseUser.uid,
      email: firebaseUser.email,
      username: firebaseUser.email?.split('@')[0] || firebaseUser.uid,
      display_name: firebaseUser.displayName,
      avatar: firebaseUser.photoURL,
      email_verified: firebaseUser.emailVerified,
      auth_provider: 'firebase'
    };
    setUserProfile(profile);
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  // Sign in function
  const signIn = async () => {
    try {
      const { signInWithGoogle } = await import('../lib/firebase');
      const firebaseUser = await signInWithGoogle();
      
      // Create user profile locally
      await fetchUserProfile(firebaseUser);
    } catch (error: any) {
      console.error('Sign-in error:', error);
      
      // Don't throw error for user cancellation
      if (error.message === 'Sign-in was cancelled by user') {
        console.log('User cancelled sign-in');
        return;
      }
      
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      const { signOutUser } = await import('../lib/firebase');
      await signOutUser();
      setUserProfile(null);
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile
        await fetchUserProfile(firebaseUser);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signOut,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 