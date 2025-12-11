/**
 * @file stats-error.tsx
 * @description 통계 페이지용 에러 컴포넌트
 *
 * 통계 대시보드 페이지에서 사용하는 에러 컴포넌트입니다.
 * Server Component에서 사용할 수 있도록 Client Component로 구현되었습니다.
 *
 * 주요 기능:
 * - 에러 메시지 표시
 * - 재시도 버튼 (페이지 새로고침)
 * - 접근성 지원 (ARIA 라벨)
 *
 * @dependencies
 * - components/ui/error: Error 컴포넌트
 * - next/navigation: useRouter
 */

"use client";

import { useRouter } from "next/navigation";
import { Error } from "@/components/ui/error";

interface StatsErrorProps {
  /**
   * 에러 메시지
   */
  message?: string;
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
 * 통계 페이지용 에러 컴포넌트
 *
 * Server Component에서 사용할 수 있는 에러 컴포넌트입니다.
 * 재시도 버튼 클릭 시 페이지를 새로고침하여 데이터를 다시 로드합니다.
 *
 * @example
 * ```tsx
 * // Server Component에서 사용
 * try {
 *   const data = await getStatsSummary();
 *   return <StatsSummary data={data} />;
 * } catch (error) {
 *   return <StatsError message="통계 데이터를 불러오는 중 오류가 발생했습니다." />;
 * }
 * ```
 */
export function StatsError({
  message = "데이터를 불러오는 중 오류가 발생했습니다.",
  retryText = "다시 시도",
  className,
  compact = false,
}: StatsErrorProps) {
  const router = useRouter();

  const handleRetry = () => {
    // 페이지 새로고침하여 데이터 다시 로드
    router.refresh();
  };

  return (
    <Error
      message={message}
      onRetry={handleRetry}
      retryText={retryText}
      className={className}
      compact={compact}
    />
  );
}

