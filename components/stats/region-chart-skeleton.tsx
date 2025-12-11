/**
 * @file region-chart-skeleton.tsx
 * @description 지역별 분포 차트 Skeleton UI
 *
 * 차트 로딩 중 표시되는 스켈레톤 UI 컴포넌트입니다.
 */

import { Skeleton } from "@/components/ui/skeleton";

/**
 * 지역별 분포 차트 Skeleton UI
 */
export function RegionChartSkeleton() {
  return (
    <div className="w-full rounded-lg border bg-card p-6">
      <div className="space-y-4">
        {/* 차트 영역 Skeleton */}
        <div className="h-[300px] sm:h-[400px] w-full">
          <Skeleton className="h-full w-full" />
        </div>
        {/* 범례 영역 Skeleton */}
        <div className="flex justify-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

