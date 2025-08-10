import { Console } from 'console';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged, User } from 'firebase/auth';



// Check if Firebase environment variables are defined

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};



// Check if all required Firebase config values are present
const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
  console.warn('Firebase environment variables are missing. Please check your .env file.');
  console.warn('Missing variables:', missingKeys.map(key => `VITE_FIREBASE_${key.toUpperCase()}`));
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Set popup size and position for better UX
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Handle popup blocking in development
if (import.meta.env.DEV) {
  // In development, we might need to handle popup blocking
  console.log('Running in development mode - popup blocking might occur');
}

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    // Handle specific popup errors gracefully
    if (error.code === 'auth/popup-closed-by-user') {
      console.log('User closed the popup window');
      throw new Error('Sign-in was cancelled by user');
    }
    
    if (error.code === 'auth/popup-blocked') {
      console.log('Popup was blocked by browser');
      throw new Error('Popup was blocked. Please allow popups for this site.');
    }
    
    throw error;
  }
};

// Alternative sign-in method using redirect (for cases where popup fails)
export const signInWithGoogleRedirect = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    console.error('Google redirect sign-in error:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Get user token for API calls
export const getUserToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
}; 