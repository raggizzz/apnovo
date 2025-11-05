import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  getIdToken: () => Promise<string | null>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email?: string) => Promise<void>;
  completeEmailSignIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      void completeEmailFlowIfNeeded();
    }
  }, [loading]);

  const completeEmailFlowIfNeeded = async () => {
    if (typeof window === "undefined") return;
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const storedEmail = window.localStorage.getItem("lostfoundEmailForSignIn");
      if (!storedEmail) {
        throw new Error("E-mail não encontrado. Reenvie o link.");
      }
      await signInWithEmailLink(auth, storedEmail, window.location.href);
      window.localStorage.removeItem("lostfoundEmailForSignIn");
    }
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    async getIdToken() {
      return user ? user.getIdToken() : null;
    },
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    },
    async signInWithEmail(email?: string) {
      if (!email || typeof window === "undefined") return;
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("lostfoundEmailForSignIn", email);
    },
    async completeEmailSignIn() {
      await completeEmailFlowIfNeeded();
    },
    async signOut() {
      await firebaseSignOut(auth);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
