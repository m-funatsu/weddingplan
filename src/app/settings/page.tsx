"use client";

import { useState, useEffect, useCallback } from "react";
import { useWeddingSettings, useWeddingTasks, usePrenupItems } from "@/lib/hooks";
import { usePremium } from "@/contexts/PremiumContext";
import { useAuth } from "@/components/AuthGuard";
import {
  getShareCode,
  generateShareCode,
  saveShareCodeToProfile,
  linkPartner,
  getPartnerLinkStatus,
  unlinkPartner,
} from "@/lib/sharing";

export default function SettingsPage() {
  const { settings, isLoaded, updateSettings } = useWeddingSettings();
  const { resetTasks } = useWeddingTasks();
  const { resetItems } = usePrenupItems();
  const { isPremium, upgrade } = usePremium();
  const { user, isGuest } = useAuth();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Partner sharing state
  const [shareCode, setShareCode] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [isLinked, setIsLinked] = useState(false);
  const [partnerUserId, setPartnerUserId] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const isJa = settings.language === "ja";

  // Load partner sharing status
  useEffect(() => {
    async function loadPartnerStatus() {
      if (user) {
        const status = await getPartnerLinkStatus(user.id);
        setShareCode(status.shareCode ?? getShareCode());
        setIsLinked(status.linked);
        setPartnerUserId(status.partnerUserId);
        // Save share code to profile if user is logged in
        if (status.shareCode) {
          await saveShareCodeToProfile(user.id, status.shareCode);
        }
      } else {
        setShareCode(getShareCode());
      }
    }
    loadPartnerStatus();
  }, [user]);

  const handleRegenerateCode = useCallback(async () => {
    const newCode = generateShareCode();
    setShareCode(newCode);
    if (user) {
      await saveShareCodeToProfile(user.id, newCode);
    }
  }, [user]);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  }, [shareCode]);

  const handleLinkPartner = useCallback(async () => {
    if (!partnerCode.trim()) {
      setShareError(isJa ? "招待コードを入力してください" : "Please enter an invite code");
      return;
    }

    setShareLoading(true);
    setShareError(null);
    setShareSuccess(null);

    if (user) {
      const result = await linkPartner(user.id, partnerCode.trim());
      if (result.success) {
        setIsLinked(true);
        setShareSuccess(isJa ? "パートナーとリンクしました" : "Successfully linked with partner");
        setPartnerCode("");
      } else {
        setShareError(result.error ?? (isJa ? "リンクに失敗しました" : "Failed to link"));
      }
    } else {
      // Guest mode: store locally only
      localStorage.setItem("weddingroadmap_linked_partner", JSON.stringify({
        email: partnerCode.trim(),
        linkedAt: new Date().toISOString(),
      }));
      setIsLinked(true);
      setShareSuccess(isJa ? "招待コードを保存しました（ログイン後に同期されます）" : "Invite code saved (will sync after login)");
      setPartnerCode("");
    }

    setShareLoading(false);
  }, [partnerCode, user, isJa]);

  const handleUnlinkPartner = useCallback(() => {
    unlinkPartner();
    setIsLinked(false);
    setPartnerUserId(null);
    setShareSuccess(null);
  }, []);

  function handleResetAll() {
    resetTasks();
    resetItems();
    setShowResetConfirm(false);
  }

  function handleExport() {
    const data = {
      tasks: localStorage.getItem("weddingroadmap_v2_tasks"),
      prenup: localStorage.getItem("weddingroadmap_v2_prenup"),
      settings: localStorage.getItem("weddingroadmap_v2_settings"),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weddingroadmap-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.tasks) localStorage.setItem("weddingroadmap_v2_tasks", data.tasks);
          if (data.prenup) localStorage.setItem("weddingroadmap_v2_prenup", data.prenup);
          if (data.settings) localStorage.setItem("weddingroadmap_v2_settings", data.settings);
          window.location.reload();
        } catch {
          alert(isJa ? "ファイルの読み込みに失敗しました" : "Failed to import file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  if (!isLoaded) {
    return (
      <div className="page-with-nav min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" role="status" aria-label="読み込み中" />
      </div>
    );
  }

  return (
    <div className="page-with-nav min-h-screen bg-gradient-to-b from-rose-50/50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isJa ? "設定" : "Settings"}
        </h1>

        {/* Dates & ceremony */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-base font-bold text-gray-900">
            {isJa ? "基本情報" : "Basic Info"}
          </h2>

          <div>
            <label htmlFor="marriage-date" className="block text-sm font-medium text-gray-700 mb-1">
              {isJa ? "入籍予定日" : "Marriage Registration Date"}
            </label>
            <input
              id="marriage-date"
              type="date"
              value={settings.marriageDate ?? ""}
              onChange={(e) =>
                updateSettings({ marriageDate: e.target.value || null })
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              {isJa
                ? "入籍予定日を設定すると、各タスクの推奨期限が自動計算されます"
                : "Setting a marriage date enables automatic deadline calculation"}
            </p>
          </div>

          {/* Ceremony toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {isJa ? "結婚式を行う予定" : "Planning a wedding ceremony"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {isJa
                  ? "オフにすると結婚式関連のタスクがスキップされます"
                  : "Turning this off will skip ceremony-related tasks"}
              </p>
            </div>
            <button
              role="switch"
              aria-checked={settings.hasCeremony}
              onClick={() => updateSettings({ hasCeremony: !settings.hasCeremony })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                settings.hasCeremony ? "bg-rose-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  settings.hasCeremony ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Ceremony date (shown only when hasCeremony) */}
          {settings.hasCeremony && (
            <div>
              <label htmlFor="ceremony-date" className="block text-sm font-medium text-gray-700 mb-1">
                {isJa ? "挙式日" : "Ceremony Date"}
              </label>
              <input
                id="ceremony-date"
                type="date"
                value={settings.ceremonyDate ?? ""}
                onChange={(e) =>
                  updateSettings({ ceremonyDate: e.target.value || null })
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                {isJa
                  ? "結婚式関連タスクの期限は挙式日から逆算されます"
                  : "Ceremony task deadlines are calculated from this date"}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="partner1-name" className="block text-sm font-medium text-gray-700 mb-1">
                {isJa ? "パートナー1の名前" : "Partner 1 Name"}
              </label>
              <input
                id="partner1-name"
                type="text"
                value={settings.partner1Name}
                onChange={(e) => updateSettings({ partner1Name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder={isJa ? "名前" : "Name"}
              />
            </div>
            <div>
              <label htmlFor="partner2-name" className="block text-sm font-medium text-gray-700 mb-1">
                {isJa ? "パートナー2の名前" : "Partner 2 Name"}
              </label>
              <input
                id="partner2-name"
                type="text"
                value={settings.partner2Name}
                onChange={(e) => updateSettings({ partner2Name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder={isJa ? "名前" : "Name"}
              />
            </div>
          </div>
        </section>

        {/* Budget */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-base font-bold text-gray-900">
            {isJa ? "予算設定" : "Budget Settings"}
          </h2>
          <div>
            <label htmlFor="total-budget" className="block text-sm font-medium text-gray-700 mb-1">
              {isJa ? "予算総額 (円)" : "Total Budget (JPY)"}
            </label>
            <input
              id="total-budget"
              type="number"
              value={settings.totalBudget}
              onChange={(e) =>
                updateSettings({ totalBudget: Number(e.target.value) || 0 })
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              min={0}
              step={100000}
            />
          </div>
        </section>

        {/* Language */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-base font-bold text-gray-900">
            {isJa ? "言語" : "Language"}
          </h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => updateSettings({ language: "ja" })}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                settings.language === "ja"
                  ? "bg-white text-rose-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              日本語
            </button>
            <button
              onClick={() => updateSettings({ language: "en" })}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                settings.language === "en"
                  ? "bg-white text-rose-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              English
            </button>
          </div>
        </section>

        {/* Partner Sharing */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-base font-bold text-gray-900">
            {isJa ? "パートナー共有" : "Partner Sharing"}
          </h2>
          <p className="text-sm text-gray-500">
            {isJa
              ? "招待コードを共有して、パートナーと一緒に結婚準備を管理しましょう。"
              : "Share your invite code with your partner to plan together."}
          </p>

          {/* My share code */}
          <div className="bg-rose-50 border border-rose-100 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isJa ? "あなたの招待コード" : "Your Invite Code"}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2.5 bg-white border border-rose-200 rounded-lg text-center font-mono text-lg font-bold text-rose-700 tracking-widest select-all">
                {shareCode}
              </div>
              <button
                onClick={handleCopyCode}
                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  codeCopied
                    ? "bg-green-600 text-white"
                    : "bg-rose-600 text-white hover:bg-rose-700"
                }`}
                aria-label={isJa ? "コードをコピー" : "Copy code"}
              >
                {codeCopied
                  ? (isJa ? "コピー済" : "Copied!")
                  : (isJa ? "コピー" : "Copy")}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">
                {isJa
                  ? "このコードをパートナーに共有してください"
                  : "Share this code with your partner"}
              </p>
              <button
                onClick={handleRegenerateCode}
                className="text-xs text-rose-500 hover:text-rose-600 transition-colors underline underline-offset-2"
              >
                {isJa ? "コードを再生成" : "Regenerate"}
              </button>
            </div>
          </div>

          {/* Enter partner's code */}
          <div className="border-t border-gray-100 pt-4">
            <label htmlFor="partner-code" className="block text-sm font-medium text-gray-700 mb-2">
              {isJa ? "招待コードで参加" : "Join with Invite Code"}
            </label>
            {isLinked ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.121a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364L4.757 8.25" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      {isJa ? "パートナーとリンク済み" : "Linked with Partner"}
                    </p>
                    {partnerUserId && (
                      <p className="text-xs text-green-600">
                        ID: {partnerUserId.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleUnlinkPartner}
                  className="text-xs text-red-500 hover:text-red-600 transition-colors underline underline-offset-2"
                >
                  {isJa ? "リンクを解除" : "Unlink"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  id="partner-code"
                  type="text"
                  value={partnerCode}
                  onChange={(e) => {
                    setPartnerCode(e.target.value.toUpperCase());
                    setShareError(null);
                  }}
                  placeholder={isJa ? "招待コードを入力" : "Enter invite code"}
                  maxLength={8}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
                <button
                  onClick={handleLinkPartner}
                  disabled={shareLoading || !partnerCode.trim()}
                  className="px-4 py-2.5 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {shareLoading
                    ? (isJa ? "処理中..." : "Loading...")
                    : (isJa ? "参加" : "Join")}
                </button>
              </div>
            )}

            {shareError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600">{shareError}</p>
              </div>
            )}
            {shareSuccess && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-600">{shareSuccess}</p>
              </div>
            )}
          </div>

          {isGuest && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-700">
                {isJa
                  ? "ゲストモードではパートナー共有機能は制限されます。ログインすると完全な共有が可能です。"
                  : "Partner sharing is limited in guest mode. Log in for full sharing capabilities."}
              </p>
            </div>
          )}
        </section>

        {/* Data management */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-base font-bold text-gray-900">
            {isJa ? "データ管理" : "Data Management"}
          </h2>

          {isPremium ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExport}
                className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                {isJa ? "データをエクスポート" : "Export Data"}
              </button>
              <button
                onClick={handleImport}
                className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                {isJa ? "データをインポート" : "Import Data"}
              </button>
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-center">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs font-bold mb-2">
                PRO
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {isJa ? "データのエクスポート/インポートはPremium機能です" : "Data export/import is a Premium feature"}
              </p>
              <button
                onClick={upgrade}
                className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors"
              >
                {isJa ? "Premiumにアップグレード (¥980)" : "Upgrade to Premium (¥980)"}
              </button>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            {showResetConfirm ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 mb-3">
                  {isJa
                    ? "すべてのタスクと婚前契約チェックリストがリセットされます。この操作は取り消せません。"
                    : "All tasks and prenup checklist items will be reset. This cannot be undone."}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetAll}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {isJa ? "リセットする" : "Reset"}
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors"
                  >
                    {isJa ? "キャンセル" : "Cancel"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="text-sm text-red-500 hover:text-red-600 transition-colors underline underline-offset-2"
              >
                {isJa ? "すべてのデータをリセット" : "Reset All Data"}
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
