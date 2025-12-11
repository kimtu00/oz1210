/**
 * @file error.tsx
 * @description 라우트 레벨 에러 바운더리
 *
 * Next.js 15의 에러 바운더리로, 라우트 세그먼트와 하위 세그먼트에서 발생한 에러를 처리합니다.
 *
 * 주요 기능:
 * 1. 에러 타입별 메시지 처리
 * 2. 재시도 기능 (reset 함수)
 * 3. 홈으로 돌아가기 기능
 * 4. 접근성 지원
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */

"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ErrorProps {
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
 * 에러 타입별 메시지 추출
 */
function getErrorMessage(error: Error): string {
  const message = error.message;

  // 네트워크 에러
  if (
    message.includes("네트워크") ||
    message.includes("연결") ||
    message.includes("fetch")
  ) {
    return "네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.";
  }

  // 타임아웃 에러
  if (message.includes("시간이 초과") || message.includes("timeout")) {
    return "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.";
  }

  // API 에러
  if (message.includes("API") || message.includes("데이터")) {
    return "데이터를 불러오는 중 오류가 발생했습니다.";
  }

  // 인증 에러
  if (message.includes("인증") || message.includes("권한")) {
    return "인증에 실패했습니다. 다시 로그인해주세요.";
  }

  // 기본 메시지 또는 에러 메시지 반환
  return message || "예기치 못한 오류가 발생했습니다.";
}

/**
 * 라우트 레벨 에러 바운더리 컴포넌트
 */
export default function Error({ error, reset }: ErrorProps) {
  // 개발 환경에서만 에러 로깅
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[Error Boundary] Error occurred:", {
        message: error.message,
        digest: error.digest,
        stack: error.stack,
      });
    }
  }, [error]);

  const errorMessage = getErrorMessage(error);

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
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
            오류가 발생했습니다
          </h1>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
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
      </div>
    </div>
  );
}

