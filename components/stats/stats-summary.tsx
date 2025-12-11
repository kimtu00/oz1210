/**
 * @file stats-summary.tsx
 * @description 통계 요약 카드 컴포넌트
 *
 * 통계 대시보드에 통계 요약 정보를 카드 형태로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * - 전체 관광지 수 표시
 * - Top 3 지역 표시
 * - Top 3 타입 표시
 * - 마지막 업데이트 시간 표시
 *
 * @dependencies
 * - lib/api/stats-api: getStatsSummary
 * - lib/types/stats: StatsSummary
 */

import { MapPin, TrendingUp, Award } from "lucide-react";
import { getStatsSummary } from "@/lib/api/stats-api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { StatsError } from "./stats-error";

/**
 * 숫자 포맷팅 (천 단위 구분)
 */
function formatNumber(num: number): string {
  return new Intl.NumberFormat("ko-KR").format(num);
}

/**
 * 날짜 포맷팅
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * 통계 요약 카드 컴포넌트
 *
 * Server Component로 구현되어 서버에서 데이터를 가져옵니다.
 */
export async function StatsSummary() {
  try {
    const summary = await getStatsSummary();

    return (
      <div className="space-y-4">
        {/* 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 전체 관광지 수 카드 */}
          <div className="rounded-lg border bg-card p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">전체 관광지 수</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">
              {formatNumber(summary.totalCount)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">개</p>
          </div>

          {/* Top 3 지역 카드 */}
          {summary.topRegions.map((region, index) => (
            <div
              key={region.regionCode}
              className="rounded-lg border bg-card p-4 sm:p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <Award
                  className={cn(
                    "h-5 w-5",
                    index === 0 && "text-yellow-500",
                    index === 1 && "text-gray-400",
                    index === 2 && "text-amber-600"
                  )}
                />
                <p className="text-sm text-muted-foreground">
                  {index + 1}위 지역
                </p>
              </div>
              <p className="text-lg sm:text-xl font-semibold mb-1">
                {region.regionName}
              </p>
              <p className="text-xl sm:text-2xl font-bold">
                {formatNumber(region.count)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">개</p>
            </div>
          ))}

          {/* Top 3 타입 카드 */}
          {summary.topTypes.map((type, index) => (
            <div
              key={type.contentTypeId}
              className="rounded-lg border bg-card p-4 sm:p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp
                  className={cn(
                    "h-5 w-5",
                    index === 0 && "text-blue-500",
                    index === 1 && "text-green-500",
                    index === 2 && "text-purple-500"
                  )}
                />
                <p className="text-sm text-muted-foreground">
                  {index + 1}위 타입
                </p>
              </div>
              <p className="text-lg sm:text-xl font-semibold mb-1">
                {type.contentTypeName}
              </p>
              <p className="text-xl sm:text-2xl font-bold">
                {formatNumber(type.count)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">개</p>
            </div>
          ))}
        </div>

        {/* 마지막 업데이트 시간 */}
        <div className="text-center text-xs text-muted-foreground">
          마지막 업데이트: {formatDate(summary.lastUpdated)}
        </div>
      </div>
    );
  } catch (error) {
    // 에러 처리
    const errorMessage =
      error instanceof Error
        ? error.message
        : "통계 데이터를 불러오는 중 오류가 발생했습니다.";

    return (
      <div className="rounded-lg border bg-card p-6">
        <StatsError message={errorMessage} />
      </div>
    );
  }
}

/**
 * 통계 요약 카드 Skeleton UI
 *
 * Suspense fallback으로 사용됩니다.
 */
export function StatsSummarySkeleton() {
  return (
    <div className="space-y-4">
      {/* 카드 그리드 Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-card p-4 sm:p-6"
          >
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      {/* 업데이트 시간 Skeleton */}
      <div className="text-center">
        <Skeleton className="h-3 w-48 mx-auto" />
      </div>
    </div>
  );
}

