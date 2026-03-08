'use client';

import { useState, useMemo, useCallback } from 'react';

type Side = 'groom' | 'bride';
type Category = 'family' | 'friend' | 'colleague' | 'boss';

interface Guest {
  id: string;
  name: string;
  side: Side;
  category: Category;
  tableId: string | null;
}

interface TableConfig {
  tableCount: number;
  seatsPerTable: number;
}

const SIDE_LABELS: Record<Side, string> = { groom: '新郎側', bride: '新婦側' };
const CATEGORY_LABELS: Record<Category, string> = { family: '親族', friend: '友人', colleague: '同僚', boss: '上司' };
const CATEGORY_PRIORITY: Record<Category, number> = { boss: 0, family: 1, colleague: 2, friend: 3 };
const SIDE_COLORS: Record<Side, string> = { groom: 'bg-blue-100 text-blue-700 border-blue-200', bride: 'bg-pink-100 text-pink-700 border-pink-200' };
const CATEGORY_DOTS: Record<Category, string> = { boss: 'bg-red-500', family: 'bg-amber-500', colleague: 'bg-green-500', friend: 'bg-purple-500' };

let guestIdCounter = 0;
function newId(): string {
  return `g-${++guestIdCounter}-${Date.now()}`;
}

function autoAssign(guests: Guest[], config: TableConfig): Guest[] {
  const { tableCount, seatsPerTable } = config;
  if (tableCount === 0 || guests.length === 0) return guests;

  // Reset all assignments
  const unassigned = guests.map(g => ({ ...g, tableId: null as string | null }));

  // Group by side+category
  const groups: Record<string, Guest[]> = {};
  unassigned.forEach(g => {
    const key = `${g.side}-${g.category}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(g);
  });

  // Sort groups by priority (boss/family first = closer to main table = lower table number)
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    const catA = a.split('-')[1] as Category;
    const catB = b.split('-')[1] as Category;
    return CATEGORY_PRIORITY[catA] - CATEGORY_PRIORITY[catB];
  });

  // Assign tables: alternating groom/bride sides for balance
  const tables: Guest[][] = Array.from({ length: tableCount }, () => []);
  let tableIdx = 0;

  sortedKeys.forEach(key => {
    const group = groups[key];
    group.forEach(guest => {
      // Find a table with space, starting from current index
      let attempts = 0;
      while (attempts < tableCount) {
        const idx = (tableIdx + attempts) % tableCount;
        if (tables[idx].length < seatsPerTable) {
          guest.tableId = `table-${idx + 1}`;
          tables[idx].push(guest);
          break;
        }
        attempts++;
      }
    });
    // Advance to next table for next group
    if (groups[key].length > 0) {
      const lastTable = tables.findIndex(t => t.includes(groups[key][groups[key].length - 1]));
      tableIdx = (lastTable + 1) % tableCount;
    }
  });

  return unassigned;
}

export default function GuestTablePage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [config, setConfig] = useState<TableConfig>({ tableCount: 5, seatsPerTable: 8 });
  const [newName, setNewName] = useState('');
  const [newSide, setNewSide] = useState<Side>('groom');
  const [newCategory, setNewCategory] = useState<Category>('friend');
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);

  const addGuest = () => {
    if (!newName.trim()) return;
    setGuests(prev => [...prev, {
      id: newId(),
      name: newName.trim(),
      side: newSide,
      category: newCategory,
      tableId: null,
    }]);
    setNewName('');
  };

  const removeGuest = (id: string) => {
    setGuests(prev => prev.filter(g => g.id !== id));
    if (selectedGuest === id) setSelectedGuest(null);
  };

  const handleAutoAssign = useCallback(() => {
    setGuests(prev => autoAssign(prev, config));
  }, [config]);

  const moveGuestToTable = (guestId: string, tableId: string | null) => {
    setGuests(prev => {
      const tableGuests = prev.filter(g => g.tableId === tableId && g.id !== guestId);
      if (tableId && tableGuests.length >= config.seatsPerTable) return prev;
      return prev.map(g => g.id === guestId ? { ...g, tableId } : g);
    });
    setSelectedGuest(null);
  };

  const handleSeatClick = (guestId: string | null, tableId: string) => {
    if (selectedGuest) {
      // Move selected guest to this table
      moveGuestToTable(selectedGuest, tableId);
    } else if (guestId) {
      // Select this guest for moving
      setSelectedGuest(guestId);
    }
  };

  const loadDemo = () => {
    const demoGuests: Guest[] = [
      // Groom side
      { id: newId(), name: '田中太郎(父)', side: 'groom', category: 'family', tableId: null },
      { id: newId(), name: '田中花子(母)', side: 'groom', category: 'family', tableId: null },
      { id: newId(), name: '田中一郎(兄)', side: 'groom', category: 'family', tableId: null },
      { id: newId(), name: '田中美咲(義姉)', side: 'groom', category: 'family', tableId: null },
      { id: newId(), name: '山本部長', side: 'groom', category: 'boss', tableId: null },
      { id: newId(), name: '鈴木課長', side: 'groom', category: 'boss', tableId: null },
      { id: newId(), name: '佐藤健一', side: 'groom', category: 'colleague', tableId: null },
      { id: newId(), name: '高橋誠', side: 'groom', category: 'colleague', tableId: null },
      { id: newId(), name: '伊藤学', side: 'groom', category: 'colleague', tableId: null },
      { id: newId(), name: '渡辺大介', side: 'groom', category: 'friend', tableId: null },
      { id: newId(), name: '中村翔太', side: 'groom', category: 'friend', tableId: null },
      { id: newId(), name: '小林亮', side: 'groom', category: 'friend', tableId: null },
      { id: newId(), name: '加藤勇気', side: 'groom', category: 'friend', tableId: null },
      // Bride side
      { id: newId(), name: '佐々木正(父)', side: 'bride', category: 'family', tableId: null },
      { id: newId(), name: '佐々木恵(母)', side: 'bride', category: 'family', tableId: null },
      { id: newId(), name: '佐々木麻衣(妹)', side: 'bride', category: 'family', tableId: null },
      { id: newId(), name: '木村先生', side: 'bride', category: 'boss', tableId: null },
      { id: newId(), name: '林主任', side: 'bride', category: 'boss', tableId: null },
      { id: newId(), name: '松本愛', side: 'bride', category: 'colleague', tableId: null },
      { id: newId(), name: '井上咲', side: 'bride', category: 'colleague', tableId: null },
      { id: newId(), name: '山田彩', side: 'bride', category: 'colleague', tableId: null },
      { id: newId(), name: '森本真由', side: 'bride', category: 'friend', tableId: null },
      { id: newId(), name: '石田さくら', side: 'bride', category: 'friend', tableId: null },
      { id: newId(), name: '前田ひかり', side: 'bride', category: 'friend', tableId: null },
      { id: newId(), name: '藤田凛', side: 'bride', category: 'friend', tableId: null },
      { id: newId(), name: '岡田結衣', side: 'bride', category: 'friend', tableId: null },
    ];
    setGuests(demoGuests);
  };

  // Stats
  const stats = useMemo(() => {
    const groomCount = guests.filter(g => g.side === 'groom').length;
    const brideCount = guests.filter(g => g.side === 'bride').length;
    const assigned = guests.filter(g => g.tableId).length;
    const unassigned = guests.length - assigned;
    return { groomCount, brideCount, assigned, unassigned, total: guests.length };
  }, [guests]);

  // Tables data
  const tablesData = useMemo(() => {
    return Array.from({ length: config.tableCount }, (_, i) => {
      const tableId = `table-${i + 1}`;
      const seated = guests.filter(g => g.tableId === tableId);
      const groomCount = seated.filter(g => g.side === 'groom').length;
      const brideCount = seated.filter(g => g.side === 'bride').length;
      return { id: tableId, number: i + 1, seated, groomCount, brideCount };
    });
  }, [guests, config.tableCount]);

  const unassignedGuests = guests.filter(g => !g.tableId);

  // Round table SVG
  const renderRoundTable = (table: typeof tablesData[0]) => {
    const cx = 80;
    const cy = 80;
    const tableR = 30;
    const seatR = 14;
    const orbitR = 58;
    const totalSeats = config.seatsPerTable;

    return (
      <svg width="160" height="160" viewBox="0 0 160 160" className="mx-auto">
        {/* Table */}
        <circle cx={cx} cy={cy} r={tableR} fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#6b7280" fontSize="11" fontWeight="bold">
          {table.number}
        </text>
        {/* Seats */}
        {Array.from({ length: totalSeats }, (_, i) => {
          const angle = (i / totalSeats) * Math.PI * 2 - Math.PI / 2;
          const sx = cx + orbitR * Math.cos(angle);
          const sy = cy + orbitR * Math.sin(angle);
          const guest = table.seated[i];
          const isSelected = guest && guest.id === selectedGuest;

          return (
            <g
              key={i}
              onClick={() => guest ? handleSeatClick(guest.id, table.id) : selectedGuest ? moveGuestToTable(selectedGuest, table.id) : undefined}
              className="cursor-pointer"
            >
              <circle
                cx={sx} cy={sy} r={seatR}
                fill={guest ? (guest.side === 'groom' ? '#dbeafe' : '#fce7f3') : (selectedGuest ? '#e0e7ff' : '#f9fafb')}
                stroke={isSelected ? '#4f46e5' : guest ? (guest.side === 'groom' ? '#93c5fd' : '#f9a8d4') : '#d1d5db'}
                strokeWidth={isSelected ? 2.5 : 1.5}
              />
              {guest && (
                <>
                  <circle cx={sx + 8} cy={sy - 8} r={3} fill={CATEGORY_DOTS[guest.category]} />
                  <text x={sx} y={sy + 4} textAnchor="middle" fill="#374151" fontSize="7" fontWeight="500">
                    {guest.name.length > 4 ? guest.name.slice(0, 3) + '..' : guest.name}
                  </text>
                </>
              )}
              {!guest && selectedGuest && (
                <text x={sx} y={sy + 4} textAnchor="middle" fill="#a5b4fc" fontSize="16">+</text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 pb-24 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">ゲスト席次表ジェネレーター</h1>

        {/* Stats Bar */}
        <div className="flex gap-3 overflow-x-auto text-sm">
          <div className="bg-white rounded-xl border px-4 py-2 flex items-center gap-2 whitespace-nowrap">
            <span className="text-gray-500">合計</span>
            <span className="font-bold">{stats.total}名</span>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-200 px-4 py-2 flex items-center gap-2 whitespace-nowrap">
            <span className="text-blue-600">新郎側</span>
            <span className="font-bold text-blue-700">{stats.groomCount}名</span>
          </div>
          <div className="bg-pink-50 rounded-xl border border-pink-200 px-4 py-2 flex items-center gap-2 whitespace-nowrap">
            <span className="text-pink-600">新婦側</span>
            <span className="font-bold text-pink-700">{stats.brideCount}名</span>
          </div>
          <div className="bg-white rounded-xl border px-4 py-2 flex items-center gap-2 whitespace-nowrap">
            <span className="text-gray-500">未配席</span>
            <span className="font-bold text-orange-600">{stats.unassigned}名</span>
          </div>
        </div>

        {/* Add Guest */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">ゲスト追加</h2>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addGuest()}
              placeholder="ゲスト名"
              className="flex-1 min-w-[140px] rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <select
              value={newSide}
              onChange={e => setNewSide(e.target.value as Side)}
              className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="groom">新郎側</option>
              <option value="bride">新婦側</option>
            </select>
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value as Category)}
              className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="family">親族</option>
              <option value="boss">上司</option>
              <option value="colleague">同僚</option>
              <option value="friend">友人</option>
            </select>
            <button
              onClick={addGuest}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              追加
            </button>
          </div>
          {guests.length === 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={loadDemo}
                className="text-sm text-indigo-600 hover:text-indigo-700 underline"
              >
                デモデータを読み込む
              </button>
            </div>
          )}
        </div>

        {/* Table Config */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">テーブル設定</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">テーブル数</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setConfig(c => ({ ...c, tableCount: Math.max(1, c.tableCount - 1) }))}
                  className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold text-lg"
                >-</button>
                <span className="text-2xl font-bold text-gray-900 w-10 text-center">{config.tableCount}</span>
                <button
                  onClick={() => setConfig(c => ({ ...c, tableCount: Math.min(15, c.tableCount + 1) }))}
                  className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold text-lg"
                >+</button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">テーブルあたり人数</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setConfig(c => ({ ...c, seatsPerTable: Math.max(4, c.seatsPerTable - 1) }))}
                  className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold text-lg"
                >-</button>
                <span className="text-2xl font-bold text-gray-900 w-10 text-center">{config.seatsPerTable}</span>
                <button
                  onClick={() => setConfig(c => ({ ...c, seatsPerTable: Math.min(12, c.seatsPerTable + 1) }))}
                  className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold text-lg"
                >+</button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              収容人数: {config.tableCount * config.seatsPerTable}名
              {stats.total > config.tableCount * config.seatsPerTable && (
                <span className="text-red-500 ml-2">(席数が不足しています)</span>
              )}
            </p>
            <button
              onClick={handleAutoAssign}
              disabled={guests.length === 0}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              自動配置
            </button>
          </div>
        </div>

        {/* Selected Guest Indicator */}
        {selectedGuest && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between">
            <p className="text-sm text-indigo-700">
              <span className="font-bold">{guests.find(g => g.id === selectedGuest)?.name}</span>を移動中 - テーブルの席をクリックして配置
            </p>
            <button
              onClick={() => setSelectedGuest(null)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              キャンセル
            </button>
          </div>
        )}

        {/* Table View */}
        {guests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">席次表</h2>
            <p className="text-xs text-gray-500 mb-4">席をクリックしてゲストを選択し、別の席をクリックして移動できます</p>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs mb-4 justify-center">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-200 border border-blue-300" /> 新郎側</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-pink-200 border border-pink-300" /> 新婦側</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> 上司</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 親族</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> 同僚</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> 友人</span>
            </div>

            {/* Main table indicator */}
            <div className="text-center text-xs text-gray-400 mb-2">-- メインテーブル (上席) --</div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {tablesData.map(table => (
                <div key={table.id} className="text-center">
                  {renderRoundTable(table)}
                  <p className="text-xs text-gray-500 mt-1">
                    テーブル{table.number} ({table.seated.length}/{config.seatsPerTable})
                  </p>
                  <div className="flex justify-center gap-1 text-[10px]">
                    {table.groomCount > 0 && <span className="text-blue-600">郎{table.groomCount}</span>}
                    {table.brideCount > 0 && <span className="text-pink-600">婦{table.brideCount}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unassigned Guests */}
        {unassignedGuests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">未配席ゲスト ({unassignedGuests.length}名)</h2>
            <div className="flex flex-wrap gap-2">
              {unassignedGuests.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGuest(selectedGuest === g.id ? null : g.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    selectedGuest === g.id
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                      : SIDE_COLORS[g.side]
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${CATEGORY_DOTS[g.category]}`} />
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Guest List */}
        {guests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">ゲスト一覧 ({guests.length}名)</h2>
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {guests.map(g => (
                <div key={g.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${CATEGORY_DOTS[g.category]}`} />
                    <span className="text-sm text-gray-800">{g.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${SIDE_COLORS[g.side]}`}>
                      {SIDE_LABELS[g.side]}
                    </span>
                    <span className="text-xs text-gray-500">{CATEGORY_LABELS[g.category]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {g.tableId && (
                      <span className="text-xs text-gray-500">T{g.tableId.split('-')[1]}</span>
                    )}
                    <button
                      onClick={() => removeGuest(g.id)}
                      className="text-gray-400 hover:text-red-500 text-sm"
                      aria-label={`${g.name}を削除`}
                    >
                      x
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
