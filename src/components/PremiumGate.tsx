"use client";

import { useState } from "react";
import { usePremium } from "@/contexts/PremiumContext";
import { PRICE_PREMIUM } from "@/lib/stripe";
import { Paywall } from "@/components/shared/Paywall";

interface PremiumGateProps {
  children: React.ReactNode;
  featureName?: string;
}

export default function PremiumGate({ children, featureName }: PremiumGateProps) {
  const { isPremium, isLoading, upgrade } = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);

  if (isLoading) {
    return (
      <div className="page-with-nav min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" role="status" aria-label="読み込み中" />
      </div>
    );
  }

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="page-with-nav min-h-screen bg-gradient-to-b from-rose-50/50 to-white relative">
      {/* Blurred content preview - hidden from accessibility tree */}
      <div className="pointer-events-none select-none filter blur-sm opacity-50" aria-hidden="true">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10" role="dialog" aria-modal="true" aria-label={featureName || "PRO機能"}>
        <div className="bg-white rounded-2xl shadow-xl border border-rose-100 p-8 max-w-sm mx-4 text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl" aria-hidden="true">🔒</span>
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold mb-3">
            PRO
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {featureName || "PRO機能"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            この機能はPremiumプランで利用できます
          </p>
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-900">&yen;{PRICE_PREMIUM.toLocaleString()}</span>
            <span className="text-sm text-gray-500 ml-1">買い切り</span>
          </div>
          <button
            onClick={() => setShowPaywall(true)}
            autoFocus
            className="w-full py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/25"
          >
            Premiumにアップグレード
          </button>
          <p className="text-xs text-gray-400 mt-3">
            一度の購入でずっと使えます
          </p>
        </div>
      </div>

      <Paywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        featureTitle="予算管理 & プレナップチェック"
        featureDescription="結婚式の予算をカテゴリ別に管理し、プレナップチェックリストで大切な話し合いを進めましょう。"
        priceLabel="¥980（買い切り）"
        onUpgrade={() => {
          setShowPaywall(false);
          upgrade();
        }}
      />
    </div>
  );
}
