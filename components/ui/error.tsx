/**
 * @file error.tsx
 * @description 에러 메시지 컴포넌트
 *
 * 에러 상태를 표시하고 재시도 기능을 제공하는 컴포넌트입니다.
 */

"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorProps {
  /**
   * 에러 메시지
   */
  message?: string;
  /**
   * 재시도 함수
   */
  onRetry?: () => void;
  /**
   * 재시도 버튼 텍스트
   * @default "다시 시도"
   */
  retryText?: string;
  /**
   * 추가 클래스명
   */
  className?: string;
  /**
   * 컴팩트 모드 (작은 크기)
   */
  compact?: boolean;
}

/**
 * 에러 메시지 컴포넌트
 *
 * @example
 * ```tsx
 * <Error
 *   message="데이터를 불러오는 중 오류가 발생했습니다."
 *   onRetry={() => refetch()}
 * />
 * ```
 */
export function Error({
  message = "오류가 발생했습니다.",
  onRetry,
  retryText = "다시 시도",
  className,
  compact = false,
}: ErrorProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900",
        compact && "p-4 gap-2",
        className
      )}
    >
      <AlertCircle 
        className="h-6 w-6 text-red-600 dark:text-red-400" 
        aria-hidden="true"
      />
      <p
        className={cn(
          "text-sm text-red-600 dark:text-red-400 text-center max-w-md",
          compact && "text-xs"
        )}
      >
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={onRetry}
          className="mt-2"
          aria-label={`${retryText} 버튼`}
        >
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          {retryText}
        </Button>
      )}
    </div>
  );
}

/**
 * 인라인 에러 메시지 (작은 크기)
 *
 * @example
 * ```tsx
 * <InlineError message="필수 입력 항목입니다." />
 * ```
 */
export function InlineError({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-red-600 dark:text-red-400",
        className
      )}
    >
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}

