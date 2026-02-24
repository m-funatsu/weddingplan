"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { getUser, onAuthStateChange, signOut } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import AuthForm from "./AuthForm";

interface AuthContextValue {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isGuest: true,
  isLoading: true,
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const GUEST_MODE_KEY = "weddingplan_guest_mode";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsGuest(true);
      setIsLoading(false);
      return;
    }

    const storedGuest = localStorage.getItem(GUEST_MODE_KEY);

    getUser().then((u) => {
      if (u) {
        setUser(u);
        localStorage.removeItem(GUEST_MODE_KEY);
      } else if (storedGuest === "true") {
        setIsGuest(true);
      }
      setIsLoading(false);
    });

    const unsubscribe = onAuthStateChange((u) => {
      setUser(u);
      if (u) {
        setIsGuest(false);
        localStorage.removeItem(GUEST_MODE_KEY);
      }
    });

    return unsubscribe;
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem(GUEST_MODE_KEY);
  }, []);

  function handleSkip() {
    setIsGuest(true);
    localStorage.setItem(GUEST_MODE_KEY, "true");
  }

  function handleAuthSuccess() {
    // Auth state change listener will update the user
    localStorage.removeItem(GUEST_MODE_KEY);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <AuthForm onSuccess={handleAuthSuccess} onSkip={handleSkip} />;
  }

  return (
    <AuthContext.Provider value={{ user, isGuest, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
