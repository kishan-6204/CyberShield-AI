import { createContext, useEffect, useMemo, useState } from 'react';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, hasFirebaseConfig } from '../firebase/config.js';
import { syncUserDocument } from '../services/firestoreService.js';

const AuthContext = createContext(null);

function getFriendlyAuthError(error) {
  const code = error?.code || '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An account already exists for that email.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'The browser blocked the Google sign-in popup.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'A network error occurred. Check your connection and try again.';
    case 'auth/missing-email':
      return 'Enter an email address to continue.';
    case 'auth/missing-password':
      return 'Enter a password to continue.';
    default:
      return error?.message || 'Authentication failed. Please try again.';
  }
}

function buildError(error) {
  return new Error(getFriendlyAuthError(error));
}

function getDisplayName(user) {
  return user?.displayName || user?.email?.split('@')[0] || 'User';
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let unsubscribe = () => {};

    const bootstrap = async () => {
      if (!hasFirebaseConfig) {
        setLoading(false);
        return;
      }

      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch {
        // Continue with the default persistence if local storage is unavailable.
      }

      unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
          if (user) {
            await syncUserDocument(user);
          }

          setCurrentUser(user);
        } catch (authError) {
          setError(getFriendlyAuthError(authError));
          setCurrentUser(user);
        } finally {
          setLoading(false);
        }
      });
    };

    bootstrap();

    return () => {
      unsubscribe();
    };
  }, []);

  const clearError = () => setError('');

  const login = async (email, password) => {
    clearError();

    try {
      await setPersistence(auth, browserLocalPersistence);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return credential.user;
    } catch (authError) {
      const friendlyError = buildError(authError);
      setError(friendlyError.message);
      throw friendlyError;
    }
  };

  const register = async (name, email, password) => {
    clearError();

    try {
      await setPersistence(auth, browserLocalPersistence);
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      return credential.user;
    } catch (authError) {
      const friendlyError = buildError(authError);
      setError(friendlyError.message);
      throw friendlyError;
    }
  };

  const googleSignIn = async () => {
    clearError();

    try {
      await setPersistence(auth, browserLocalPersistence);
      const credential = await signInWithPopup(auth, googleProvider);
      return credential.user;
    } catch (authError) {
      const friendlyError = buildError(authError);
      setError(friendlyError.message);
      throw friendlyError;
    }
  };

  const logout = async () => {
    clearError();

    try {
      await signOut(auth);
    } catch (authError) {
      const friendlyError = buildError(authError);
      setError(friendlyError.message);
      throw friendlyError;
    }
  };

  const resetPassword = async (email) => {
    clearError();

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (authError) {
      const friendlyError = buildError(authError);
      setError(friendlyError.message);
      throw friendlyError;
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      currentUserName: getDisplayName(currentUser),
      loading,
      error,
      clearError,
      login,
      register,
      logout,
      googleSignIn,
      resetPassword,
    }),
    [currentUser, error, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
export default AuthContext;
