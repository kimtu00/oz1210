/**
 * @file detail-recommendations.tsx
 * @description 추천 관광지 섹션 컴포넌트
 *
 * 현재 관광지와 같은 지역 또는 타입의 다른 관광지를 추천합니다.
 *
 * 주요 기능:
 * 1. 같은 타입의 다른 관광지 조회 (contentTypeId 기반)
 * 2. 현재 관광지 제외 필터링
 * 3. 최대 6개 추천 표시
 * 4. 카드 형태로 표시 (TourCard 재사용)
 *
 * @dependencies
 * - lib/api/tour-api: getAreaBasedList
 * - components/tour-card: TourCard
 * - components/ui/skeleton: Skeleton
 * - lib/types/tour: TourItem
 */

import { Suspense } from "react";
import { getAreaBasedList } from "@/lib/api/tour-api";
import { TourCard } from "@/components/tour-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TourItem } from "@/lib/types/tour";

interface DetailRecommendationsProps {
  /**
   * 현재 관광지 ID (제외 대상)
   */
  currentContentId: string;
  /**
   * 관광 타입 ID (필수)
   */
  contentTypeId: string;
  /**
   * 지역 코드 (선택 사항)
   */
  areaCode?: string;
  /**
   * 최대 추천 개수 (기본값: 6)
   */
  maxItems?: number;
}

/**
 * 추천 관광지 목록 스켈레톤 컴포넌트
 */
function RecommendationsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg border bg-card shadow-sm"
        >
          <Skeleton className="aspect-[16/9] w-full" />
          <div className="p-4">
            <Skeleton className="mb-2 h-5 w-20" />
            <Skeleton className="mb-2 h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 추천 관광지 데이터 로드 컴포넌트
 */
async function RecommendationsData({
  currentContentId,
  contentTypeId,
  areaCode,
  maxItems = 6,
}: DetailRecommendationsProps) {
  try {
    // 같은 타입의 관광지 조회
    // areaCode가 있으면 지역 필터 적용, 없으면 타입만 사용
    const { items } = await getAreaBasedList({
      areaCode,
      contentTypeId,
      numOfRows: maxItems + 3, // 현재 관광지 제외를 고려하여 여유있게 조회
      pageNo: 1,
    });

    // 현재 관광지 제외 및 최대 개수 제한
    const recommendations = items
      .filter((item) => item.contentid !== currentContentId)
      .slice(0, maxItems);

    // 추천 관광지가 없으면 null 반환 (섹션 숨김)
    if (recommendations.length === 0) {
      return null;
    }

    return (
      <div
        role="region"
        aria-label="추천 관광지"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
      >
        {recommendations.map((tour) => (
          <TourCard key={tour.contentid} tour={tour} />
        ))}
      </div>
    );
  } catch (error) {
    // 에러 발생 시 섹션 숨김 (사용자 경험을 해치지 않도록 조용히 실패)
    console.error("[DetailRecommendations] Failed to fetch recommendations:", error);
    return null;
  }
}

/**
 * 추천 관광지 섹션 래퍼 컴포넌트
 * 
 * RecommendationsData가 null을 반환할 때 섹션 전체를 숨기기 위한 래퍼
 */
async function RecommendationsWrapper(props: DetailRecommendationsProps) {
  const content = await RecommendationsData(props);
  
  // 추천 관광지가 없거나 에러 발생 시 섹션 숨김
  if (!content) {
    return null;
  }
  
  return (
    <section className="space-y-4 border-t pt-8">
      <h2 className="text-xl font-semibold md:text-2xl">이런 관광지는 어떠세요?</h2>
      {content}
    </section>
  );
}

/**
 * 추천 관광지 섹션 컴포넌트
 *
 * @example
 * ```tsx
 * <DetailRecommendations
 *   currentContentId="125266"
 *   contentTypeId="12"
 *   areaCode="1"
 * />
 * ```
 */
export function DetailRecommendations(props: DetailRecommendationsProps) {
  return (
    <Suspense fallback={
      <section className="space-y-4 border-t pt-8">
        <h2 className="text-xl font-semibold md:text-2xl">이런 관광지는 어떠세요?</h2>
        <RecommendationsSkeleton count={props.maxItems || 6} />
      </section>
    }>
      <RecommendationsWrapper {...props} />
    </Suspense>
  );
}

