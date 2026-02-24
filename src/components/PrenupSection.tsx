"use client";

import { useState } from "react";
import { PRENUP_SECTION_INFO, type PrenupItem, type PrenupSectionId } from "@/types";

interface PrenupSectionProps {
  sectionId: PrenupSectionId;
  items: PrenupItem[];
  language: "ja" | "en";
  onToggle: (itemId: string) => void;
  onNotesChange: (itemId: string, notes: string) => void;
}

export default function PrenupSection({
  sectionId,
  items,
  language,
  onToggle,
  onNotesChange,
}: PrenupSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState("");

  const isJa = language === "ja";
  const sectionInfo = PRENUP_SECTION_INFO[sectionId];
  const completedCount = items.filter((i) => i.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  function handleNotesEdit(item: PrenupItem) {
    setEditingNotes(item.id);
    setNotesInput(item.notes);
  }

  function handleNotesSave(itemId: string) {
    onNotesChange(itemId, notesInput);
    setEditingNotes(null);
    setNotesInput("");
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Section header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-2xl">{sectionInfo.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-gray-900">
            {isJa ? sectionInfo.label : sectionInfo.labelEn}
          </h3>
          <p className="text-xs text-gray-400">
            {completedCount}/{items.length} {isJa ? "項目完了" : "completed"}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Mini progress bar */}
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {/* Items */}
      {expanded && (
        <div className="border-t border-gray-100">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-4 border-b border-gray-50 last:border-b-0 ${
                item.completed ? "bg-green-50/50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => onToggle(item.id)}
                  className="mt-0.5 w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      item.completed ? "line-through text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </p>

                  {/* Notes */}
                  {editingNotes === item.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                        rows={2}
                        placeholder={isJa ? "メモを入力..." : "Add notes..."}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleNotesSave(item.id)}
                          className="text-xs px-2 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700"
                        >
                          {isJa ? "保存" : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingNotes(null)}
                          className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
                        >
                          {isJa ? "取消" : "Cancel"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleNotesEdit(item)}
                      className="mt-1 text-xs text-gray-400 hover:text-rose-600 transition-colors"
                    >
                      {item.notes
                        ? `📝 ${item.notes}`
                        : isJa
                        ? "📝 メモを追加"
                        : "📝 Add notes"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
