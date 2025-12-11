/**
 * @file filter.ts
 * @description 필터 관련 유틸리티 함수
 *
 * URL 쿼리 파라미터와 필터 상태를 관리하는 헬퍼 함수들을 제공합니다.
 */

/**
 * 필터 파라미터 타입
 */
export interface FilterParams {
  keyword?: string;
  areaCode?: string;
  contentTypeId?: string | string[];
  petFriendly?: boolean;
  petSize?: "small" | "medium" | "large";
  sort?: "latest" | "name";
  page?: number;
}

/**
 * URL 쿼리 파라미터에서 필터 파라미터를 추출합니다.
 *
 * @param searchParams - Next.js searchParams 객체
 * @returns 필터 파라미터 객체
 */
export function parseFilterParams(
  searchParams: { [key: string]: string | string[] | undefined }
): FilterParams {
  const keyword = searchParams.keyword as string | undefined;
  const areaCode = searchParams.areaCode as string | undefined;
  const contentTypeId = searchParams.contentTypeId as string | string[] | undefined;
  const petFriendly = searchParams.petFriendly === "true";
  const petSize = searchParams.petSize as "small" | "medium" | "large" | undefined;
  const sort = (searchParams.sort as "latest" | "name" | undefined) || "latest";
  
  // 페이지 번호 파싱 (1 이상의 정수만 허용)
  const pageParam = searchParams.page as string | undefined;
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) || undefined : undefined;

  return {
    keyword,
    areaCode,
    contentTypeId: Array.isArray(contentTypeId)
      ? contentTypeId
      : contentTypeId
      ? contentTypeId.split(",")
      : undefined,
    petFriendly: petFriendly || undefined,
    petSize,
    sort,
    page,
  };
}

/**
 * 필터 파라미터를 URL 쿼리 문자열로 변환합니다.
 *
 * @param params - 필터 파라미터 객체
 * @returns URL 쿼리 문자열 (앞의 ? 제외)
 */
export function buildFilterQuery(params: Partial<FilterParams>): string {
  const queryParams = new URLSearchParams();

  if (params.keyword) {
    queryParams.set("keyword", params.keyword);
  }

  if (params.areaCode) {
    queryParams.set("areaCode", params.areaCode);
  }

  if (params.contentTypeId) {
    const ids = Array.isArray(params.contentTypeId)
      ? params.contentTypeId
      : [params.contentTypeId];
    queryParams.set("contentTypeId", ids.join(","));
  }

  if (params.petFriendly) {
    queryParams.set("petFriendly", "true");
  }

  if (params.petSize) {
    queryParams.set("petSize", params.petSize);
  }

  if (params.sort && params.sort !== "latest") {
    queryParams.set("sort", params.sort);
  }

  // 페이지 번호 추가 (1보다 큰 경우만)
  if (params.page && params.page > 1) {
    queryParams.set("page", String(params.page));
  }

  return queryParams.toString();
}

/**
 * 필터 파라미터를 업데이트한 새로운 쿼리 문자열을 생성합니다.
 *
 * @param currentParams - 현재 필터 파라미터
 * @param updates - 업데이트할 필터 파라미터
 * @returns 업데이트된 URL 쿼리 문자열
 */
export function updateFilterQuery(
  currentParams: FilterParams,
  updates: Partial<FilterParams>
): string {
  const merged = { ...currentParams, ...updates };
  return buildFilterQuery(merged);
}

