'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import type { UserProfile } from '@/types';

const MOCK_USER: UserProfile = {
  uid: 'local-user-id',
  email: 'guest@flexform.local',
  displayName: 'Guest Explorer',
  photoURL: null,
};

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // Local mode: check if we "logged in" previously
      if (typeof window !== 'undefined') {
        const isLocalLoggedIn = localStorage.getItem('flexform_local_auth') === 'true';
        if (isLocalLoggedIn) {
          setUser(MOCK_USER);
        }
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      // Mock login for local mode
      localStorage.setItem('flexform_local_auth', 'true');
      setUser(MOCK_USER);
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured || !auth) {
      // Mock logout for local mode
      localStorage.removeItem('flexform_local_auth');
      setUser(null);
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
      throw error;
    }
  };

  return { user, loading, login, logout };
}