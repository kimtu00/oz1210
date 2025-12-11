/**
 * @file loading.tsx
 * @description 로딩 스피너 컴포넌트
 *
 * 데이터 로딩 중 표시할 스피너 컴포넌트입니다.
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  /**
   * 크기 변형
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * 추가 클래스명
   */
  className?: string;
  /**
   * 텍스트 표시 여부
   */
  showText?: boolean;
  /**
   * 커스텀 텍스트
   */
  text?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

/**
 * 로딩 스피너 컴포넌트
 *
 * @example
 * ```tsx
 * <Loading size="lg" showText text="로딩 중..." />
 * ```
 */
export function Loading({
  size = "md",
  className,
  showText = false,
  text = "로딩 중...",
}: LoadingProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2",
        className
      )}
    >
      <Loader2
        className={cn(
          "animate-spin text-gray-600 dark:text-gray-400",
          sizeMap[size]
        )}
      />
      {showText && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {text}
        </span>
      )}
    </div>
  );
}

/**
 * 전체 화면 로딩 오버레이
 *
 * @example
 * ```tsx
 * <LoadingOverlay />
 * ```
 */
export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <Loading size="lg" showText text="로딩 중..." />
    </div>
  );
}


