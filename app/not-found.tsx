/**
 * @file not-found.tsx
 * @description 404 페이지 (페이지를 찾을 수 없음)
 *
 * Next.js 15의 not-found.tsx로, 존재하지 않는 페이지에 대한 사용자 친화적인 404 페이지를 제공합니다.
 *
 * 주요 기능:
 * 1. 사용자 친화적인 404 메시지
 * 2. 홈으로 돌아가기 버튼
 * 3. 관광지 검색 링크
 * 4. 접근성 지원
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */

import { Metadata } from "next";
import Link from "next/link";
import { Home, Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다 - My Trip",
  description: "요청하신 페이지가 존재하지 않거나 이동되었습니다",
};

/**
 * 404 페이지 컴포넌트
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="flex w-full max-w-md flex-col items-center justify-center gap-6 rounded-lg border border-muted bg-muted/30 p-8 text-center"
      >
        {/* 404 아이콘 */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <MapPin
            className="h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
        </div>

        {/* 404 메시지 */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            404
          </h1>
          <h2 className="text-xl font-semibold text-foreground">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-sm text-muted-foreground">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
            <br />
            URL을 확인하거나 홈으로 돌아가 관광지를 검색해보세요.
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="default"
              className="w-full min-h-[44px] gap-2 sm:w-auto"
              aria-label="홈으로 돌아가기"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              홈으로
            </Button>
          </Link>
          <Link href="/?keyword=" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full min-h-[44px] gap-2 sm:w-auto"
              aria-label="관광지 검색하기"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              관광지 검색
            </Button>
          </Link>
        </div>

        {/* 추가 안내 */}
        <div className="mt-4 space-y-2 text-xs text-muted-foreground">
          <p>다른 페이지를 찾아보세요:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="hover:text-primary hover:underline"
              aria-label="홈페이지"
            >
              홈
            </Link>
            <Link
              href="/stats"
              className="hover:text-primary hover:underline"
              aria-label="통계 페이지"
            >
              통계
            </Link>
            <Link
              href="/bookmarks"
              className="hover:text-primary hover:underline"
              aria-label="북마크 페이지"
            >
              북마크
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

