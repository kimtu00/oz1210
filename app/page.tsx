/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록 및 지도 표시
 *
 * 주요 기능:
 * 1. 관광지 목록 표시
 * 2. 네이버 지도 연동
 * 3. 필터 기능
 * 4. 검색 기능
 *
 * 레이아웃 구조:
 * - 데스크톱: 리스트(좌측) + 지도(우측) 분할 레이아웃
 * - 모바일: 탭 형태로 리스트/지도 전환
 *
 * @dependencies
 * - components/Navbar: 헤더 네비게이션 (app/layout.tsx에서 렌더링)
 * - components/tour-map-view: 관광지 목록 및 지도 뷰
 * - components/tour-filters: 필터 컴포넌트
 * - lib/api/tour-api: getAreaBasedList, searchKeyword 함수
 * - lib/utils/filter: parseFilterParams
 *
 * 페이지네이션:
 * - 페이지당 15개 항목 표시
 * - URL 쿼리 파라미터 `page`로 페이지 번호 관리
 * - 필터 변경 시 페이지는 1로 리셋됨
 */

import { Suspense } from "react";
import { TourMapView } from "@/components/tour-map-view";
import { TourFilters } from "@/components/tour-filters";
import { getAreaBasedList, searchKeyword } from "@/lib/api/tour-api";
import { parseFilterParams } from "@/lib/utils/filter";
import {
  validateFilterAccuracy,
  validatePaginationCount,
  logConsistencyIssues,
} from "@/lib/utils/data-consistency";
import {
  validateURLParams,
  validateFilterURLSync,
  logURLSyncIssues,
} from "@/lib/utils/url-sync-validator";
import { performanceMetricsStore } from "@/lib/utils/performance-metrics";
import type { TourItem } from "@/lib/types/tour";

/**
 * 관광지 목록을 불러오는 Server Component
 */
async function TourListData({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // 성능 측정 시작 (클라이언트 사이드에서만 동작)
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    performanceMetricsStore.startPageLoad();
  }

  try {
    // URL 파라미터 검증 (개발 환경)
    if (process.env.NODE_ENV === "development") {
      const urlValidation = validateURLParams(searchParams);
      if (!urlValidation.isValid || urlValidation.warnings.length > 0) {
        logURLSyncIssues(urlValidation, "URL 파라미터 검증");
      }
    }

    // 필터 파라미터 파싱
    const filters = parseFilterParams(searchParams);
    const isSearchMode = !!filters.keyword;

    // 필터-URL 동기화 검증 (개발 환경)
    if (process.env.NODE_ENV === "development") {
      const syncValidation = validateFilterURLSync(filters, searchParams);
      if (!syncValidation.isValid || syncValidation.warnings.length > 0) {
        logURLSyncIssues(syncValidation, "필터-URL 동기화 검증");
      }
    }
    
    // 페이지 번호 (기본값: 1, 최소값: 1)
    let currentPage = filters.page || 1;
    if (currentPage < 1) {
      currentPage = 1;
    }
    const itemsPerPage = 15;

    let items: TourItem[] = [];
    let totalCount = 0;

    if (isSearchMode) {
      // 검색 모드: searchKeyword() 사용
      const searchParams: {
        keyword: string;
        areaCode?: string;
        contentTypeId?: string;
        numOfRows: number;
        pageNo: number;
      } = {
        keyword: filters.keyword!,
        numOfRows: itemsPerPage,
        pageNo: currentPage,
      };

      if (filters.areaCode) {
        searchParams.areaCode = filters.areaCode;
      }

      if (filters.contentTypeId && filters.contentTypeId.length > 0) {
        // 첫 번째 타입만 API에 전달 (API 제약)
        searchParams.contentTypeId = filters.contentTypeId[0];
      }

      const result = await searchKeyword(searchParams);
      items = result.items;
      totalCount = result.totalCount;
    } else {
      // 일반 목록 모드: getAreaBasedList() 사용
      const apiParams: {
        areaCode?: string;
        contentTypeId?: string;
        numOfRows: number;
        pageNo: number;
      } = {
        numOfRows: itemsPerPage,
        pageNo: currentPage,
      };

      if (filters.areaCode) {
        apiParams.areaCode = filters.areaCode;
      }

      if (filters.contentTypeId && filters.contentTypeId.length > 0) {
        // 첫 번째 타입만 API에 전달 (API 제약)
        apiParams.contentTypeId = filters.contentTypeId[0];
      }

      const result = await getAreaBasedList(apiParams);
      items = result.items;
      totalCount = result.totalCount;
    }

    // 클라이언트 사이드 필터링 및 정렬
    let filteredItems: TourItem[] = [...items];

    // 관광 타입 필터링 (다중 선택)
    if (filters.contentTypeId && filters.contentTypeId.length > 0) {
      filteredItems = filteredItems.filter((item) =>
        filters.contentTypeId!.includes(item.contenttypeid)
      );
    }

    // 반려동물 필터링 (현재는 API에서 지원하지 않으므로 스킵)
    // 향후 getDetailPetTour()를 사용하여 사후 필터링 가능

    // 정렬
    if (filters.sort === "name") {
      filteredItems.sort((a, b) => a.title.localeCompare(b.title, "ko"));
    } else {
      // 최신순 (modifiedtime 기준 내림차순)
      filteredItems.sort(
        (a, b) =>
          new Date(b.modifiedtime).getTime() -
          new Date(a.modifiedtime).getTime()
      );
    }

    // 총 개수 계산 (검색 모드는 API totalCount, 일반 모드는 필터링 후 개수)
    const finalTotalCount = isSearchMode ? totalCount : filteredItems.length;
    
    // 데이터 일관성 검증 (개발 환경)
    if (process.env.NODE_ENV === "development") {
      // 필터 정확성 검증
      const filterValidation = validateFilterAccuracy(items, filteredItems, filters);
      if (!filterValidation.isValid || filterValidation.warnings.length > 0) {
        logConsistencyIssues(filterValidation, "필터 정확성 검증");
      }

      // 페이지네이션 총 개수 검증
      const paginationValidation = validatePaginationCount(
        totalCount,
        filteredItems.length,
        currentPage,
        itemsPerPage,
        filters,
        isSearchMode
      );
      if (!paginationValidation.isValid || paginationValidation.warnings.length > 0) {
        logConsistencyIssues(paginationValidation, "페이지네이션 총 개수 검증");
      }
    }
    
    // 총 페이지 수 계산
    const totalPages = Math.ceil(finalTotalCount / itemsPerPage);
    
    // 잘못된 페이지 번호 처리 (존재하지 않는 페이지로 이동한 경우)
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages;
    }

    return (
      <TourMapView
        tours={filteredItems}
        totalCount={finalTotalCount}
        searchKeyword={filters.keyword}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
      />
    );
  } catch (error) {
    // 에러 로깅 (개발 환경에서만 상세 로그)
    if (process.env.NODE_ENV === "development") {
      console.error("[HomePage] Failed to fetch tour list:", error);
    } else {
      // 프로덕션에서는 최소한의 로그만
      console.error("[HomePage] Failed to fetch tour list");
    }

    // 에러 타입별 처리
    let errorMessage = "관광지 목록을 불러오는 중 오류가 발생했습니다.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return (
      <TourMapView
        tours={[]}
        error={
          error instanceof Error
            ? error
            : new Error(errorMessage)
        }
        onRetry={() => {
          // 재시도를 위해 페이지 새로고침
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }}
      />
    );
  }
}

/**
 * 홈페이지 컴포넌트
 */
export default function HomePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-6">
        {/* 필터 영역 */}
        <section className="mb-4 sm:mb-6">
          <TourFilters />
        </section>

        {/* 메인 콘텐츠 영역 */}
        <Suspense
          fallback={
            <TourMapView tours={[]} loading />
          }
        >
          <TourListData searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
