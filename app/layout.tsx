/**
 * @file layout.tsx
 * @description Root Layout with Clerk 한국어 로컬라이제이션
 *
 * Clerk 공식 문서 참고:
 * https://clerk.com/docs/guides/customizing-clerk/localization
 *
 * 주요 기능:
 * - 한국어(koKR) 로컬라이제이션 적용
 * - Tailwind CSS v4 호환성 설정
 * - 커스텀 에러 메시지 한국어화 (선택사항)
 */

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SaaS 템플릿",
  description: "Next.js + Clerk + Supabase 보일러플레이트",
};

/**
 * 커스텀 한국어 로컬라이제이션
 * 
 * 기본 koKR 로컬라이제이션에 커스텀 에러 메시지를 추가합니다.
 * 필요에 따라 추가 문자열을 커스터마이징할 수 있습니다.
 * 
 * @see https://clerk.com/docs/guides/customizing-clerk/localization#customize-error-messages
 */
const customKoKR = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    // 커스텀 에러 메시지 예시
    // not_allowed_access: "접근이 허용되지 않은 이메일 도메인입니다. 접근을 원하시면 이메일로 문의해주세요.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={customKoKR}
      appearance={{
        // Tailwind CSS v4 호환성 (필수)
        cssLayerName: "clerk",
        // 추가 스타일 커스터마이징 (선택사항)
        elements: {
          // 예시: 버튼 스타일 커스터마이징
          // formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
          // formButtonSecondary: "bg-gray-200 hover:bg-gray-300",
        },
      }}
    >
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SyncUserProvider>
            <Navbar />
            {children}
          </SyncUserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
