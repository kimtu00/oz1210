/**
 * @file tour-map-view.tsx
 * @description 관광지 목록 및 지도 뷰 컴포넌트
 *
 * 관광지 목록과 지도를 함께 표시하고, 지도-리스트 연동을 처리하는 Client Component입니다.
 *
 * 주요 기능:
 * - 관광지 목록 표시
 * - 네이버 지도 표시
 * - 지도-리스트 연동 (선택된 관광지 동기화)
 * - 모바일 탭 전환 (목록/지도)
 *
 * @dependencies
 * - components/tour-list: TourList 컴포넌트
 * - components/naver-map: NaverMap 컴포넌트
 * - lib/types/tour: TourItem 타입
 */

"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { List, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourList } from "@/components/tour-list";
import { NaverMap } from "@/components/naver-map";
import type { TourItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourMapViewProps {
  /**
   * 관광지 목록
   */
  tours: TourItem[];
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
   * 검색 결과 총 개수
   */
  totalCount?: number;
  /**
   * 검색 키워드
   */
  searchKeyword?: string;
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

type ViewMode = "list" | "map";

/**
 * 관광지 목록 및 지도 뷰 컴포넌트
 */
export function TourMapView({
  tours,
  loading = false,
  error = null,
  onRetry,
  totalCount,
  searchKeyword,
  currentPage,
  totalPages,
  itemsPerPage,
}: TourMapViewProps) {
  const [selectedTourId, setSelectedTourId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const prevPageRef = useRef<number | undefined>(currentPage);
  const prevToursRef = useRef<TourItem[]>(tours);

  // 페이지 변경 시 선택 상태 초기화
  useEffect(() => {
    if (prevPageRef.current !== undefined && prevPageRef.current !== currentPage) {
      setSelectedTourId(undefined);
    }
    prevPageRef.current = currentPage;
  }, [currentPage]);

  // 관광지 목록 변경 시 선택된 항목이 목록에 없으면 초기화
  useEffect(() => {
    if (selectedTourId && !tours.find((tour) => tour.contentid === selectedTourId)) {
      setSelectedTourId(undefined);
    }
    prevToursRef.current = tours;
  }, [tours, selectedTourId]);

  // 관광지 선택 핸들러 (useCallback으로 메모이제이션)
  const handleTourSelect = useCallback((tourId: string) => {
    setSelectedTourId(tourId);
    // 모바일에서 지도로 전환
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setViewMode("map");
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* 모바일 탭 전환 버튼 */}
      <div className="flex gap-2 lg:hidden">
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("list")}
          className="flex-1 min-h-[44px]"
          aria-label="목록 보기"
        >
          <List className="mr-2 h-4 w-4" />
          목록
        </Button>
        <Button
          variant={viewMode === "map" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("map")}
          className="flex-1 min-h-[44px]"
          aria-label="지도 보기"
        >
          <MapIcon className="mr-2 h-4 w-4" />
          지도
        </Button>
      </div>

      {/* 데스크톱: 분할 레이아웃, 모바일: 탭 전환 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 좌측: 관광지 목록 */}
        <section
          className={cn(
            "lg:order-1",
            viewMode === "map" && "hidden lg:block"
          )}
        >
          <TourList
            items={tours}
            loading={loading}
            error={error}
            onRetry={onRetry || (() => {
              // 재시도를 위해 페이지 새로고침
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            })}
            totalCount={totalCount}
            searchKeyword={searchKeyword}
            selectedTourId={selectedTourId}
            onTourSelect={handleTourSelect}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
          />
        </section>

        {/* 우측: 지도 */}
        <section
          className={cn(
            "lg:order-2",
            viewMode === "list" && "hidden lg:block"
          )}
        >
          <NaverMap
            tours={tours}
            selectedTourId={selectedTourId}
            onTourSelect={handleTourSelect}
          />
        </section>
      </div>
    </div>
  );
}

