// --- Task Status ---
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

// --- Category ---
export type CategoryId =
  | 'values_alignment'
  | 'engagement'
  | 'family_relations'
  | 'finance_planning'
  | 'ceremony'
  | 'legal_procedures'
  | 'housing'
  | 'lifestyle_setup'
  | 'life_planning';

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
  | 'phase_09';

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
  | 'housework'
  | 'lifestyle'
  | 'communication'
  | 'family'
  | 'career_life'
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
  marriageDate: string | null;
  ceremonyDate: string | null;
  hasCeremony: boolean;
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
  values_alignment: { icon: '💑', label: '価値観すり合わせ', labelEn: 'Values & Communication', color: '#8b5cf6' },
  engagement: { icon: '💍', label: 'プロポーズ・婚約', labelEn: 'Proposal & Engagement', color: '#e11d48' },
  family_relations: { icon: '👨‍👩‍👧', label: '両家・親族対応', labelEn: 'Family Relations', color: '#ea580c' },
  finance_planning: { icon: '💰', label: '資金計画・家計', labelEn: 'Financial Planning', color: '#16a34a' },
  ceremony: { icon: '🎊', label: '結婚式', labelEn: 'Wedding Ceremony', color: '#7c3aed' },
  legal_procedures: { icon: '📋', label: '入籍・法的手続き', labelEn: 'Legal & Registration', color: '#0891b2' },
  housing: { icon: '🏠', label: '住まい・引越し', labelEn: 'Housing & Moving', color: '#2563eb' },
  lifestyle_setup: { icon: '🛋️', label: '新生活の立ち上げ', labelEn: 'New Life Setup', color: '#d97706' },
  life_planning: { icon: '🎯', label: 'ライフプラン', labelEn: 'Life Planning', color: '#0d9488' },
};

export const PHASE_INFO: Record<PhaseId, { label: string; labelEn: string; monthRange: string; monthRangeEn: string; isOptional?: boolean }> = {
  phase_01: { label: '交際・価値観すり合わせ期', labelEn: 'Dating & Values Alignment', monthRange: '18ヶ月以上前', monthRangeEn: '18+ months before' },
  phase_02: { label: 'プロポーズ・婚約期', labelEn: 'Proposal & Engagement', monthRange: '18〜12ヶ月前', monthRangeEn: '18-12 months before' },
  phase_03: { label: '両家対応・方向性決定期', labelEn: 'Families & Direction', monthRange: '12〜9ヶ月前', monthRangeEn: '12-9 months before' },
  phase_04: { label: '資金計画・新居準備期', labelEn: 'Finances & New Home', monthRange: '9〜6ヶ月前', monthRangeEn: '9-6 months before' },
  phase_05: { label: '結婚式準備期', labelEn: 'Wedding Ceremony Prep', monthRange: '6〜2ヶ月前', monthRangeEn: '6-2 months before', isOptional: true },
  phase_06: { label: '入籍・法的手続き期', labelEn: 'Registration & Legal', monthRange: '2ヶ月前〜当月', monthRangeEn: '2 months - month of' },
  phase_07: { label: '新居引越し・生活立ち上げ期', labelEn: 'Moving & Setup', monthRange: '入籍前後', monthRangeEn: 'Around registration' },
  phase_08: { label: '新生活安定期', labelEn: 'New Life Stabilization', monthRange: '入籍後1〜3ヶ月', monthRangeEn: '1-3 months after' },
  phase_09: { label: 'ライフプラン確立期', labelEn: 'Life Plan Establishment', monthRange: '入籍後3ヶ月〜', monthRangeEn: '3+ months after' },
};

export const PRENUP_SECTION_INFO: Record<PrenupSectionId, { label: string; labelEn: string; icon: string }> = {
  assets: { label: '資産の取り扱い', labelEn: 'Asset Management', icon: '💰' },
  debts: { label: '負債の取り扱い', labelEn: 'Debt Management', icon: '💳' },
  income: { label: '収入・生活費', labelEn: 'Income & Living Expenses', icon: '💵' },
  property: { label: '不動産・大型資産', labelEn: 'Property & Major Assets', icon: '🏠' },
  housework: { label: '家事・役割分担', labelEn: 'Household Chores & Roles', icon: '🧹' },
  lifestyle: { label: '生活習慣・ライフスタイル', labelEn: 'Lifestyle & Habits', icon: '🌿' },
  communication: { label: 'コミュニケーション・関係性', labelEn: 'Communication & Relationship', icon: '💬' },
  family: { label: '家族・親族関係', labelEn: 'Family Relations', icon: '👨‍👩‍👧' },
  career_life: { label: 'キャリア・人生設計', labelEn: 'Career & Life Planning', icon: '🎯' },
  other: { label: 'その他の取り決め', labelEn: 'Other Agreements', icon: '📝' },
};

export const DEFAULT_SETTINGS: WeddingSettings = {
  marriageDate: null,
  ceremonyDate: null,
  hasCeremony: true,
  partner1Name: '',
  partner2Name: '',
  language: 'ja',
  totalBudget: 3500000,
};

export const ALL_CATEGORY_IDS: CategoryId[] = [
  'values_alignment', 'engagement', 'family_relations', 'finance_planning',
  'ceremony', 'legal_procedures', 'housing', 'lifestyle_setup', 'life_planning',
];

export const ALL_PHASE_IDS: PhaseId[] = [
  'phase_01', 'phase_02', 'phase_03', 'phase_04', 'phase_05',
  'phase_06', 'phase_07', 'phase_08', 'phase_09',
];
