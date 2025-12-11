/**
 * @file type-chart-skeleton.tsx
 * @description 관광 타입별 분포 차트 Skeleton UI
 *
 * 차트 로딩 중 표시되는 스켈레톤 UI 컴포넌트입니다.
 */

import { Skeleton } from "@/components/ui/skeleton";

/**
 * 관광 타입별 분포 차트 Skeleton UI
 */
export function TypeChartSkeleton() {
  return (
    <div className="w-full rounded-lg border bg-card p-6">
      <div className="space-y-4">
        {/* 차트 영역 Skeleton */}
        <div className="h-[300px] sm:h-[400px] w-full flex items-center justify-center">
          <Skeleton className="h-[250px] w-[250px] sm:h-[300px] sm:w-[300px] rounded-full" />
        </div>
        {/* 범례 영역 Skeleton */}
        <div className="flex flex-wrap justify-center gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
      </div>
    </div>
  );
}

