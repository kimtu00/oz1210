/**
 * @file bookmark-list-skeleton.tsx
 * @description 북마크 목록 로딩 스켈레톤 컴포넌트
 *
 * 북마크 목록 로딩 중 표시할 스켈레톤 UI입니다.
 * TourCard와 동일한 레이아웃을 사용합니다.
 *
 * @dependencies
 * - components/ui/skeleton: Skeleton
 */

import { Skeleton } from "@/components/ui/skeleton";

/**
 * 북마크 목록 로딩 스켈레톤 컴포넌트
 */
export function BookmarkListSkeleton() {
  return (
    <div>
      {/* 헤더 스켈레톤: 북마크 개수 및 정렬 옵션 */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Skeleton className="h-5 w-32 sm:h-6" />
        <Skeleton className="h-11 w-[140px] sm:w-[160px]" />
      </div>

      {/* 북마크 목록 그리드 스켈레톤 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border bg-card shadow-sm">
            {/* 이미지 스켈레톤 */}
            <Skeleton className="aspect-[16/9] w-full" />
            {/* 카드 내용 스켈레톤 */}
            <div className="p-3 sm:p-4 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

