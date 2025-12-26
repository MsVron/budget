import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly AUTH_KEY = 'isAuthenticated';
  private readonly USER_KEY = 'currentUser';
  private auth = getAuth();
  private currentUser: User | null = null;

  constructor(
    private storageService: StorageService,
    private router: Router
  ) {
    // Listen to auth state changes
    onAuthStateChanged(this.auth, async (user) => {
      this.currentUser = user;
      if (user) {
        await this.storageService.set(this.AUTH_KEY, true);
        await this.storageService.set(this.USER_KEY, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
      } else {
        await this.storageService.remove(this.AUTH_KEY);
        await this.storageService.remove(this.USER_KEY);
      }
    });
  }

  /**
   * Sign up a new user with email and password
   */
  async signup(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return { success: true };
    } catch (error: any) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return { success: true };
    } catch (error: any) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      await this.storageService.remove(this.AUTH_KEY);
      await this.storageService.remove(this.USER_KEY);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const isAuth = await this.storageService.get(this.AUTH_KEY);
    return isAuth === true && this.currentUser !== null;
  }

  /**
   * Get current user data
   */
  async getCurrentUser(): Promise<any> {
    return await this.storageService.get(this.USER_KEY);
  }

  /**
   * Get Firebase user object
   */
  getFirebaseUser(): User | null {
    return this.currentUser;
  }

  /**
   * Convert Firebase error codes to user-friendly messages
   */
  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/operation-not-allowed': 'Operation not allowed.',
      'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.'
    };

    return errorMessages[errorCode] || 'An error occurred. Please try again.';
  }
}