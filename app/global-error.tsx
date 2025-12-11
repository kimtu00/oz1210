/**
 * @file global-error.tsx
 * @description 전역 에러 바운더리
 *
 * Next.js 15의 전역 에러 바운더리로, Root Layout에서 발생한 에러를 처리합니다.
 *
 * 주요 기능:
 * 1. Root Layout 레벨 에러 처리
 * 2. 예상치 못한 전역 에러 처리
 * 3. 최소한의 UI 제공 (html, body 태그 포함)
 *
 * 주의사항:
 * - global-error.tsx는 layout.tsx를 완전히 대체하므로 html과 body 태그를 포함해야 합니다.
 * - Clerk, Supabase 등 외부 서비스 초기화 에러도 처리합니다.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/global-error
 */

"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface GlobalErrorProps {
  /**
   * 에러 객체
   */
  error: Error & { digest?: string };
  /**
   * 에러 바운더리 리셋 함수
   */
  reset: () => void;
}

/**
 * 전역 에러 바운더리 컴포넌트
 *
 * Root Layout의 에러를 처리하며, html과 body 태그를 포함해야 합니다.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  // 개발 환경에서만 에러 로깅
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[Global Error Boundary] Critical error occurred:", {
        message: error.message,
        digest: error.digest,
        stack: error.stack,
      });
    }
  }, [error]);

  return (
    <html lang="ko">
      <body className="antialiased">
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
          <div
            role="alert"
            aria-live="polite"
            aria-atomic="true"
            className="flex w-full max-w-md flex-col items-center justify-center gap-6 rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center"
          >
            {/* 에러 아이콘 */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
              <AlertCircle
                className="h-8 w-8 text-destructive"
                aria-hidden="true"
              />
            </div>

            {/* 에러 메시지 */}
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">
                심각한 오류가 발생했습니다
              </h1>
              <p className="text-sm text-muted-foreground">
                애플리케이션을 초기화하는 중 오류가 발생했습니다.
                <br />
                페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
              </p>
              {error.digest && process.env.NODE_ENV === "development" && (
                <p className="mt-2 text-xs text-muted-foreground/70">
                  에러 ID: {error.digest}
                </p>
              )}
            </div>

            {/* 액션 버튼 */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button
                onClick={reset}
                variant="default"
                className="min-h-[44px] gap-2"
                aria-label="다시 시도"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                다시 시도
              </Button>
              <Link href="/">
                <Button
                  variant="outline"
                  className="min-h-[44px] gap-2"
                  aria-label="홈으로 돌아가기"
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  홈으로
                </Button>
              </Link>
            </div>

            {/* 추가 안내 */}
            <p className="mt-4 text-xs text-muted-foreground/70">
              문제가 계속되면 페이지를 새로고침해주세요.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

