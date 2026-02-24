"use client";

import { useMemo } from "react";
import { useWeddingSettings, usePrenupItems } from "@/lib/hooks";
import { PRENUP_SECTION_INFO, type PrenupSectionId } from "@/types";
import PrenupSection from "@/components/PrenupSection";
import ProgressRing from "@/components/ProgressRing";

const SECTION_ORDER: PrenupSectionId[] = [
  "assets",
  "debts",
  "income",
  "property",
  "other",
];

export default function PrenupPage() {
  const { settings } = useWeddingSettings();
  const { items, isLoaded, updateItem } = usePrenupItems();
  const isJa = settings.language === "ja";

  const completedCount = items.filter((i) => i.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  const itemsBySection = useMemo(() => {
    const grouped: Record<PrenupSectionId, typeof items> = {
      assets: [],
      debts: [],
      income: [],
      property: [],
      other: [],
    };
    items.forEach((item) => {
      if (grouped[item.sectionId]) {
        grouped[item.sectionId].push(item);
      }
    });
    return grouped;
  }, [items]);

  function handleToggle(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      updateItem(itemId, { completed: !item.completed });
    }
  }

  function handleNotesChange(itemId: string, notes: string) {
    updateItem(itemId, { notes });
  }

  if (!isLoaded) {
    return (
      <div className="page-with-nav min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-with-nav min-h-screen bg-gradient-to-b from-rose-50/50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isJa ? "婚前契約チェックリスト" : "Prenuptial Agreement Checklist"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isJa
                ? "結婚前にパートナーと確認・合意しておくべき項目"
                : "Items to discuss and agree upon with your partner before marriage"}
            </p>
          </div>
          <ProgressRing
            progress={progress}
            size={72}
            strokeWidth={5}
            label={`${completedCount}/${items.length}`}
          />
        </div>

        {/* Info banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            💡{" "}
            {isJa
              ? "このチェックリストは法的な婚前契約書ではありません。パートナーとの話し合いのガイドとしてご活用ください。正式な契約書の作成には、弁護士にご相談ください。"
              : "This checklist is not a legal prenuptial agreement. Use it as a guide for discussions with your partner. Consult a lawyer for formal agreements."}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {SECTION_ORDER.map((sectionId) => {
            const sectionItems = itemsBySection[sectionId];
            if (sectionItems.length === 0) return null;
            return (
              <PrenupSection
                key={sectionId}
                sectionId={sectionId}
                items={sectionItems}
                language={settings.language}
                onToggle={handleToggle}
                onNotesChange={handleNotesChange}
              />
            );
          })}
        </div>

        {/* Section summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-3">
            {isJa ? "セクション別進捗" : "Section Progress"}
          </h3>
          <div className="space-y-3">
            {SECTION_ORDER.map((sectionId) => {
              const sectionItems = itemsBySection[sectionId];
              const completed = sectionItems.filter((i) => i.completed).length;
              const total = sectionItems.length;
              const pct = total > 0 ? (completed / total) * 100 : 0;
              const info = PRENUP_SECTION_INFO[sectionId];

              return (
                <div key={sectionId} className="flex items-center gap-3">
                  <span className="text-sm w-6 text-center">{info.icon}</span>
                  <span className="text-sm text-gray-700 w-32 truncate">
                    {isJa ? info.label : info.labelEn}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {completed}/{total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
