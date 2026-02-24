import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppAuthWrapper from "@/components/AppAuthWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wedding Roadmap - 結婚をプロジェクトとしてスマートに管理",
  description:
    "結婚プロジェクトの全タスクを一元管理。100以上のプリセットタスク、予算追跡、タイムライン管理、婚前契約チェックリストで、理想の結婚を実現。",
  keywords: ["結婚式", "ウェディング", "準備", "タスク管理", "予算", "wedding", "planning", "結婚プロジェクト", "roadmap"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AppAuthWrapper>{children}</AppAuthWrapper>
      </body>
    </html>
  );
}
