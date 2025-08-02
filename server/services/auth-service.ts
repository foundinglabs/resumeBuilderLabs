import { auth } from 'firebase-admin';
import { DatabaseStorage } from '../storage';

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
}

export class AuthService {
  private storage: DatabaseStorage;

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
  }

  /**
   * Verify Firebase token and get user info
   */
  async verifyToken(idToken: string): Promise<AuthUser> {
    try {
      const decodedToken = await auth().verifyIdToken(idToken);
      
      return {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name || undefined,
        photoURL: decodedToken.picture || undefined,
        emailVerified: decodedToken.email_verified || false
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Get or create user profile
   */
  async getUserProfile(firebaseUid: string) {
    try {
      // Try to get existing user
      const user = await this.storage.getUserByFirebaseUid(firebaseUid);
      return user;
    } catch (error) {
      // User doesn't exist, create new profile
      return null;
    }
  }

  /**
   * Create or update user profile
   */
  async createOrUpdateUserProfile(authUser: AuthUser) {
    try {
      const existingUser = await this.storage.getUserByFirebaseUid(authUser.uid);
      
      if (existingUser) {
        // Update existing user
        return await this.storage.updateUserByFirebaseUid(authUser.uid, {
          email: authUser.email,
          display_name: authUser.displayName,
          avatar: authUser.photoURL,
          email_verified: authUser.emailVerified,
          last_login: new Date()
        });
      } else {
        // Create new user
        return await this.storage.createUser({
          firebase_uid: authUser.uid,
          email: authUser.email,
          username: authUser.email.split('@')[0],
          display_name: authUser.displayName,
          avatar: authUser.photoURL,
          email_verified: authUser.emailVerified,
          auth_provider: 'firebase'
        });
      }
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
      throw error;
    }
  }
} 