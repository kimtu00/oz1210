/**
 * @file tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 관광지 카드 목록을 그리드 레이아웃으로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * - 그리드 레이아웃 (반응형)
 * - 로딩 상태 (Skeleton UI)
 * - 빈 상태 처리
 * - 에러 상태 처리
 *
 * @dependencies
 * - components/tour-card: TourCard 컴포넌트
 * - components/ui/skeleton: Skeleton UI
 * - components/ui/error: Error 컴포넌트
 * - lib/types/tour: TourItem 타입
 */

"use client";

import { useEffect, useState } from "react";
import { TourCard } from "@/components/tour-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Error } from "@/components/ui/error";
import { TourPagination } from "@/components/tour-pagination";
import type { TourItem } from "@/lib/types/tour";
import { MapPin, Search } from "lucide-react";

interface TourListProps {
  /**
   * 관광지 목록
   */
  items?: TourItem[];
  /**
   * 로딩 상태
   */
  loading?: boolean;
  /**
   * 에러 상태
   */
  error?: Error | null;
  /**
   * 재시도 함수
   */
  onRetry?: () => void;
  /**
   * 추가 클래스명
   */
  className?: string;
  /**
   * 검색 결과 총 개수
   */
  totalCount?: number;
  /**
   * 검색 키워드
   */
  searchKeyword?: string;
  /**
   * 선택된 관광지 ID (지도 연동용)
   */
  selectedTourId?: string;
  /**
   * 관광지 선택 핸들러 (지도 연동용)
   */
  onTourSelect?: (tourId: string) => void;
  /**
   * 현재 페이지 번호
   */
  currentPage?: number;
  /**
   * 총 페이지 수
   */
  totalPages?: number;
  /**
   * 페이지당 항목 수
   */
  itemsPerPage?: number;
}

/**
 * 관광지 목록 스켈레톤 컴포넌트
 */
function TourListSkeleton({ count = 15 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg border bg-card shadow-sm"
        >
          {/* 이미지 스켈레톤 */}
          <Skeleton className="aspect-[16/9] w-full" />
          {/* 내용 스켈레톤 */}
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
 * 빈 상태 컴포넌트
 */
function EmptyState({ isSearchMode }: { isSearchMode?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="rounded-full bg-muted p-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">
          {isSearchMode ? "검색 결과가 없습니다" : "관광지가 없습니다"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {isSearchMode
            ? "다른 키워드로 검색해보세요"
            : "검색 조건을 변경해보세요"}
        </p>
      </div>
    </div>
  );
}

/**
 * 검색 결과 헤더 컴포넌트
 */
function SearchResultsHeader({
  keyword,
  totalCount,
}: {
  keyword: string;
  totalCount?: number;
}) {
  return (
    <div className="mb-4 rounded-lg border bg-muted/50 p-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">검색어:</span> "
        {keyword}"
        {totalCount !== undefined && (
          <span className="ml-2">
            · 총 <span className="font-medium">{totalCount}</span>개의 결과
          </span>
        )}
      </p>
    </div>
  );
}

/**
 * 관광지 목록 컴포넌트
 *
 * @example
 * ```tsx
 * <TourList
 *   items={tours}
 *   loading={isLoading}
 *   error={error}
 *   onRetry={() => refetch()}
 * />
 * ```
 */
export function TourList({
  items,
  loading = false,
  error = null,
  onRetry,
  className,
  totalCount,
  searchKeyword,
  selectedTourId,
  onTourSelect,
  currentPage,
  totalPages,
  itemsPerPage,
}: TourListProps) {
  const isSearchMode = !!searchKeyword;
  const [isOnline, setIsOnline] = useState(true);

  // 오프라인 상태 감지
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 오프라인 상태일 때 자동 재시도
  useEffect(() => {
    if (!isOnline && onRetry) {
      const handleOnline = () => {
        setIsOnline(true);
        // 네트워크 재연결 시 자동 재시도
        setTimeout(() => {
          onRetry();
        }, 500);
      };
      window.addEventListener("online", handleOnline);
      return () => window.removeEventListener("online", handleOnline);
    }
  }, [isOnline, onRetry]);

  // 로딩 상태
  if (loading) {
    return (
      <div className={className}>
        <TourListSkeleton count={itemsPerPage || 15} />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    // 에러 메시지 개선
    let errorMessage = "관광지 목록을 불러오는 중 오류가 발생했습니다.";
    if (!isOnline) {
      errorMessage = "인터넷 연결이 끊어졌습니다. 연결을 확인해주세요.";
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.name === "TypeError" || error.message.includes("네트워크")) {
      errorMessage = "네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.";
    } else if (error.message.includes("시간이 초과")) {
      errorMessage = "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.";
    } else if (error.message.includes("한도를 초과")) {
      errorMessage = "일일 조회 한도를 초과했습니다. 내일 다시 시도해주세요.";
    }

    return (
      <div className={className}>
        <Error
          message={errorMessage}
          onRetry={isOnline ? onRetry : undefined}
          retryText={isOnline ? "다시 시도" : "연결 대기 중..."}
        />
      </div>
    );
  }

  // 빈 상태
  if (!items || items.length === 0) {
    return (
      <div className={className}>
        {isSearchMode && searchKeyword && (
          <SearchResultsHeader keyword={searchKeyword} totalCount={0} />
        )}
        <EmptyState isSearchMode={isSearchMode} />
      </div>
    );
  }

  // 목록 표시
  return (
    <div className={className}>
      {isSearchMode && searchKeyword && (
        <SearchResultsHeader keyword={searchKeyword} totalCount={totalCount} />
      )}
      <div
        role="list"
        aria-label={isSearchMode ? "검색 결과 목록" : "관광지 목록"}
        className="grid grid-cols-1 gap-3 sm:gap-4"
      >
        {items.map((tour) => (
          <div key={tour.contentid} role="listitem">
            <TourCard
              tour={tour}
              isSelected={selectedTourId === tour.contentid}
              onClick={() => onTourSelect?.(tour.contentid)}
            />
          </div>
        ))}
      </div>
      
      {/* 페이지네이션 */}
      {currentPage !== undefined &&
        totalPages !== undefined &&
        itemsPerPage !== undefined &&
        totalCount !== undefined && (
          <div className="mt-8">
            <TourPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
    </div>
  );
}

