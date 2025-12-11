/**
 * @file page.tsx
 * @description 북마크 목록 페이지
 *
 * 인증된 사용자가 북마크한 관광지 목록을 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. Clerk 인증 확인
 * 2. 북마크 목록 조회
 * 3. 관광지 정보 표시 (TourCard 재사용)
 * 4. 빈 상태 처리
 * 5. 로딩 상태 처리
 *
 * @dependencies
 * - lib/api/supabase-api: getUserBookmarksWithDetails
 * - components/bookmarks/bookmark-list: BookmarkList
 * - @clerk/nextjs/server: auth, redirect
 */

import { Suspense } from "react";
import { auth, redirect } from "@clerk/nextjs/server";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserBookmarksWithDetails } from "@/lib/api/supabase-api";
import { BookmarkList } from "@/components/bookmarks/bookmark-list";
import { BookmarkListSkeleton } from "@/components/bookmarks/bookmark-list-skeleton";

export const metadata: Metadata = {
  title: "내 북마크 - My Trip",
  description: "북마크한 관광지 목록을 확인하세요",
};

/**
 * 북마크 목록 데이터를 불러오는 Server Component
 */
async function BookmarkListData() {
  try {
    const bookmarks = await getUserBookmarksWithDetails();
    return <BookmarkList bookmarks={bookmarks} />;
  } catch (error) {
    console.error("[BookmarksPage] Failed to load bookmarks:", error);
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="mb-4 text-lg font-medium text-destructive">
          북마크 목록을 불러오는 중 오류가 발생했습니다
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          잠시 후 다시 시도해주세요
        </p>
        <Link href="/bookmarks">
          <Button className="min-h-[44px]">
            다시 시도
          </Button>
        </Link>
      </div>
    );
  }
}

/**
 * 북마크 목록 페이지
 */
export default async function BookmarksPage() {
  // Clerk 인증 확인
  const { userId } = await auth();

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">내 북마크</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            북마크한 관광지 목록을 확인하세요
          </p>
        </div>

        {/* 북마크 목록 */}
        <Suspense fallback={<BookmarkListSkeleton />}>
          <BookmarkListData />
        </Suspense>
      </div>
    </main>
  );
}

