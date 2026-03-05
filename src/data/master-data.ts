// =============================================================================
// master-data.ts - Japanese Wedding Planning Reference Data
// Source: Zexy Bridal Survey 2024, regional wedding industry reports
// =============================================================================

// -----------------------------------------------------------------------------
// National Averages (全国平均 - ゼクシィ結婚トレンド調査 2024 参考)
// -----------------------------------------------------------------------------

export interface NationalAverages {
  /** 挙式+披露宴の総額 (円) */
  totalCeremonyAndReception: number;
  /** ご祝儀総額 (円) */
  totalGoshugi: number;
  /** 自己負担額 (円) */
  selfPayment: number;
  /** 平均ゲスト人数 */
  averageGuestCount: number;
  /** ゲスト1人あたりの費用 (円) */
  costPerGuest: number;
  /** ゲスト1人あたりのご祝儀平均 (円) */
  goshugiPerGuest: number;
}

export const NATIONAL_AVERAGES: NationalAverages = {
  totalCeremonyAndReception: 3_030_000,
  totalGoshugi: 1_970_000,
  selfPayment: 1_470_000,
  averageGuestCount: 43,
  costPerGuest: 70_465, // 3,030,000 / 43
  goshugiPerGuest: 45_814, // 1,970,000 / 43
};

// -----------------------------------------------------------------------------
// Cost Item Breakdown (費用項目別内訳)
// -----------------------------------------------------------------------------

export type CostCategory =
  | "ceremony_fee"
  | "venue_fee"
  | "food_drink"
  | "bride_dress_wedding"
  | "bride_dress_color"
  | "groom_tuxedo"
  | "photo_video"
  | "flowers"
  | "gifts"
  | "invitations"
  | "hair_makeup"
  | "bouquet"
  | "cake"
  | "mc"
  | "entertainment";

export interface CostItemRange {
  id: CostCategory;
  label: string;
  labelEn: string;
  min: number;
  max: number;
  /** "fixed" = flat fee, "per_guest" = multiply by guest count */
  unit: "fixed" | "per_guest";
  /** Description for user guidance */
  description: string;
  descriptionEn: string;
}

export const COST_ITEMS: CostItemRange[] = [
  {
    id: "ceremony_fee",
    label: "挙式料",
    labelEn: "Ceremony Fee",
    min: 300_000,
    max: 500_000,
    unit: "fixed",
    description: "神前式・教会式・人前式の挙式料。神前式は初穂料含む。",
    descriptionEn: "Ceremony fee including Shinto, church, or secular ceremony.",
  },
  {
    id: "venue_fee",
    label: "会場費",
    labelEn: "Venue Fee",
    min: 300_000,
    max: 600_000,
    unit: "fixed",
    description: "披露宴会場の使用料。ホテル・専門式場は高め、レストランは低め。",
    descriptionEn: "Reception venue rental. Hotels cost more, restaurants less.",
  },
  {
    id: "food_drink",
    label: "料理・飲み物",
    labelEn: "Food & Drinks",
    min: 20_000,
    max: 25_000,
    unit: "per_guest",
    description: "ゲスト1人あたりの料理・ドリンク代。コース料理のランクで変動。",
    descriptionEn: "Per-guest food and drink cost. Varies by course level.",
  },
  {
    id: "bride_dress_wedding",
    label: "ウェディングドレス",
    labelEn: "Wedding Dress",
    min: 250_000,
    max: 400_000,
    unit: "fixed",
    description: "レンタルが主流。インポートブランドは50万円超も。購入は30-80万円。",
    descriptionEn: "Rental is standard. Import brands may exceed 500K. Purchase: 300K-800K.",
  },
  {
    id: "bride_dress_color",
    label: "カラードレス",
    labelEn: "Color Dress",
    min: 200_000,
    max: 300_000,
    unit: "fixed",
    description: "お色直し用のカラードレス。省略すれば節約可能。",
    descriptionEn: "Color dress for costume change. Can be skipped to save.",
  },
  {
    id: "groom_tuxedo",
    label: "新郎タキシード",
    labelEn: "Groom's Tuxedo",
    min: 100_000,
    max: 200_000,
    unit: "fixed",
    description: "新郎のタキシード・紋付袴レンタル。",
    descriptionEn: "Groom's tuxedo or hakama rental.",
  },
  {
    id: "photo_video",
    label: "写真・映像",
    labelEn: "Photography & Video",
    min: 300_000,
    max: 600_000,
    unit: "fixed",
    description: "前撮り+当日スナップ+エンドロール。アルバム制作費含む。",
    descriptionEn: "Pre-shoot + ceremony day + endroll. Includes album production.",
  },
  {
    id: "flowers",
    label: "装花",
    labelEn: "Floral Arrangements",
    min: 150_000,
    max: 300_000,
    unit: "fixed",
    description: "メインテーブル・ゲストテーブル・チャペル装花。季節の花で節約可能。",
    descriptionEn: "Main table, guest tables, chapel flowers. Seasonal flowers save cost.",
  },
  {
    id: "gifts",
    label: "引出物",
    labelEn: "Guest Gifts",
    min: 5_000,
    max: 8_000,
    unit: "per_guest",
    description: "引出物+引菓子+縁起物のセット。カタログギフトが主流。",
    descriptionEn: "Gift set per guest. Catalog gifts are standard.",
  },
  {
    id: "invitations",
    label: "招待状",
    labelEn: "Invitations",
    min: 300,
    max: 500,
    unit: "per_guest",
    description: "招待状の印刷・デザイン・郵送費。Web招待状なら無料も。",
    descriptionEn: "Print, design, and postage. Web invitations can be free.",
  },
  {
    id: "hair_makeup",
    label: "ヘアメイク",
    labelEn: "Hair & Makeup",
    min: 50_000,
    max: 150_000,
    unit: "fixed",
    description: "リハーサル+当日のヘアメイク。お色直しの回数で変動。",
    descriptionEn: "Rehearsal + ceremony day styling. Varies by costume changes.",
  },
  {
    id: "bouquet",
    label: "ブーケ",
    labelEn: "Bouquet",
    min: 30_000,
    max: 50_000,
    unit: "fixed",
    description: "生花ブーケ。ドライフラワーやアーティフィシャルで節約可能。",
    descriptionEn: "Fresh flower bouquet. Dried or artificial options save cost.",
  },
  {
    id: "cake",
    label: "ウェディングケーキ",
    labelEn: "Wedding Cake",
    min: 50_000,
    max: 100_000,
    unit: "fixed",
    description: "生ケーキ or イミテーション+カットケーキ。段数・デザインで変動。",
    descriptionEn: "Fresh cake or imitation + cut cake. Varies by tiers and design.",
  },
  {
    id: "mc",
    label: "司会",
    labelEn: "Master of Ceremonies",
    min: 50_000,
    max: 100_000,
    unit: "fixed",
    description: "プロ司会者。友人に頼む場合はお礼（2-3万円）で済む場合も。",
    descriptionEn: "Professional MC. Friends may do it for a smaller honorarium.",
  },
  {
    id: "entertainment",
    label: "演出",
    labelEn: "Entertainment & Effects",
    min: 50_000,
    max: 200_000,
    unit: "fixed",
    description: "プロフィールムービー・余興・照明・プロジェクションマッピング等。",
    descriptionEn: "Profile video, performances, lighting, projection mapping, etc.",
  },
];

// -----------------------------------------------------------------------------
// Goshugi Rates (ご祝儀相場)
// -----------------------------------------------------------------------------

export type GuestRelation =
  | "friend"
  | "boss"
  | "colleague"
  | "subordinate"
  | "relative_close"
  | "relative_distant"
  | "couple_invite"
  | "family_invite";

export interface GoshugiRate {
  relation: GuestRelation;
  label: string;
  labelEn: string;
  min: number;
  max: number;
  typical: number;
  description: string;
  descriptionEn: string;
}

export const GOSHUGI_RATES: GoshugiRate[] = [
  {
    relation: "friend",
    label: "友人",
    labelEn: "Friend",
    min: 30_000,
    max: 30_000,
    typical: 30_000,
    description: "友人は3万円が基本。親しい間柄でも金額は統一するのがマナー。",
    descriptionEn: "30,000 yen is standard for friends regardless of closeness.",
  },
  {
    relation: "boss",
    label: "上司",
    labelEn: "Boss / Superior",
    min: 30_000,
    max: 50_000,
    typical: 30_000,
    description: "直属の上司は3万円、部長・役員クラスは5万円が相場。",
    descriptionEn: "Direct boss: 30K. Director/executive level: 50K.",
  },
  {
    relation: "colleague",
    label: "同僚",
    labelEn: "Colleague",
    min: 30_000,
    max: 30_000,
    typical: 30_000,
    description: "同僚は3万円。グループでまとめてお祝いする場合もある。",
    descriptionEn: "30K standard. May give group gifts instead.",
  },
  {
    relation: "subordinate",
    label: "部下・後輩",
    labelEn: "Subordinate / Junior",
    min: 30_000,
    max: 30_000,
    typical: 30_000,
    description: "部下・後輩は3万円。20代前半は2万円の場合もあるが少数。",
    descriptionEn: "30K standard. Early 20s may give 20K but uncommon.",
  },
  {
    relation: "relative_close",
    label: "親族（兄弟姉妹・叔父叔母）",
    labelEn: "Close Relative (Sibling, Uncle/Aunt)",
    min: 50_000,
    max: 100_000,
    typical: 50_000,
    description: "兄弟姉妹は5-10万円、叔父叔母は5万円が相場。既婚か独身かでも異なる。",
    descriptionEn: "Siblings: 50K-100K. Uncles/aunts: 50K. Married vs single matters.",
  },
  {
    relation: "relative_distant",
    label: "親族（いとこ・遠縁）",
    labelEn: "Distant Relative (Cousin, etc.)",
    min: 30_000,
    max: 50_000,
    typical: 30_000,
    description: "いとこは3万円が基本。付き合いの深さで5万円の場合も。",
    descriptionEn: "Cousins: 30K base. May go to 50K depending on closeness.",
  },
  {
    relation: "couple_invite",
    label: "夫婦で招待",
    labelEn: "Couple (Joint Invite)",
    min: 50_000,
    max: 70_000,
    typical: 50_000,
    description: "夫婦で5-7万円。二人分の料理・引出物がかかるため。",
    descriptionEn: "50K-70K for a couple. Accounts for two meals and gifts.",
  },
  {
    relation: "family_invite",
    label: "家族で招待",
    labelEn: "Family (with Children)",
    min: 50_000,
    max: 100_000,
    typical: 70_000,
    description: "家族人数と子どもの年齢により変動。子どもの食事代を加味。",
    descriptionEn: "Varies by family size and children's ages. Accounts for kids' meals.",
  },
];

// -----------------------------------------------------------------------------
// Schedule Template (スケジュールテンプレート 12ヶ月前~当日)
// -----------------------------------------------------------------------------

export interface ScheduleMilestone {
  monthsBefore: number;
  label: string;
  labelEn: string;
  tasks: string[];
  tasksEn: string[];
  tips: string[];
  tipsEn: string[];
}

export const SCHEDULE_TEMPLATE: ScheduleMilestone[] = [
  {
    monthsBefore: 12,
    label: "12ヶ月前",
    labelEn: "12 months before",
    tasks: [
      "会場探し・ブライダルフェア参加",
      "予算の大枠を策定",
      "結婚式のイメージ（テーマ・規模）を固める",
      "親への報告・顔合わせ日程調整",
    ],
    tasksEn: [
      "Venue search & attend bridal fairs",
      "Set overall budget framework",
      "Decide wedding theme & scale",
      "Inform parents & arrange first meeting",
    ],
    tips: [
      "人気会場は1年前から埋まるため早めの見学を推奨",
      "ブライダルフェアは3-5件回ると相場観が身につく",
      "オフシーズン（1-2月, 7-8月）は割引プランが多い",
    ],
    tipsEn: [
      "Popular venues book up a year in advance",
      "Visit 3-5 bridal fairs to understand market rates",
      "Off-season (Jan-Feb, Jul-Aug) often has discount plans",
    ],
  },
  {
    monthsBefore: 9,
    label: "9ヶ月前",
    labelEn: "9 months before",
    tasks: [
      "会場決定・契約",
      "ウェディングドレス試着開始",
      "プランナーとの初回打合せ",
      "前撮りの検討",
    ],
    tasksEn: [
      "Finalize & sign venue contract",
      "Start wedding dress fittings",
      "Initial meeting with planner",
      "Consider pre-wedding photo shoot",
    ],
    tips: [
      "契約前に見積もりの「含まれないもの」を必ず確認",
      "ドレスは3-5着試着して比較するのが一般的",
      "持ち込み料（カメラマン・ドレス等）を契約前に交渉",
    ],
    tipsEn: [
      "Check what is NOT included in the estimate before signing",
      "Try on 3-5 dresses for comparison",
      "Negotiate vendor bring-in fees before contract",
    ],
  },
  {
    monthsBefore: 6,
    label: "6ヶ月前",
    labelEn: "6 months before",
    tasks: [
      "招待客リスト作成",
      "衣装決定（新婦・新郎）",
      "二次会の検討・幹事依頼",
      "ブライダルエステ開始",
    ],
    tasksEn: [
      "Create guest list",
      "Finalize attire (bride & groom)",
      "Plan after-party & ask organizers",
      "Start bridal beauty treatments",
    ],
    tips: [
      "招待客リストは両家のバランスを考慮して調整",
      "カラードレスは省略すると20-30万円の節約に",
      "二次会幹事は信頼できる友人に早めに依頼",
    ],
    tipsEn: [
      "Balance guest lists between both families",
      "Skipping color dress saves 200K-300K yen",
      "Ask reliable friends to organize after-party early",
    ],
  },
  {
    monthsBefore: 3,
    label: "3ヶ月前",
    labelEn: "3 months before",
    tasks: [
      "招待状の作成・発送",
      "二次会会場の決定",
      "BGM・演出内容の検討",
      "ヘアメイクリハーサル",
      "引出物の選定",
    ],
    tasksEn: [
      "Create & send invitations",
      "Finalize after-party venue",
      "Plan BGM & entertainment",
      "Hair & makeup rehearsal",
      "Select guest gifts",
    ],
    tips: [
      "招待状は挙式2ヶ月前の返信期限が一般的",
      "Web招待状で印刷・郵送費を節約できる",
      "BGMの著作権使用料（ISUM）を確認",
    ],
    tipsEn: [
      "RSVP deadline is typically 2 months before ceremony",
      "Web invitations save printing and postage costs",
      "Check music copyright fees (ISUM) for BGM",
    ],
  },
  {
    monthsBefore: 1,
    label: "1ヶ月前",
    labelEn: "1 month before",
    tasks: [
      "最終打合せ（プランナー）",
      "席次表の確定",
      "司会者との打合せ",
      "最終見積もりの確認",
      "お車代・お礼の準備",
    ],
    tasksEn: [
      "Final meeting with planner",
      "Finalize seating chart",
      "Meeting with MC",
      "Review final estimate",
      "Prepare transportation allowance & gifts",
    ],
    tips: [
      "最終見積もりが初回見積もりから大きく増えていないか要チェック",
      "お車代は新札で準備（銀行で両替）",
      "席次は親族→上司→友人の順で配置",
    ],
    tipsEn: [
      "Compare final vs initial estimate for significant increases",
      "Prepare fresh bills for transportation allowance (exchange at bank)",
      "Seating: relatives first, then superiors, then friends",
    ],
  },
  {
    monthsBefore: 0.25,
    label: "1週間前",
    labelEn: "1 week before",
    tasks: [
      "最終確認（人数・アレルギー・配席）",
      "持ち物リストの確認",
      "謝辞・手紙の準備",
      "ネイル・最終エステ",
      "当日のタイムスケジュール確認",
    ],
    tasksEn: [
      "Final confirmation (headcount, allergies, seating)",
      "Check packing list",
      "Prepare speeches & letters",
      "Final nail & beauty treatment",
      "Review day-of timeline",
    ],
    tips: [
      "ゲストのアレルギー情報は会場に最終報告",
      "花嫁の手紙は事前に何度か読み上げ練習を",
      "当日の荷物は前日に会場へ搬入できるか確認",
    ],
    tipsEn: [
      "Report final allergy info to venue",
      "Practice reading bride's letter several times",
      "Check if luggage can be delivered to venue the day before",
    ],
  },
];

// -----------------------------------------------------------------------------
// Venue Types (会場タイプ別特徴)
// -----------------------------------------------------------------------------

export type VenueType =
  | "hotel"
  | "specialized"
  | "guest_house"
  | "restaurant"
  | "shrine_church"
  | "resort";

export interface VenueTypeInfo {
  type: VenueType;
  label: string;
  labelEn: string;
  costRange: { min: number; max: number };
  capacity: { min: number; max: number };
  pros: string[];
  prosEn: string[];
  cons: string[];
  consEn: string[];
  description: string;
  descriptionEn: string;
}

export const VENUE_TYPES: VenueTypeInfo[] = [
  {
    type: "hotel",
    label: "ホテル",
    labelEn: "Hotel",
    costRange: { min: 3_500_000, max: 6_000_000 },
    capacity: { min: 30, max: 300 },
    pros: [
      "宿泊手配が楽",
      "設備・サービスが充実",
      "アクセスが良い立地が多い",
      "天候に左右されない",
    ],
    prosEn: [
      "Easy accommodation arrangements",
      "Comprehensive facilities & service",
      "Often well-located for access",
      "Weather-independent",
    ],
    cons: [
      "費用が高め",
      "自由度が低い（持ち込み制限）",
      "同日に複数組の場合がある",
    ],
    consEn: [
      "Higher cost",
      "Less flexibility (vendor restrictions)",
      "May have multiple weddings on same day",
    ],
    description: "安心感と格式を重視するカップル向け。遠方ゲストが多い場合に特に便利。",
    descriptionEn: "For couples prioritizing prestige and reliability. Convenient for out-of-town guests.",
  },
  {
    type: "specialized",
    label: "専門式場",
    labelEn: "Specialized Wedding Hall",
    costRange: { min: 3_000_000, max: 5_000_000 },
    capacity: { min: 20, max: 200 },
    pros: [
      "結婚式に特化した設備・ノウハウ",
      "チャペル・神殿が併設",
      "専属プランナーのサポートが手厚い",
    ],
    prosEn: [
      "Specialized wedding facilities & expertise",
      "Chapel or shrine on-site",
      "Dedicated planner support",
    ],
    cons: [
      "自由度がやや低い",
      "追加オプション費用が嵩みやすい",
    ],
    consEn: [
      "Somewhat limited flexibility",
      "Add-on option costs can accumulate",
    ],
    description: "結婚式のプロに任せたい安心派向け。パッケージプランが充実。",
    descriptionEn: "For those wanting professional wedding expertise. Rich package plans available.",
  },
  {
    type: "guest_house",
    label: "ゲストハウス",
    labelEn: "Guest House",
    costRange: { min: 3_000_000, max: 5_500_000 },
    capacity: { min: 30, max: 150 },
    pros: [
      "貸切でプライベート感がある",
      "自由度が高い（装飾・演出）",
      "ガーデンやプールなどのロケーション",
    ],
    prosEn: [
      "Private exclusive use",
      "High flexibility (decor & entertainment)",
      "Garden, pool, and other scenic locations",
    ],
    cons: [
      "天候に左右される演出がある",
      "アクセスが不便な場合がある",
      "収容人数に限りがある",
    ],
    consEn: [
      "Some elements weather-dependent",
      "May be less accessible",
      "Limited capacity",
    ],
    description: "オリジナリティを重視するカップル向け。ガーデンウェディングが人気。",
    descriptionEn: "For couples wanting originality. Garden weddings are popular.",
  },
  {
    type: "restaurant",
    label: "レストラン",
    labelEn: "Restaurant",
    costRange: { min: 1_500_000, max: 3_500_000 },
    capacity: { min: 10, max: 80 },
    pros: [
      "料理のクオリティが高い",
      "アットホームな雰囲気",
      "費用を抑えやすい",
      "少人数に向いている",
    ],
    prosEn: [
      "High food quality",
      "Warm, homey atmosphere",
      "Easier to manage costs",
      "Good for small gatherings",
    ],
    cons: [
      "控室・ブライズルームが狭い場合がある",
      "大人数には不向き",
      "挙式設備がない場合がある",
    ],
    consEn: [
      "Waiting rooms may be small",
      "Not suitable for large groups",
      "May lack ceremony facilities",
    ],
    description: "少人数・カジュアル婚向け。料理でゲストをもてなしたいカップルに。",
    descriptionEn: "For small, casual weddings. Ideal for couples wanting to impress with food.",
  },
  {
    type: "shrine_church",
    label: "神社・教会",
    labelEn: "Shrine / Church",
    costRange: { min: 2_000_000, max: 4_000_000 },
    capacity: { min: 20, max: 100 },
    pros: [
      "格式・伝統がある",
      "厳かな雰囲気",
      "写真映えするロケーション",
    ],
    prosEn: [
      "Prestigious & traditional",
      "Solemn atmosphere",
      "Photogenic location",
    ],
    cons: [
      "披露宴は別会場が必要な場合が多い",
      "バリアフリー対応が限定的",
      "季節・天候の影響を受ける",
    ],
    consEn: [
      "Reception often needs separate venue",
      "Limited accessibility",
      "Affected by season and weather",
    ],
    description: "和装婚・伝統的な挙式を希望するカップル向け。神前式が人気。",
    descriptionEn: "For couples wanting traditional Japanese or church ceremonies. Shinto style is popular.",
  },
  {
    type: "resort",
    label: "リゾート",
    labelEn: "Resort",
    costRange: { min: 2_000_000, max: 5_000_000 },
    capacity: { min: 10, max: 80 },
    pros: [
      "非日常感・特別なロケーション",
      "旅行と結婚式を兼ねられる",
      "少人数向けのプランが充実",
    ],
    prosEn: [
      "Extraordinary, special location",
      "Combines travel & wedding",
      "Good small-group packages",
    ],
    cons: [
      "ゲストの交通費・宿泊費負担が大きい",
      "打合せが遠隔になりがち",
      "大人数には不向き",
    ],
    consEn: [
      "High travel & accommodation cost for guests",
      "Planning meetings often remote",
      "Not suitable for large groups",
    ],
    description: "海外挙式・沖縄・軽井沢など。二人だけや家族のみの挙式にも人気。",
    descriptionEn: "Overseas, Okinawa, Karuizawa, etc. Popular for intimate family-only ceremonies.",
  },
];

// -----------------------------------------------------------------------------
// Regional Cost Multipliers (地域別費用差)
// -----------------------------------------------------------------------------

export interface RegionalMultiplier {
  region: string;
  regionEn: string;
  multiplier: number;
  note: string;
  noteEn: string;
}

export const REGIONAL_MULTIPLIERS: RegionalMultiplier[] = [
  {
    region: "首都圏（東京・神奈川・千葉・埼玉）",
    regionEn: "Greater Tokyo (Tokyo, Kanagawa, Chiba, Saitama)",
    multiplier: 1.2,
    note: "全国平均の約1.2倍。会場費・衣装代が高め。",
    noteEn: "About 1.2x national average. Higher venue and attire costs.",
  },
  {
    region: "関西（大阪・京都・兵庫）",
    regionEn: "Kansai (Osaka, Kyoto, Hyogo)",
    multiplier: 1.05,
    note: "全国平均よりやや高め。京都の神社婚は人気で割高。",
    noteEn: "Slightly above average. Kyoto shrine weddings are popular and pricier.",
  },
  {
    region: "東海（愛知・静岡・岐阜・三重）",
    regionEn: "Tokai (Aichi, Shizuoka, Gifu, Mie)",
    multiplier: 1.1,
    note: "名古屋は派手婚文化があり衣装・引出物の費用が高め。",
    noteEn: "Nagoya has a lavish wedding culture with higher attire and gift costs.",
  },
  {
    region: "九州（福岡・熊本・鹿児島など）",
    regionEn: "Kyushu (Fukuoka, Kumamoto, Kagoshima, etc.)",
    multiplier: 0.9,
    note: "全国平均よりやや低め。ゲスト人数は多い傾向。",
    noteEn: "Slightly below average. Tends to have more guests.",
  },
  {
    region: "北海道",
    regionEn: "Hokkaido",
    multiplier: 0.7,
    note: "会費制が主流（1人15,000-20,000円）。ご祝儀制と大きく異なる。",
    noteEn: "Fee-based system is standard (15K-20K per person). Very different from goshugi.",
  },
  {
    region: "東北（宮城・岩手・秋田など）",
    regionEn: "Tohoku (Miyagi, Iwate, Akita, etc.)",
    multiplier: 0.85,
    note: "全国平均より低め。ゲスト人数が多く、1人あたり費用は控えめ。",
    noteEn: "Below average. More guests with lower per-person costs.",
  },
  {
    region: "中国・四国（広島・岡山・愛媛など）",
    regionEn: "Chugoku-Shikoku (Hiroshima, Okayama, Ehime, etc.)",
    multiplier: 0.9,
    note: "全国平均よりやや低め。地方ならではのアットホームな式が多い。",
    noteEn: "Slightly below average. Homey, local-style ceremonies are common.",
  },
  {
    region: "北陸（石川・富山・福井）",
    regionEn: "Hokuriku (Ishikawa, Toyama, Fukui)",
    multiplier: 0.95,
    note: "ほぼ全国平均並み。加賀百万石の文化から引出物にこだわる傾向。",
    noteEn: "Near national average. Gift-giving influenced by Kaga cultural traditions.",
  },
  {
    region: "沖縄（リゾート婚）",
    regionEn: "Okinawa (Resort Wedding)",
    multiplier: 0.8,
    note: "少人数リゾート婚が主流で総額は抑えめ。旅費は別途。",
    noteEn: "Small resort weddings keep total cost down. Travel costs are separate.",
  },
];

// -----------------------------------------------------------------------------
// Seasonal Pricing (季節・曜日別料金傾向)
// -----------------------------------------------------------------------------

export interface SeasonalPricing {
  period: string;
  periodEn: string;
  multiplier: number;
  label: string;
  labelEn: string;
  description: string;
  descriptionEn: string;
}

export const SEASONAL_PRICING: SeasonalPricing[] = [
  {
    period: "3-5月（春）",
    periodEn: "Mar-May (Spring)",
    multiplier: 1.15,
    label: "ハイシーズン",
    labelEn: "Peak Season",
    description: "桜シーズンが最も人気。特に4月は予約が集中。",
    descriptionEn: "Cherry blossom season is most popular. April bookings are especially heavy.",
  },
  {
    period: "9-11月（秋）",
    periodEn: "Sep-Nov (Autumn)",
    multiplier: 1.15,
    label: "ハイシーズン",
    labelEn: "Peak Season",
    description: "気候が良く紅葉シーズン。10-11月が特に人気。",
    descriptionEn: "Pleasant weather and autumn foliage. Oct-Nov is especially popular.",
  },
  {
    period: "6月（梅雨）",
    periodEn: "June (Rainy Season)",
    multiplier: 0.95,
    label: "やや閑散期",
    labelEn: "Slight Off-Season",
    description: "ジューンブライドの需要はあるが梅雨で敬遠も。交渉次第で割引。",
    descriptionEn: "June Bride demand exists but rainy season deters some. Discounts possible.",
  },
  {
    period: "7-8月（夏）",
    periodEn: "Jul-Aug (Summer)",
    multiplier: 0.85,
    label: "閑散期",
    labelEn: "Off-Season",
    description: "暑さを嫌うゲストが多く閑散期。割引プランが充実。",
    descriptionEn: "Heat deters guests. Many discount plans available.",
  },
  {
    period: "12-2月（冬）",
    periodEn: "Dec-Feb (Winter)",
    multiplier: 0.85,
    label: "閑散期",
    labelEn: "Off-Season",
    description: "年末年始を除き閑散期。12月のクリスマス婚は一定の人気。",
    descriptionEn: "Off-season except New Year. Christmas weddings have some demand.",
  },
  {
    period: "土曜日（大安）",
    periodEn: "Saturday (Taian - Lucky Day)",
    multiplier: 1.2,
    label: "最高値",
    labelEn: "Highest Price",
    description: "最も人気の日取り。大安の土曜は1年以上前から予約が埋まる。",
    descriptionEn: "Most popular booking. Taian Saturdays fill up over a year in advance.",
  },
  {
    period: "日曜日",
    periodEn: "Sunday",
    multiplier: 1.05,
    label: "やや割高",
    labelEn: "Slightly Higher",
    description: "土曜の次に人気。翌日が仕事のため二次会は短めの傾向。",
    descriptionEn: "Second most popular. After-parties tend to be shorter before Monday work.",
  },
  {
    period: "平日（金曜含む）",
    periodEn: "Weekday (including Friday)",
    multiplier: 0.8,
    label: "割安",
    labelEn: "Discounted",
    description: "平日は大幅割引の会場が多い。ゲストの出席率が下がる点に注意。",
    descriptionEn: "Many venues offer big discounts. Note that guest attendance may drop.",
  },
  {
    period: "仏滅",
    periodEn: "Butsumetsu (Unlucky Day)",
    multiplier: 0.8,
    label: "割安",
    labelEn: "Discounted",
    description: "六曜を気にしないカップルなら大幅割引が得られる。親族への確認を推奨。",
    descriptionEn: "Big discounts for couples who don't mind. Check with family first.",
  },
];

// -----------------------------------------------------------------------------
// Hokkaido Fee-Based System (北海道 会費制)
// -----------------------------------------------------------------------------

export interface HokkaidoFeeSystem {
  description: string;
  descriptionEn: string;
  feePerGuest: { min: number; max: number };
  keyDifferences: string[];
  keyDifferencesEn: string[];
}

export const HOKKAIDO_FEE_SYSTEM: HokkaidoFeeSystem = {
  description:
    "北海道では「会費制」が主流。ゲストがご祝儀ではなく一律の会費（15,000-20,000円）を支払う。自己負担が少ない代わりに演出も控えめな傾向。",
  descriptionEn:
    "Hokkaido uses a fee-based system. Guests pay a flat fee (15K-20K yen) instead of goshugi. Lower self-payment but entertainment tends to be simpler.",
  feePerGuest: { min: 15_000, max: 20_000 },
  keyDifferences: [
    "ご祝儀は不要（親族・親しい友人は別途お祝いを渡す場合あり）",
    "会費は受付で現金払い（新札でなくてもOK）",
    "引出物は簡略化（プチギフト程度）",
    "料理はビュッフェ形式が多い",
    "自己負担は本州の半額以下になることも",
  ],
  keyDifferencesEn: [
    "No goshugi required (close relatives/friends may give separate gifts)",
    "Fee paid in cash at reception (new bills not required)",
    "Gifts simplified (small favors only)",
    "Food is often buffet-style",
    "Self-payment can be less than half of Honshu weddings",
  ],
};

// -----------------------------------------------------------------------------
// Cost Saving Tips (節約のコツ)
// -----------------------------------------------------------------------------

export interface CostSavingTip {
  category: string;
  categoryEn: string;
  tip: string;
  tipEn: string;
  savingsRange: { min: number; max: number };
}

export const COST_SAVING_TIPS: CostSavingTip[] = [
  {
    category: "日程",
    categoryEn: "Date",
    tip: "平日・仏滅・閑散期（夏冬）を選ぶと会場費が20-40%割引になることが多い",
    tipEn: "Weekday, Butsumetsu, or off-season (summer/winter) can get 20-40% venue discounts",
    savingsRange: { min: 200_000, max: 600_000 },
  },
  {
    category: "衣装",
    categoryEn: "Attire",
    tip: "カラードレスを省略してお色直しなしにすると20-30万円の節約に",
    tipEn: "Skip color dress and costume change to save 200K-300K yen",
    savingsRange: { min: 200_000, max: 300_000 },
  },
  {
    category: "招待状",
    categoryEn: "Invitations",
    tip: "Web招待状を活用すると印刷・郵送費が不要に",
    tipEn: "Use web-based invitations to eliminate printing and postage costs",
    savingsRange: { min: 10_000, max: 30_000 },
  },
  {
    category: "装花",
    categoryEn: "Flowers",
    tip: "旬の花を使う・グリーン多めにすると装花費用を30-50%削減",
    tipEn: "Use seasonal flowers and more greenery to reduce floral costs by 30-50%",
    savingsRange: { min: 50_000, max: 150_000 },
  },
  {
    category: "映像",
    categoryEn: "Video",
    tip: "プロフィールムービーを自作すると5-15万円節約。テンプレートサービスが充実",
    tipEn: "DIY profile video saves 50K-150K yen. Many template services available",
    savingsRange: { min: 50_000, max: 150_000 },
  },
  {
    category: "司会",
    categoryEn: "MC",
    tip: "友人に司会を依頼すると5-8万円節約（お礼2-3万円は必要）",
    tipEn: "Ask a friend to MC to save 50K-80K yen (honorarium of 20K-30K needed)",
    savingsRange: { min: 30_000, max: 70_000 },
  },
  {
    category: "引出物",
    categoryEn: "Gifts",
    tip: "カタログギフトなら単価を統一しやすく、持ち帰り不要のWeb版も人気",
    tipEn: "Catalog gifts standardize costs. Web catalog versions eliminate carrying",
    savingsRange: { min: 20_000, max: 50_000 },
  },
  {
    category: "写真",
    categoryEn: "Photography",
    tip: "前撮りをフリーカメラマンに依頼すると式場提携より5-10万円安い場合が多い",
    tipEn: "Freelance photographers for pre-shoots are often 50K-100K cheaper than venue partners",
    savingsRange: { min: 50_000, max: 100_000 },
  },
  {
    category: "ケーキ",
    categoryEn: "Cake",
    tip: "イミテーションケーキ+カットケーキで生ケーキより3-5万円節約",
    tipEn: "Imitation cake + cut cake saves 30K-50K vs fresh cake",
    savingsRange: { min: 30_000, max: 50_000 },
  },
  {
    category: "会場",
    categoryEn: "Venue",
    tip: "レストランウェディングはホテル・専門式場より100-200万円安い傾向",
    tipEn: "Restaurant weddings tend to be 1M-2M yen cheaper than hotels/specialized halls",
    savingsRange: { min: 1_000_000, max: 2_000_000 },
  },
];
