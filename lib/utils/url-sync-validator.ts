/**
 * @file url-sync-validator.ts
 * @description URL 파라미터 동기화 검증 유틸리티
 *
 * 필터 변경 시 URL 업데이트, 브라우저 히스토리 동작,
 * 잘못된 파라미터 처리 등을 검증합니다.
 */

import type { FilterParams } from "./filter";

/**
 * URL 동기화 검증 결과
 */
export interface URLSyncValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
}

/**
 * 잘못된 URL 파라미터 검증
 *
 * @param searchParams - URL searchParams 객체
 * @returns 검증 결과
 */
export function validateURLParams(
  searchParams: { [key: string]: string | string[] | undefined }
): URLSyncValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // 페이지 번호 검증
  const pageParam = searchParams.page;
  if (pageParam) {
    const page = typeof pageParam === "string" ? parseInt(pageParam, 10) : NaN;
    if (isNaN(page)) {
      issues.push(`페이지 번호가 숫자가 아닙니다: ${pageParam}`);
    } else if (page < 1) {
      issues.push(`페이지 번호가 1보다 작습니다: ${page}`);
    } else if (page > 1000) {
      warnings.push(`페이지 번호가 매우 큽니다: ${page} (일반적으로 1000을 초과하지 않음)`);
    }
  }

  // 지역 코드 검증
  const areaCode = searchParams.areaCode;
  if (areaCode && typeof areaCode === "string") {
    const code = parseInt(areaCode, 10);
    if (isNaN(code)) {
      issues.push(`지역 코드가 숫자가 아닙니다: ${areaCode}`);
    } else if (code < 1 || code > 50) {
      warnings.push(`지역 코드가 일반적인 범위를 벗어났습니다: ${areaCode}`);
    }
  }

  // 관광 타입 ID 검증
  const contentTypeId = searchParams.contentTypeId;
  if (contentTypeId) {
    const ids = Array.isArray(contentTypeId) ? contentTypeId : contentTypeId.split(",");
    const validTypeIds = ["12", "14", "15", "25", "28", "32", "38", "39"];
    ids.forEach((id) => {
      if (!validTypeIds.includes(id)) {
        warnings.push(`알 수 없는 관광 타입 ID: ${id}`);
      }
    });
  }

  // 검색 키워드 검증
  const keyword = searchParams.keyword;
  if (keyword && typeof keyword === "string") {
    if (keyword.trim().length === 0) {
      warnings.push("검색 키워드가 공백만 포함하고 있습니다.");
    } else if (keyword.length > 100) {
      warnings.push(`검색 키워드가 매우 깁니다: ${keyword.length}자`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
}

/**
 * 필터 파라미터와 URL 파라미터 동기화 검증
 *
 * @param filters - 현재 필터 파라미터
 * @param searchParams - URL searchParams
 * @returns 검증 결과
 */
export function validateFilterURLSync(
  filters: FilterParams,
  searchParams: { [key: string]: string | string[] | undefined }
): URLSyncValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // 지역 코드 동기화 확인
  if (filters.areaCode) {
    const urlAreaCode = searchParams.areaCode;
    if (!urlAreaCode || urlAreaCode !== filters.areaCode) {
      issues.push(
        `지역 코드가 URL과 동기화되지 않았습니다. 필터: ${filters.areaCode}, URL: ${urlAreaCode}`
      );
    }
  } else {
    // 필터에 지역 코드가 없으면 URL에도 없어야 함
    if (searchParams.areaCode) {
      warnings.push("필터에는 지역 코드가 없지만 URL에는 있습니다.");
    }
  }

  // 관광 타입 동기화 확인
  if (filters.contentTypeId && filters.contentTypeId.length > 0) {
    const urlContentTypeId = searchParams.contentTypeId;
    if (!urlContentTypeId) {
      issues.push("관광 타입 필터가 URL에 반영되지 않았습니다.");
    } else {
      const urlIds = Array.isArray(urlContentTypeId)
        ? urlContentTypeId
        : urlContentTypeId.split(",");
      const filterIds = filters.contentTypeId;
      if (urlIds.length !== filterIds.length) {
        issues.push(
          `관광 타입 개수가 일치하지 않습니다. 필터: ${filterIds.length}, URL: ${urlIds.length}`
        );
      } else {
        const missingInUrl = filterIds.filter((id) => !urlIds.includes(id));
        if (missingInUrl.length > 0) {
          issues.push(`URL에 없는 관광 타입: ${missingInUrl.join(", ")}`);
        }
      }
    }
  } else {
    // 필터에 관광 타입이 없으면 URL에도 없어야 함
    if (searchParams.contentTypeId) {
      warnings.push("필터에는 관광 타입이 없지만 URL에는 있습니다.");
    }
  }

  // 검색 키워드 동기화 확인
  if (filters.keyword) {
    const urlKeyword = searchParams.keyword;
    if (!urlKeyword || urlKeyword !== filters.keyword) {
      issues.push(
        `검색 키워드가 URL과 동기화되지 않았습니다. 필터: ${filters.keyword}, URL: ${urlKeyword}`
      );
    }
  } else {
    if (searchParams.keyword) {
      warnings.push("필터에는 검색 키워드가 없지만 URL에는 있습니다.");
    }
  }

  // 페이지 번호 동기화 확인
  if (filters.page && filters.page > 1) {
    const urlPage = searchParams.page;
    const urlPageNum = typeof urlPage === "string" ? parseInt(urlPage, 10) : undefined;
    if (!urlPageNum || urlPageNum !== filters.page) {
      issues.push(
        `페이지 번호가 URL과 동기화되지 않았습니다. 필터: ${filters.page}, URL: ${urlPageNum}`
      );
    }
  } else {
    // 페이지가 1이거나 없으면 URL에도 없어야 함 (또는 1)
    const urlPage = searchParams.page;
    if (urlPage && urlPage !== "1") {
      warnings.push("필터에는 페이지가 1이지만 URL에는 다른 값이 있습니다.");
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
}

/**
 * 개발 환경에서 URL 동기화 이슈 로깅
 */
export function logURLSyncIssues(
  result: URLSyncValidationResult,
  context: string
) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  if (result.issues.length === 0 && result.warnings.length === 0) {
    return;
  }

  console.group(`[URL Sync Validation] ${context}`);
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


