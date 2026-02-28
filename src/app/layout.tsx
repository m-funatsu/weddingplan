import type { Metadata, Viewport } from "next";
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
  title: "Wedding Roadmap - 交際から入籍・新生活までの結婚ロードマップ",
  description:
    "交際中の価値観すり合わせから入籍・新生活まで、結婚の道のり全体を管理。140以上のタスク、9フェーズのマイルストーン管理、予算追跡で二人の未来を計画的に。",
  keywords: ["結婚", "入籍", "ロードマップ", "マイルストーン", "タスク管理", "予算", "wedding", "marriage", "roadmap", "結婚準備"],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
