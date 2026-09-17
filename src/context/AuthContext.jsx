import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { api } from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(() => {
    return localStorage.getItem('skillkollab_onboarded') === 'true';
  });

  // Global Auth Modal & Pending Action State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingActionState] = useState(null);

  const openAuthModal = useCallback((actionOrPath = null) => {
    if (actionOrPath) {
      setPendingActionState(() => actionOrPath);
    }
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setPendingActionState(null);
  }, []);

  const clearPendingAction = useCallback(() => {
    setPendingActionState(null);
  }, []);

  const fetchUserProfile = async (firebaseUser) => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        return userDocSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    let profileUnsubscribe = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        setToken(idToken);
        localStorage.setItem('skillkollab_token', idToken);
        
        const handleUserFallback = () => {
          const fallbackData = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'USER'
          };
          setUser(fallbackData);
          localStorage.setItem('skillkollab_user', JSON.stringify(fallbackData));
          setOnboardingCompleted(false);
          localStorage.removeItem('skillkollab_onboarded');
        };

        // Real-time listener for user profile
        profileUnsubscribe = onSnapshot(
          doc(db, 'users', firebaseUser.uid), 
          (docSnap) => {
            if (docSnap.exists()) {
              const profile = docSnap.data();
              const userData = {
                id: firebaseUser.uid,
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                ...profile
              };
              setUser(userData);
              localStorage.setItem('skillkollab_user', JSON.stringify(userData));
              
              if (userData.onboarding) {
                setOnboardingCompleted(true);
                localStorage.setItem('skillkollab_onboarded', 'true');
              } else {
                setOnboardingCompleted(false);
                localStorage.removeItem('skillkollab_onboarded');
              }
            } else {
              handleUserFallback();
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching user profile snapshot:", error);
            handleUserFallback();
            setLoading(false); // Ensure loading resolves even on error
          }
        );
        
        // Connect socket if necessary
        try {
          socketService.connect(firebaseUser.uid, idToken);
        } catch (err) {}
      } else {
        if (profileUnsubscribe) {
          profileUnsubscribe();
          profileUnsubscribe = null;
        }
        setUser(null);
        setToken(null);
        localStorage.removeItem('skillkollab_user');
        localStorage.removeItem('skillkollab_token');
        socketService.disconnect();
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const profile = await fetchUserProfile(firebaseUser);
      
      const userData = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        ...profile
      };
      
      return { success: true, user: userData };
    } catch (err) {
      console.error('Login error:', err);
      let message = 'Invalid login credentials';
      if (err.code === 'auth/user-not-found') message = 'No account exists with this email.';
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') message = 'Incorrect email or password.';
      else if (err.code === 'auth/network-request-failed') message = 'Network error. Please try again.';
      else if (err.code === 'auth/operation-not-allowed') message = 'Email/Password login is not enabled in Firebase Console.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithProvider = async (providerName) => {
    setLoading(true);
    try {
      const provider = providerName === 'GitHub' ? new GithubAuthProvider() : new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      
      let profile = await fetchUserProfile(firebaseUser);
      
      if (!profile) {
        // Create profile if it doesn't exist
        profile = {
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
          role: 'STUDENT', // Default role for OAuth, can be overridden during signup flow
          avatarUrl: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
          bio: `Signed in via ${providerName} OAuth.`,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), profile);
      }
      
      const userData = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        ...profile
      };
      
      return { success: true, user: userData };
    } catch (err) {
      console.error('OAuth login error:', err);
      let message = 'Authentication failed';
      if (err.code === 'auth/popup-closed-by-user') message = 'Sign-in was cancelled.';
      else if (err.code === 'auth/operation-not-allowed') message = `${providerName} login is not enabled in Firebase Console.`;
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = 'USER', profileData = null) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const profile = {
        name,
        email,
        role,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        bio: 'New SkillKollab builder ready to create impactful projects.',
        createdAt: new Date().toISOString(),
        ...profileData
      };

      if (role === 'ORGANIZATION_ADMIN') {
        profile.organization = {
          name: name,
          officialEmail: email,
          verificationStatus: 'UNDER_REVIEW'
        };
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), profile);

      const userData = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        ...profile
      };
      
      return { success: true, user: userData };
    } catch (err) {
      console.error('Registration error:', err);
      let message = 'Registration failed';
      if (err.code === 'auth/email-already-in-use') message = 'An account with this email already exists.';
      else if (err.code === 'auth/weak-password') message = 'Password is too weak.';
      else if (err.code === 'auth/operation-not-allowed') message = 'Email/Password registration is not enabled in Firebase Console.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
    // State is cleared by onAuthStateChanged
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err) {
      console.error('Password reset error:', err);
      return { success: false, message: err.message };
    }
  };

  const completeOnboarding = (data) => {
    setOnboardingCompleted(true);
    localStorage.setItem('skillkollab_onboarded', 'true');
    if (user) {
      const updatedRole = data.role || user.role;
      const activeRole = data.role || user.role;
      const updated = { ...user, role: updatedRole, activeRole: activeRole, onboarding: data };
      setUser(updated);
      localStorage.setItem('skillkollab_user', JSON.stringify(updated));
      
      // Update Firestore
      setDoc(doc(db, 'users', user.uid), { role: updatedRole, activeRole: activeRole, onboarding: data }, { merge: true }).catch(console.error);
    }
  };

  const updateActiveRole = async (newRole) => {
    if (!user) return;
    try {
      const updated = { ...user, activeRole: newRole };
      setUser(updated);
      localStorage.setItem('skillkollab_user', JSON.stringify(updated));
      await setDoc(doc(db, 'users', user.uid), { activeRole: newRole }, { merge: true });
      return true;
    } catch (err) {
      console.error('Error updating active role:', err);
      return false;
    }
  };

  // Helper hook to guard any user action or route navigation
  const requireAuth = useCallback((actionCallbackOrPath) => {
    const isLogged = !!(user && token);
    if (isLogged) {
      if (typeof actionCallbackOrPath === 'function') {
        actionCallbackOrPath();
      }
      return true;
    } else {
      if (typeof actionCallbackOrPath === 'string') {
        sessionStorage.setItem('skillkollab_pending_redirect', actionCallbackOrPath);
      }
      openAuthModal(actionCallbackOrPath);
      return false;
    }
  }, [user, token, openAuthModal]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!(user && token),
    onboardingCompleted,
    login,
    loginWithProvider,
    register,
    logout,
    resetPassword,
    completeOnboarding,
    updateActiveRole,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    pendingAction,
    clearPendingAction,
    requireAuth,
    activeRole: user?.activeRole || user?.role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
