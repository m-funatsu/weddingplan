import Link from "next/link";

const features = [
  {
    icon: "📋",
    title: "100+プリセットタスク",
    titleEn: "100+ Preset Tasks",
    desc: "市場調査に基づく包括的なタスクリスト。婚約から式後手続きまで網羅。",
  },
  {
    icon: "📅",
    title: "タイムライン管理",
    titleEn: "Timeline Management",
    desc: "挙式日から逆算した10フェーズのタイムライン。期限を自動計算。",
  },
  {
    icon: "💰",
    title: "予算追跡",
    titleEn: "Budget Tracking",
    desc: "見積と実費をカテゴリ別に比較。予算オーバーを未然に防止。",
  },
  {
    icon: "📝",
    title: "婚前契約チェックリスト",
    titleEn: "Prenup Checklist",
    desc: "資産・負債・収入・不動産など30+項目の確認リスト。",
  },
  {
    icon: "📱",
    title: "オフライン対応",
    titleEn: "Offline Ready",
    desc: "ローカルストレージで即座に動作。Supabase連携で複数端末同期も。",
  },
  {
    icon: "🌏",
    title: "日英バイリンガル",
    titleEn: "Bilingual Support",
    desc: "日本語と英語を切り替え可能。国際カップルにも対応。",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-rose-600 focus:text-white focus:rounded-lg">
        コンテンツへスキップ
      </a>
      {/* Hero */}
      <header className="relative overflow-hidden" id="main-content">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-600/10 to-pink-600/10" />
        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-100 text-rose-700 rounded-full text-sm font-medium mb-6">
            💍 結婚プロジェクト管理ツール
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            Wedding<span className="text-rose-600"> Roadmap</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            婚約から新生活まで、結婚というプロジェクトのすべてを一元管理。
            <br className="hidden sm:block" />
            100以上のプリセットで、準備の漏れを防ぎます。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/25 hover:shadow-rose-600/40"
            >
              無料で始める
            </Link>
            <Link
              href="/tasks"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-rose-700 font-semibold rounded-xl hover:bg-rose-50 transition-all border border-rose-200"
            >
              タスクを見る
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4">
          充実の機能
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-lg mx-auto">
          結婚プロジェクトに必要なすべてを、ひとつのアプリで
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/80 backdrop-blur-sm rounded-xl border border-rose-100 p-6 hover:shadow-md hover:border-rose-200 transition-all"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline Preview */}
      <section className="bg-white/60 backdrop-blur-sm border-y border-rose-100">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4">
            10フェーズのタイムライン
          </h2>
          <p className="text-center text-gray-500 mb-10 max-w-lg mx-auto">
            挙式日から逆算して、最適なスケジュールを自動計算
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { num: "1", label: "婚約準備", time: "12ヶ月+" },
              { num: "2", label: "情報収集", time: "12〜10ヶ月" },
              { num: "3", label: "式場決定", time: "10〜8ヶ月" },
              { num: "4", label: "詳細計画", time: "8〜6ヶ月" },
              { num: "5", label: "本格準備", time: "6〜4ヶ月" },
              { num: "6", label: "詰め作業", time: "4〜2ヶ月" },
              { num: "7", label: "最終確認", time: "2〜1ヶ月" },
              { num: "8", label: "直前準備", time: "〜前日" },
              { num: "9", label: "挙式当日", time: "当日" },
              { num: "10", label: "式後手続き", time: "式後" },
            ].map((phase) => (
              <div
                key={phase.num}
                className="bg-white rounded-lg border border-rose-100 p-3 text-center hover:border-rose-300 transition-colors"
              >
                <div className="w-8 h-8 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">
                  {phase.num}
                </div>
                <p className="text-sm font-medium text-gray-900">{phase.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{phase.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4">
          料金プラン
        </h2>
        <p className="text-center text-gray-500 mb-10 max-w-lg mx-auto">
          無料で始めて、必要に応じてアップグレード
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Free</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">¥0</span>
            </div>
            <ul className="space-y-3 text-sm text-gray-600 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5" aria-hidden="true">&#10003;</span>
                ダッシュボード
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5" aria-hidden="true">&#10003;</span>
                100+プリセットタスク
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5" aria-hidden="true">&#10003;</span>
                タイムライン管理
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5" aria-hidden="true">&#10003;</span>
                設定・ゲストモード
              </li>
            </ul>
            <Link
              href="/dashboard"
              className="block w-full py-3 text-center bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              無料で始める
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-2xl border-2 border-rose-300 p-6 sm:p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-full">
              おすすめ
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Premium</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">¥980</span>
              <span className="text-sm text-gray-500 ml-1">買い切り</span>
            </div>
            <ul className="space-y-3 text-sm text-gray-600 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5" aria-hidden="true">&#10003;</span>
                Freeの全機能
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 mt-0.5" aria-hidden="true">&#9733;</span>
                予算管理ページ
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 mt-0.5" aria-hidden="true">&#9733;</span>
                婚前契約チェックリスト
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 mt-0.5" aria-hidden="true">&#9733;</span>
                データエクスポート/インポート
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 mt-0.5" aria-hidden="true">&#9733;</span>
                クラウド同期（複数端末）
              </li>
            </ul>
            <Link
              href="/dashboard"
              className="block w-full py-3 text-center bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/25"
            >
              Premiumを購入
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          理想の結婚を、計画的に
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          無料で始められます。ゲストモードならアカウント登録も不要。
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-10 py-4 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/25 text-lg"
        >
          今すぐ準備を始める →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-rose-100 bg-white/40">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-gray-400">
          <span>Wedding Roadmap v0.2.0</span>
          <span>Made with ♥</span>
        </div>
      </footer>
    </div>
  );
}
