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
import { measureAPICall } from "@/lib/utils/api-metrics";
import {
  validateTourItemsQuality,
  validateTourDetailQuality,
  logDataQualityIssues,
  calculateDataQualityStats,
} from "@/lib/utils/data-quality";
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
 * 한국관광공사 API Rate Limit 정보
 *
 * 공공 API는 일반적으로 다음과 같은 제한이 있습니다:
 * - 일일 조회 한도: API 키별로 다름 (일반적으로 1,000 ~ 10,000건/일)
 * - 동시 요청 제한: 없음 (단, 과도한 요청 시 일시적으로 차단될 수 있음)
 * - 응답 시간: 평균 1-3초 (네트워크 상태에 따라 다름)
 *
 * 참고: 정확한 Rate Limit은 API 키 발급 시 제공되는 문서를 확인하세요.
 * 에러 코드 "04"는 일일 조회 한도 초과를 의미합니다.
 */

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
 * @param timeout - 타임아웃 시간 (밀리초, 기본값: TIMEOUT)
 * @returns API 응답 데이터
 * @throws {Error} API 호출 실패 시
 */
async function fetchTourAPI<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {},
  retries: number = MAX_RETRIES,
  timeout: number = TIMEOUT
): Promise<T> {
  // 성능 측정 래퍼
  return measureAPICall(endpoint, async () => {
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
      const response = await fetchWithTimeout(url, {}, timeout);

      if (!response.ok) {
        // HTTP 상태 코드별 에러 메시지
        let errorMessage = "API 요청에 실패했습니다.";
        if (response.status === 400) {
          errorMessage = "잘못된 요청입니다. 파라미터를 확인해주세요.";
        } else if (response.status === 401) {
          errorMessage = "인증에 실패했습니다. API 키를 확인해주세요.";
        } else if (response.status === 403) {
          errorMessage = "접근이 거부되었습니다.";
        } else if (response.status === 404) {
          errorMessage = "요청한 리소스를 찾을 수 없습니다.";
        } else if (response.status >= 500) {
          errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        } else if (response.status === 0 || error instanceof TypeError) {
          errorMessage = "네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.";
        }
        throw new Error(errorMessage);
      }

      const data: APIResponse<T> = await response.json();

      // API 응답 에러 코드 확인
      if (data.response.header.resultCode !== "0000") {
        // API 에러 코드별 메시지
        let errorMessage = data.response.header.resultMsg || "API 오류가 발생했습니다.";
        const resultCode = data.response.header.resultCode;
        
        // 일반적인 에러 코드 처리
        if (resultCode === "01") {
          errorMessage = "필수 파라미터가 누락되었습니다.";
        } else if (resultCode === "02") {
          errorMessage = "잘못된 파라미터 값입니다.";
        } else if (resultCode === "03") {
          errorMessage = "서비스 접근 거부되었습니다.";
        } else if (resultCode === "04") {
          errorMessage = "일일 조회 한도를 초과했습니다.";
        } else if (resultCode === "05") {
          errorMessage = "서비스 점검 중입니다.";
        }
        
        throw new Error(errorMessage);
      }

      return data as unknown as T;
    } catch (error) {
      // 타임아웃 에러 처리 (AbortError)
      const isAbortError = error instanceof Error && error.name === "AbortError";
      if (isAbortError) {
        // 마지막 시도가 아니면 재시도
        if (attempt < retries) {
          const delayMs = RETRY_DELAY * Math.pow(2, attempt);
          await delay(delayMs);
          continue; // 재시도
        } else {
          // 마지막 시도에서도 실패하면 타임아웃 에러로 변환하여 throw
          const timeoutError = new Error("요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.");
          timeoutError.name = "TimeoutError";
          if (process.env.NODE_ENV === "development") {
            console.error(`[Tour API] Timeout after ${attempt + 1} attempts:`, {
              endpoint,
              params,
            });
          }
          throw timeoutError;
        }
      }
      
      // 네트워크 에러는 재시도
      const isNetworkError = error instanceof TypeError || 
                            (error instanceof Error && error.message.includes("네트워크"));
      
      // 마지막 시도이거나 재시도 불가능한 에러인 경우
      if (attempt === retries || (!isNetworkError && error instanceof Error && !error.message.includes("네트워크"))) {
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
  });
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
 * @param params.timeout - 타임아웃 시간 (밀리초, 선택)
 * @returns 관광지 목록 및 총 개수
 */
export async function getAreaBasedList(params: {
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
  timeout?: number;
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

  const data = await fetchTourAPI<TourItem>("/areaBasedList2", queryParams, MAX_RETRIES, params.timeout);
  const items = extractItems(data);
  const totalCount =
    data.response.body.totalCount ?? 0;

  // 데이터 품질 검증 (개발 환경)
  if (process.env.NODE_ENV === "development" && items.length > 0) {
    const issues = validateTourItemsQuality(items);
    if (issues.length > 0) {
      logDataQualityIssues(issues);
      const stats = calculateDataQualityStats(items);
      console.log(`[Data Quality] Quality score: ${stats.qualityScore}/100`);
    }
  }

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

  // 데이터 품질 검증 (개발 환경)
  if (process.env.NODE_ENV === "development" && items.length > 0) {
    const issues = validateTourItemsQuality(items);
    if (issues.length > 0) {
      logDataQualityIssues(issues);
      const stats = calculateDataQualityStats(items);
      console.log(`[Data Quality] Quality score: ${stats.qualityScore}/100`);
    }
  }

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

  const detail = items[0];

  // 데이터 품질 검증 (개발 환경)
  if (process.env.NODE_ENV === "development") {
    const issues = validateTourDetailQuality(detail);
    if (issues.length > 0) {
      logDataQualityIssues(issues);
    }
  }

  return detail;
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

