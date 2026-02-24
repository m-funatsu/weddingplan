"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { createCheckoutSession } from "@/lib/stripe";

interface PremiumContextValue {
  isPremium: boolean;
  isLoading: boolean;
  upgrade: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextValue>({
  isPremium: false,
  isLoading: true,
  upgrade: async () => {},
});

export function usePremium() {
  return useContext(PremiumContext);
}

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const { user, isGuest } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isGuest || !user) {
      setIsPremium(false);
      setIsLoading(false);
      return;
    }

    if (!isSupabaseConfigured()) {
      setIsPremium(false);
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const { data } = await supabase
          .from("weddingroadmap_profiles")
          .select("is_premium")
          .eq("user_id", user.id)
          .single();
        setIsPremium(data?.is_premium === true);
      } catch {
        setIsPremium(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user, isGuest]);

  const upgrade = useCallback(async () => {
    if (!user) return;
    try {
      const { url } = await createCheckoutSession(user.id);
      if (url) {
        window.location.href = url;
      } else {
        alert("Stripeが未設定です。環境変数を確認してください。");
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("チェックアウトに失敗しました。もう一度お試しください。");
    }
  }, [user]);

  return (
    <PremiumContext.Provider value={{ isPremium, isLoading, upgrade }}>
      {children}
    </PremiumContext.Provider>
  );
}
