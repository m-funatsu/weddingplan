// --- Task Status ---
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

// --- Category ---
export type CategoryId =
  | 'pre_marriage'
  | 'venue_planning'
  | 'guests'
  | 'attire_beauty'
  | 'ceremony_day'
  | 'photo_video'
  | 'legal'
  | 'new_life'
  | 'post_wedding';

// --- Phase ---
export type PhaseId =
  | 'phase_01'
  | 'phase_02'
  | 'phase_03'
  | 'phase_04'
  | 'phase_05'
  | 'phase_06'
  | 'phase_07'
  | 'phase_08'
  | 'phase_09'
  | 'phase_10';

// --- SubTask ---
export interface SubTask {
  id: string;
  label: string;
  completed: boolean;
}

// --- Main Task ---
export interface WeddingTask {
  id: string;
  taskId: string;
  categoryId: CategoryId;
  phaseId: PhaseId;
  name: string;
  description: string;
  status: TaskStatus;
  recommendedTiming: string;
  monthsBefore: number;
  calculatedDeadline: string | null;
  subtasks: SubTask[];
  notes: string[];
  budgetEstimateMin: number;
  budgetEstimateMax: number;
  actualCost: number | null;
  memo: string;
  completedAt: string | null;
  updatedAt: string;
}

// --- Prenup ---
export type PrenupSectionId =
  | 'assets'
  | 'debts'
  | 'income'
  | 'property'
  | 'other';

export interface PrenupItem {
  id: string;
  sectionId: PrenupSectionId;
  label: string;
  description: string;
  completed: boolean;
  notes: string;
}

// --- Settings ---
export interface WeddingSettings {
  weddingDate: string | null;
  partner1Name: string;
  partner2Name: string;
  language: 'ja' | 'en';
  totalBudget: number;
}

// --- Task Template (from research data) ---
export interface TaskTemplate {
  taskId: string;
  categoryId: CategoryId;
  phaseId: PhaseId;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  recommendedTiming: string;
  recommendedTimingEn: string;
  monthsBefore: number;
  subtasks: { label: string; labelEn: string }[];
  notes: string[];
  notesEn: string[];
  budgetEstimateMin: number;
  budgetEstimateMax: number;
}

// --- Prenup Template ---
export interface PrenupTemplate {
  id: string;
  sectionId: PrenupSectionId;
  label: string;
  labelEn: string;
  description: string;
  descriptionEn: string;
}

// --- Constants ---

export const CATEGORY_INFO: Record<CategoryId, { icon: string; label: string; labelEn: string; color: string }> = {
  pre_marriage: { icon: '💍', label: '婚前の準備', labelEn: 'Pre-Marriage Prep', color: '#e11d48' },
  venue_planning: { icon: '🏰', label: '式場・プランニング', labelEn: 'Venue & Planning', color: '#7c3aed' },
  guests: { icon: '👥', label: 'ゲスト関連', labelEn: 'Guest Management', color: '#2563eb' },
  attire_beauty: { icon: '👗', label: '衣装・美容', labelEn: 'Attire & Beauty', color: '#ec4899' },
  ceremony_day: { icon: '🎊', label: '式当日の準備', labelEn: 'Ceremony Day', color: '#ea580c' },
  photo_video: { icon: '📸', label: '写真・映像', labelEn: 'Photo & Video', color: '#d97706' },
  legal: { icon: '📋', label: '法的手続き', labelEn: 'Legal Procedures', color: '#0891b2' },
  new_life: { icon: '🏠', label: '新生活準備', labelEn: 'New Life Prep', color: '#16a34a' },
  post_wedding: { icon: '✨', label: '結婚式後', labelEn: 'Post-Wedding', color: '#0d9488' },
};

export const PHASE_INFO: Record<PhaseId, { label: string; labelEn: string; monthRange: string; monthRangeEn: string }> = {
  phase_01: { label: '婚約・婚前準備期', labelEn: 'Engagement & Pre-Wedding', monthRange: '12ヶ月以上前', monthRangeEn: '12+ months before' },
  phase_02: { label: '情報収集・方向性決定期', labelEn: 'Research & Direction', monthRange: '12〜10ヶ月前', monthRangeEn: '12-10 months before' },
  phase_03: { label: '式場決定・基本計画期', labelEn: 'Venue & Basic Planning', monthRange: '10〜8ヶ月前', monthRangeEn: '10-8 months before' },
  phase_04: { label: '詳細計画・手配開始期', labelEn: 'Detailed Planning', monthRange: '8〜6ヶ月前', monthRangeEn: '8-6 months before' },
  phase_05: { label: '本格準備期', labelEn: 'Full Preparation', monthRange: '6〜4ヶ月前', monthRangeEn: '6-4 months before' },
  phase_06: { label: '詰め作業期', labelEn: 'Finalization', monthRange: '4〜2ヶ月前', monthRangeEn: '4-2 months before' },
  phase_07: { label: '最終確認期', labelEn: 'Final Confirmation', monthRange: '2〜1ヶ月前', monthRangeEn: '2-1 months before' },
  phase_08: { label: '直前準備期', labelEn: 'Last-Minute Prep', monthRange: '1ヶ月前〜前日', monthRangeEn: '1 month - day before' },
  phase_09: { label: '挙式当日', labelEn: 'Wedding Day', monthRange: '当日', monthRangeEn: 'Day of' },
  phase_10: { label: '挙式後手続き期', labelEn: 'Post-Wedding', monthRange: '挙式後', monthRangeEn: 'After wedding' },
};

export const PRENUP_SECTION_INFO: Record<PrenupSectionId, { label: string; labelEn: string; icon: string }> = {
  assets: { label: '資産の取り扱い', labelEn: 'Asset Management', icon: '💰' },
  debts: { label: '負債の取り扱い', labelEn: 'Debt Management', icon: '💳' },
  income: { label: '収入・生活費', labelEn: 'Income & Living Expenses', icon: '💵' },
  property: { label: '不動産・大型資産', labelEn: 'Property & Major Assets', icon: '🏠' },
  other: { label: 'その他の取り決め', labelEn: 'Other Agreements', icon: '📝' },
};

export const DEFAULT_SETTINGS: WeddingSettings = {
  weddingDate: null,
  partner1Name: '',
  partner2Name: '',
  language: 'ja',
  totalBudget: 3500000,
};

export const ALL_CATEGORY_IDS: CategoryId[] = [
  'pre_marriage', 'venue_planning', 'guests', 'attire_beauty',
  'ceremony_day', 'photo_video', 'legal', 'new_life', 'post_wedding',
];

export const ALL_PHASE_IDS: PhaseId[] = [
  'phase_01', 'phase_02', 'phase_03', 'phase_04', 'phase_05',
  'phase_06', 'phase_07', 'phase_08', 'phase_09', 'phase_10',
];
