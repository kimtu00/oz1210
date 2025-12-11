/**
 * @file tour-pagination.tsx
 * @description 관광지 목록 페이지네이션 컴포넌트
 *
 * 페이지 번호 선택 방식의 페이지네이션을 제공합니다.
 *
 * 주요 기능:
 * - 페이지 번호 버튼 표시
 * - 이전/다음 버튼
 * - 현재 페이지 하이라이트
 * - 반응형 디자인 (모바일/데스크톱)
 * - URL 쿼리 파라미터로 페이지 변경
 *
 * @dependencies
 * - components/ui/button: Button 컴포넌트
 * - next/navigation: useRouter, useSearchParams
 * - lucide-react: ChevronLeft, ChevronRight 아이콘
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { cn } from "@/lib/utils";
import { buildFilterQuery, parseFilterParams } from "@/lib/utils/filter";

interface TourPaginationProps {
  /**
   * 현재 페이지 번호
   */
  currentPage: number;
  /**
   * 총 페이지 수
   */
  totalPages: number;
  /**
   * 총 항목 수
   */
  totalCount: number;
  /**
   * 페이지당 항목 수
   */
  itemsPerPage: number;
}

/**
 * 페이지 번호 범위 계산 함수
 * 현재 페이지 주변의 페이지 번호들을 계산합니다.
 *
 * @param currentPage - 현재 페이지
 * @param totalPages - 총 페이지 수
 * @param maxVisible - 최대 표시할 페이지 번호 수 (기본값: 5)
 * @returns 표시할 페이지 번호 배열
 */
function getPageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + maxVisible - 1);

  // 끝에 가까우면 시작점 조정
  if (end === totalPages) {
    start = Math.max(1, totalPages - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * 관광지 목록 페이지네이션 컴포넌트
 */
export function TourPagination({
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage,
}: TourPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  // 페이지가 1개 이하이면 표시하지 않음
  if (totalPages <= 1) {
    return null;
  }

  // 현재 필터 파라미터 파싱
  const currentFilters = parseFilterParams(
    Object.fromEntries(searchParams.entries())
  );

  /**
   * 페이지 변경 핸들러
   */
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage || isNavigating) {
      return;
    }

    setIsNavigating(true);

    // 필터 파라미터에 새 페이지 번호 추가
    const newFilters = { ...currentFilters, page };
    const queryString = buildFilterQuery(newFilters);

    // URL 업데이트
    const newUrl = queryString ? `/?${queryString}` : "/";
    router.push(newUrl);

    // 로딩 상태는 Suspense가 처리하므로 짧은 지연 후 리셋
    setTimeout(() => setIsNavigating(false), 100);
  };

  // 표시할 페이지 번호 계산
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  // 현재 페이지 범위 계산 (예: "1-15개 표시")
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="space-y-4">
      {/* 총 개수 및 현재 범위 표시 */}
      <div className="text-center text-sm text-muted-foreground">
        총 <span className="font-medium text-foreground">{totalCount}</span>개 중{" "}
        <span className="font-medium text-foreground">
          {startItem}-{endItem}
        </span>
        개 표시
      </div>

      {/* 페이지네이션 버튼 */}
      <div className="flex items-center justify-center gap-1">
        {/* 이전 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isNavigating}
          aria-label="이전 페이지"
          className="min-h-[44px] min-w-[44px]"
        >
          {isNavigating ? (
            <Loading size="sm" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">이전</span>
            </>
          )}
        </Button>

        {/* 페이지 번호 버튼 (데스크톱) */}
        <div className="hidden md:flex items-center gap-1">
          {/* 첫 페이지 */}
          {pageNumbers[0] > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                className="min-w-[2.5rem] min-h-[44px]"
                aria-label="1페이지로 이동"
              >
                1
              </Button>
              {pageNumbers[0] > 2 && (
                <span className="px-2 text-muted-foreground">...</span>
              )}
            </>
          )}

          {/* 페이지 번호들 */}
          {pageNumbers.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
              disabled={isNavigating}
              className={cn(
                "min-w-[2.5rem] min-h-[44px]",
                page === currentPage && "font-semibold"
              )}
              aria-label={`${page}페이지로 이동`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {isNavigating && page !== currentPage ? (
                <Loading size="sm" />
              ) : (
                page
              )}
            </Button>
          ))}

          {/* 마지막 페이지 */}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="px-2 text-muted-foreground">...</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                className="min-w-[2.5rem] min-h-[44px]"
                aria-label={`${totalPages}페이지로 이동`}
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        {/* 현재 페이지 표시 (모바일) */}
        <div className="md:hidden flex items-center gap-2">
          <span className="text-sm font-medium">
            {currentPage} / {totalPages}
          </span>
        </div>

        {/* 다음 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isNavigating}
          aria-label="다음 페이지"
          className="min-h-[44px] min-w-[44px]"
        >
          {isNavigating ? (
            <Loading size="sm" />
          ) : (
            <>
              <span className="hidden sm:inline">다음</span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

