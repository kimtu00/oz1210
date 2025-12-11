/**
 * @file data-consistency.ts
 * @description 데이터 일관성 검증 유틸리티
 *
 * 검색 모드와 일반 목록 모드 간의 데이터 일관성,
 * 필터 조합 정확성, 페이지네이션 총 개수 계산 정확성을 검증합니다.
 */

import type { TourItem } from "@/lib/types/tour";
import type { FilterParams } from "./filter";

/**
 * 데이터 일관성 검증 결과
 */
export interface ConsistencyCheckResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
}

/**
 * 검색 모드와 일반 목록 모드 간 데이터 일관성 검증
 *
 * @param searchItems - 검색 모드에서 가져온 항목들
 * @param listItems - 일반 목록 모드에서 가져온 항목들
 * @param filters - 적용된 필터
 * @returns 검증 결과
 */
export function validateSearchListConsistency(
  searchItems: TourItem[],
  listItems: TourItem[],
  filters: FilterParams
): ConsistencyCheckResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // 검색 모드와 일반 목록 모드가 동시에 사용되는 경우는 없으므로
  // 이 검증은 주로 필터 적용 후 데이터 일관성을 확인하는 용도

  // 필터가 적용된 경우, 검색 결과와 필터링된 목록이 일관성 있는지 확인
  if (filters.keyword && searchItems.length > 0) {
    // 검색 모드: API에서 이미 필터링된 결과를 받음
    // 추가 필터링이 필요한 경우 클라이언트 사이드에서 처리
    if (filters.contentTypeId && filters.contentTypeId.length > 0) {
      // 관광 타입 필터가 적용된 경우
      const filteredByType = searchItems.filter((item) =>
        filters.contentTypeId!.includes(item.contenttypeid)
      );
      if (filteredByType.length !== searchItems.length) {
        warnings.push(
          `검색 결과 중 ${searchItems.length - filteredByType.length}개 항목이 관광 타입 필터와 일치하지 않습니다.`
        );
      }
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
}

/**
 * 필터 조합 시 클라이언트 사이드 필터링 정확성 검증
 *
 * @param items - 필터링 전 항목 목록
 * @param filteredItems - 필터링 후 항목 목록
 * @param filters - 적용된 필터
 * @returns 검증 결과
 */
export function validateFilterAccuracy(
  items: TourItem[],
  filteredItems: TourItem[],
  filters: FilterParams
): ConsistencyCheckResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // 관광 타입 필터 검증
  if (filters.contentTypeId && filters.contentTypeId.length > 0) {
    const invalidItems = filteredItems.filter(
      (item) => !filters.contentTypeId!.includes(item.contenttypeid)
    );
    if (invalidItems.length > 0) {
      issues.push(
        `필터링된 항목 중 ${invalidItems.length}개가 선택된 관광 타입과 일치하지 않습니다.`
      );
    }

    // 필터링되지 않은 항목 중 필터 조건을 만족하는 항목이 있는지 확인
    const shouldBeIncluded = items.filter((item) =>
      filters.contentTypeId!.includes(item.contenttypeid)
    );
    const missingItems = shouldBeIncluded.filter(
      (item) => !filteredItems.find((f) => f.contentid === item.contentid)
    );
    if (missingItems.length > 0) {
      issues.push(
        `필터 조건을 만족하지만 필터링된 목록에 포함되지 않은 항목이 ${missingItems.length}개 있습니다.`
      );
    }
  }

  // 지역 필터는 API에서 처리되므로 클라이언트 사이드 검증 불필요
  // (API 응답 자체가 이미 필터링된 결과)

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
}

/**
 * 페이지네이션 총 개수 계산 정확성 검증
 *
 * @param totalCount - API에서 받은 총 개수
 * @param filteredItems - 필터링된 항목 목록
 * @param currentPage - 현재 페이지 번호
 * @param itemsPerPage - 페이지당 항목 수
 * @param filters - 적용된 필터
 * @param isSearchMode - 검색 모드 여부
 * @returns 검증 결과
 */
export function validatePaginationCount(
  totalCount: number,
  filteredItems: number,
  currentPage: number,
  itemsPerPage: number,
  filters: FilterParams,
  isSearchMode: boolean
): ConsistencyCheckResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // 검색 모드: API totalCount 사용
  // 일반 목록 모드: 클라이언트 사이드 필터링 후 개수 사용
  const expectedTotalCount = isSearchMode ? totalCount : filteredItems;

  // 페이지 범위 계산
  const expectedPages = Math.ceil(expectedTotalCount / itemsPerPage);
  const currentPageRange = {
    start: (currentPage - 1) * itemsPerPage + 1,
    end: Math.min(currentPage * itemsPerPage, expectedTotalCount),
  };

  // 총 개수가 음수인 경우
  if (expectedTotalCount < 0) {
    issues.push("총 개수가 음수입니다.");
  }

  // 현재 페이지가 총 페이지 수를 초과하는 경우
  if (currentPage > expectedPages && expectedPages > 0) {
    issues.push(
      `현재 페이지(${currentPage})가 총 페이지 수(${expectedPages})를 초과합니다.`
    );
  }

  // 페이지 범위가 총 개수를 초과하는 경우
  if (currentPageRange.end > expectedTotalCount) {
    issues.push(
      `페이지 범위(${currentPageRange.start}-${currentPageRange.end})가 총 개수(${expectedTotalCount})를 초과합니다.`
    );
  }

  // 검색 모드에서 필터가 적용된 경우 경고
  if (isSearchMode && filters.contentTypeId && filters.contentTypeId.length > 0) {
    warnings.push(
      "검색 모드에서 관광 타입 필터가 적용되면 클라이언트 사이드 필터링이 필요합니다."
    );
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
}

/**
 * 개발 환경에서 데이터 일관성 이슈 로깅
 */
export function logConsistencyIssues(result: ConsistencyCheckResult, context: string) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  if (result.issues.length === 0 && result.warnings.length === 0) {
    return;
  }

  console.group(`[Data Consistency] ${context}`);
  if (result.issues.length > 0) {
    result.issues.forEach((issue) => {
      console.error(`🔴 ${issue}`);
    });
  }
  if (result.warnings.length > 0) {
    result.warnings.forEach((warning) => {
      console.warn(`🟡 ${warning}`);
    });
  }
  console.groupEnd();
}


