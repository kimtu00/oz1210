/**
 * @file tour-api.ts
 * @description 한국관광공사 공공 API 클라이언트
 *
 * 한국관광공사 공공 API (KorService2)를 호출하는 함수들을 제공합니다.
 * Base URL: https://apis.data.go.kr/B551011/KorService2
 *
 * @see https://www.data.go.kr/data/15101578/openapi.do
 */

import { getTourApiKey } from "@/lib/utils/env";
import type {
  AreaCode,
  PetTourInfo,
  TourDetail,
  TourImage,
  TourIntro,
  TourItem,
} from "@/lib/types/tour";

const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1초
const TIMEOUT = 10000; // 10초

/**
 * API 응답 헤더 구조
 */
interface APIResponseHeader {
  resultCode: string;
  resultMsg: string;
}

/**
 * API 응답 구조 (공통)
 */
interface APIResponse<T> {
  response: {
    header: APIResponseHeader;
    body: {
      items?: {
        item: T | T[];
      };
      numOfRows?: number;
      pageNo?: number;
      totalCount?: number;
    };
  };
}

/**
 * 지연 함수 (재시도 로직용)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 타임아웃을 포함한 fetch 함수
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * 한국관광공사 API를 호출하는 공통 함수
 *
 * @param endpoint - API 엔드포인트 (예: '/areaCode2')
 * @param params - 쿼리 파라미터
 * @param retries - 재시도 횟수 (기본값: MAX_RETRIES)
 * @returns API 응답 데이터
 * @throws {Error} API 호출 실패 시
 */
async function fetchTourAPI<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {},
  retries: number = MAX_RETRIES
): Promise<T> {
  const serviceKey = getTourApiKey();

  // 공통 파라미터
  const queryParams = new URLSearchParams({
    serviceKey,
    MobileOS: "ETC",
    MobileApp: "MyTrip",
    _type: "json",
  });

  // 추가 파라미터 추가 (undefined 제외)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  const url = `${BASE_URL}${endpoint}?${queryParams.toString()}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data: APIResponse<T> = await response.json();

      // API 응답 에러 코드 확인
      if (data.response.header.resultCode !== "0000") {
        throw new Error(
          `API error: ${data.response.header.resultCode} - ${data.response.header.resultMsg}`
        );
      }

      return data as unknown as T;
    } catch (error) {
      // 마지막 시도이거나 재시도 불가능한 에러인 경우
      if (attempt === retries || error instanceof TypeError) {
        if (process.env.NODE_ENV === "development") {
          console.error(`[Tour API] Failed after ${attempt + 1} attempts:`, {
            endpoint,
            params,
            error,
          });
        }
        throw error;
      }

      // Exponential backoff: 1초, 2초, 4초...
      const delayMs = RETRY_DELAY * Math.pow(2, attempt);
      await delay(delayMs);
    }
  }

  throw new Error("Unexpected error in fetchTourAPI");
}

/**
 * API 응답에서 items 추출 및 정규화
 */
function extractItems<T>(data: APIResponse<T>): T[] {
  const items = data.response.body.items?.item;
  if (!items) {
    return [];
  }
  // 단일 항목인 경우 배열로 변환
  return Array.isArray(items) ? items : [items];
}

/**
 * 지역코드 조회
 *
 * @param areaCode - 시/도 코드 (없으면 전체 조회)
 * @returns 지역코드 목록
 */
export async function getAreaCode(
  areaCode?: string
): Promise<AreaCode[]> {
  const params: Record<string, string | undefined> = {};
  if (areaCode) {
    params.areaCode = areaCode;
  }

  const data = await fetchTourAPI<AreaCode>("/areaCode2", params);
  return extractItems(data);
}

/**
 * 지역 기반 관광지 목록 조회
 *
 * @param params - 조회 파라미터
 * @param params.areaCode - 지역코드 (선택)
 * @param params.contentTypeId - 콘텐츠타입ID (선택)
 * @param params.numOfRows - 페이지당 항목 수 (기본값: 10)
 * @param params.pageNo - 페이지 번호 (기본값: 1)
 * @returns 관광지 목록 및 총 개수
 */
export async function getAreaBasedList(params: {
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
}): Promise<{ items: TourItem[]; totalCount: number }> {
  const queryParams: Record<string, string | number> = {
    numOfRows: params.numOfRows || 10,
    pageNo: params.pageNo || 1,
  };

  if (params.areaCode) {
    queryParams.areaCode = params.areaCode;
  }
  if (params.contentTypeId) {
    queryParams.contentTypeId = params.contentTypeId;
  }

  const data = await fetchTourAPI<TourItem>("/areaBasedList2", queryParams);
  const items = extractItems(data);
  const totalCount =
    data.response.body.totalCount ?? 0;

  return { items, totalCount };
}

/**
 * 키워드 검색
 *
 * @param params - 검색 파라미터
 * @param params.keyword - 검색 키워드 (필수)
 * @param params.areaCode - 지역코드 (선택)
 * @param params.contentTypeId - 콘텐츠타입ID (선택)
 * @param params.numOfRows - 페이지당 항목 수 (기본값: 10)
 * @param params.pageNo - 페이지 번호 (기본값: 1)
 * @returns 검색 결과 목록 및 총 개수
 */
export async function searchKeyword(params: {
  keyword: string;
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
}): Promise<{ items: TourItem[]; totalCount: number }> {
  if (!params.keyword || params.keyword.trim() === "") {
    throw new Error("Keyword is required");
  }

  const queryParams: Record<string, string | number> = {
    keyword: params.keyword.trim(),
    numOfRows: params.numOfRows || 10,
    pageNo: params.pageNo || 1,
  };

  if (params.areaCode) {
    queryParams.areaCode = params.areaCode;
  }
  if (params.contentTypeId) {
    queryParams.contentTypeId = params.contentTypeId;
  }

  const data = await fetchTourAPI<TourItem>("/searchKeyword2", queryParams);
  const items = extractItems(data);
  const totalCount = data.response.body.totalCount ?? 0;

  return { items, totalCount };
}

/**
 * 관광지 공통 정보 조회
 *
 * @param contentId - 콘텐츠ID (필수)
 * @returns 관광지 상세 정보
 */
export async function getDetailCommon(
  contentId: string
): Promise<TourDetail> {
  if (!contentId) {
    throw new Error("ContentId is required");
  }

  const data = await fetchTourAPI<TourDetail>("/detailCommon2", {
    contentId,
  });
  const items = extractItems(data);

  if (items.length === 0) {
    throw new Error(`Tour detail not found for contentId: ${contentId}`);
  }

  return items[0];
}

/**
 * 관광지 소개 정보 조회
 *
 * @param contentId - 콘텐츠ID (필수)
 * @param contentTypeId - 콘텐츠타입ID (필수)
 * @returns 관광지 운영 정보
 */
export async function getDetailIntro(
  contentId: string,
  contentTypeId: string
): Promise<TourIntro> {
  if (!contentId) {
    throw new Error("ContentId is required");
  }
  if (!contentTypeId) {
    throw new Error("ContentTypeId is required");
  }

  const data = await fetchTourAPI<TourIntro>("/detailIntro2", {
    contentId,
    contentTypeId,
  });
  const items = extractItems(data);

  if (items.length === 0) {
    throw new Error(
      `Tour intro not found for contentId: ${contentId}, contentTypeId: ${contentTypeId}`
    );
  }

  return items[0];
}

/**
 * 관광지 이미지 목록 조회
 *
 * @param params - 조회 파라미터
 * @param params.contentId - 콘텐츠ID (필수)
 * @param params.numOfRows - 페이지당 항목 수 (기본값: 10)
 * @param params.pageNo - 페이지 번호 (기본값: 1)
 * @returns 이미지 목록
 */
export async function getDetailImage(params: {
  contentId: string;
  numOfRows?: number;
  pageNo?: number;
}): Promise<TourImage[]> {
  if (!params.contentId) {
    throw new Error("ContentId is required");
  }

  const queryParams: Record<string, string | number> = {
    contentId: params.contentId,
    numOfRows: params.numOfRows || 10,
    pageNo: params.pageNo || 1,
  };

  const data = await fetchTourAPI<TourImage>("/detailImage2", queryParams);
  return extractItems(data);
}

/**
 * 반려동물 동반 여행 정보 조회
 *
 * @param contentId - 콘텐츠ID (필수)
 * @returns 반려동물 정보 (없으면 null)
 */
export async function getDetailPetTour(
  contentId: string
): Promise<PetTourInfo | null> {
  if (!contentId) {
    throw new Error("ContentId is required");
  }

  try {
    const data = await fetchTourAPI<PetTourInfo>("/detailPetTour2", {
      contentId,
    });
    const items = extractItems(data);

    if (items.length === 0) {
      return null;
    }

    return items[0];
  } catch (error) {
    // 반려동물 정보가 없는 경우 null 반환 (에러가 아닌 정상 케이스)
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[Tour API] Pet tour info not found for contentId: ${contentId}`,
        error
      );
    }
    return null;
  }
}

