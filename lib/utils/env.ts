/**
 * @file env.ts
 * @description 환경변수 검증 유틸리티
 *
 * 필수 환경변수의 존재 여부를 검증하고 안전하게 가져오는 함수들을 제공합니다.
 */

/**
 * 한국관광공사 API 키를 가져옵니다.
 * 서버 사이드에서는 TOUR_API_KEY를 우선 사용하고,
 * 클라이언트 사이드에서는 NEXT_PUBLIC_TOUR_API_KEY를 사용합니다.
 *
 * @returns API 키
 * @throws {Error} 환경변수가 설정되지 않은 경우
 */
export function getTourApiKey(): string {
  const key = process.env.TOUR_API_KEY || process.env.NEXT_PUBLIC_TOUR_API_KEY;
  if (!key) {
    throw new Error(
      "TOUR_API_KEY or NEXT_PUBLIC_TOUR_API_KEY is not set. Please check your .env file."
    );
  }
  return key;
}

/**
 * 네이버 지도 API Client ID를 가져옵니다.
 *
 * @returns 네이버 지도 Client ID
 * @throws {Error} 환경변수가 설정되지 않은 경우
 */
export function getNaverMapClientId(): string {
  const id = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  if (!id) {
    throw new Error(
      "NEXT_PUBLIC_NAVER_MAP_CLIENT_ID is not set. Please check your .env file."
    );
  }
  return id;
}

