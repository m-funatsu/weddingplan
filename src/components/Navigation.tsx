"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePremium } from "@/contexts/PremiumContext";
import {
  LayoutDashboard,
  CheckCircle2,
  Wallet,
  Calculator,
  Building,
  CalendarDays,
  Lightbulb,
  Banknote,
  ShieldCheck,
  Settings,
  Heart,
} from "lucide-react";
import type { ReactNode } from "react";

interface NavItemDef {
  href: string;
  labelJa: string;
  labelEn: string;
  icon: ReactNode;
  iconMobile: ReactNode;
}

const navItems: NavItemDef[] = [
  { href: "/dashboard", labelJa: "ダッシュボード", labelEn: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, iconMobile: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/tasks", labelJa: "タスク管理", labelEn: "Tasks", icon: <CheckCircle2 className="w-5 h-5" />, iconMobile: <CheckCircle2 className="w-5 h-5" /> },
  { href: "/budget", labelJa: "予算管理", labelEn: "Budget", icon: <Wallet className="w-5 h-5" />, iconMobile: <Wallet className="w-5 h-5" /> },
  { href: "/estimate", labelJa: "費用シミュレーター", labelEn: "Estimator", icon: <Calculator className="w-5 h-5" />, iconMobile: <Calculator className="w-5 h-5" /> },
  { href: "/venues", labelJa: "会場比較", labelEn: "Venues", icon: <Building className="w-5 h-5" />, iconMobile: <Building className="w-5 h-5" /> },
  { href: "/timeline", labelJa: "タイムライン", labelEn: "Timeline", icon: <CalendarDays className="w-5 h-5" />, iconMobile: <CalendarDays className="w-5 h-5" /> },
  { href: "/advisory", labelJa: "アドバイス", labelEn: "Advisory", icon: <Lightbulb className="w-5 h-5" />, iconMobile: <Lightbulb className="w-5 h-5" /> },
  { href: "/tips", labelJa: "節約ガイド", labelEn: "Tips", icon: <Banknote className="w-5 h-5" />, iconMobile: <Banknote className="w-5 h-5" /> },
  { href: "/prenup", labelJa: "婚前契約", labelEn: "Prenup", icon: <ShieldCheck className="w-5 h-5" />, iconMobile: <ShieldCheck className="w-5 h-5" /> },
  { href: "/settings", labelJa: "設定", labelEn: "Settings", icon: <Settings className="w-5 h-5" />, iconMobile: <Settings className="w-5 h-5" /> },
];

const PRO_ITEMS = new Set(["/budget", "/prenup"]);

export default function Navigation() {
  const pathname = usePathname();
  const { isPremium } = usePremium();

  if (pathname === "/") return null;

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-56 backdrop-blur-xl bg-white/80 border-r border-gray-100 flex-col z-40" aria-label="デスクトップナビゲーション">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Wedding Roadmap</span>
        </Link>
        <div className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-violet-50 to-indigo-50 text-indigo-700 shadow-sm border-r-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon}
                <span>{item.labelJa}</span>
                {!isPremium && PRO_ITEMS.has(item.href) && (
                  <span className="ml-auto px-1.5 py-0.5 bg-gradient-to-r from-violet-100 to-indigo-100 text-indigo-700 rounded text-[10px] font-bold leading-none" aria-label="Premium機能">PRO</span>
                )}
              </Link>
            );
          })}
        </div>
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">Wedding Roadmap v0.2.0</p>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-white/80 border-t border-gray-100 z-40 safe-area-bottom"
        aria-label="モバイルナビゲーション"
      >
        <div className="flex items-center overflow-x-auto py-2 px-1 gap-0 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-2.5 py-1 text-[10px] font-medium transition-all shrink-0 rounded-lg mx-0.5 ${
                  isActive
                    ? "bg-gradient-to-r from-violet-50 to-indigo-50 text-indigo-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="relative">
                  {item.iconMobile}
                  {!isPremium && PRO_ITEMS.has(item.href) && (
                    <span className="absolute -top-1 -right-2 px-1 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded text-[8px] font-bold leading-tight" aria-label="Premium機能">PRO</span>
                  )}
                </div>
                <span className="truncate max-w-[3.5rem]">{item.labelJa}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
