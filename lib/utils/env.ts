/**
 * @file env.ts
 * @description 환경변수 검증 유틸리티
 *
 * 필수 환경변수의 존재 여부를 검증하고 안전하게 가져오는 함수들을 제공합니다.
 */

/**
 * 환경변수 검증 결과 타입
 */
export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

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

/**
 * Clerk 환경변수 검증
 *
 * @returns 검증 결과
 */
export function validateClerkEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // 필수 환경변수
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    missing.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }
  if (!process.env.CLERK_SECRET_KEY) {
    missing.push("CLERK_SECRET_KEY");
  }

  // 선택적 환경변수 (기본값이 있지만 명시적으로 설정하는 것을 권장)
  if (!process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL) {
    warnings.push("NEXT_PUBLIC_CLERK_SIGN_IN_URL (기본값: /sign-in)");
  }
  if (!process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL) {
    warnings.push("NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL (기본값: /)");
  }
  if (!process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL) {
    warnings.push("NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL (기본값: /)");
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Supabase 환경변수 검증
 *
 * @returns 검증 결과
 */
export function validateSupabaseEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // 필수 환경변수
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  } else {
    // URL 형식 검증
    try {
      new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    } catch {
      warnings.push("NEXT_PUBLIC_SUPABASE_URL 형식이 올바르지 않습니다 (URL 형식이어야 함)");
    }
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }

  // 선택적 환경변수
  if (!process.env.NEXT_PUBLIC_STORAGE_BUCKET) {
    warnings.push("NEXT_PUBLIC_STORAGE_BUCKET (기본값: uploads)");
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * 한국관광공사 API 환경변수 검증
 *
 * @returns 검증 결과
 */
export function validateTourApiEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY 중 하나는 필수
  if (!process.env.TOUR_API_KEY && !process.env.NEXT_PUBLIC_TOUR_API_KEY) {
    missing.push("TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY (둘 중 하나는 필수)");
  }

  // 둘 다 설정된 경우 경고
  if (process.env.TOUR_API_KEY && process.env.NEXT_PUBLIC_TOUR_API_KEY) {
    warnings.push("TOUR_API_KEY와 NEXT_PUBLIC_TOUR_API_KEY가 모두 설정되어 있습니다. 서버 사이드에서는 TOUR_API_KEY를 우선 사용합니다.");
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * 네이버 지도 API 환경변수 검증
 *
 * @returns 검증 결과
 */
export function validateNaverMapEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID) {
    missing.push("NEXT_PUBLIC_NAVER_MAP_CLIENT_ID");
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * 모든 환경변수 통합 검증
 *
 * @returns 검증 결과
 */
export function validateAllEnvVars(): EnvValidationResult {
  const clerkResult = validateClerkEnv();
  const supabaseResult = validateSupabaseEnv();
  const tourApiResult = validateTourApiEnv();
  const naverMapResult = validateNaverMapEnv();

  const allMissing = [
    ...clerkResult.missing,
    ...supabaseResult.missing,
    ...tourApiResult.missing,
    ...naverMapResult.missing,
  ];

  const allWarnings = [
    ...clerkResult.warnings,
    ...supabaseResult.warnings,
    ...tourApiResult.warnings,
    ...naverMapResult.warnings,
  ];

  return {
    valid: allMissing.length === 0,
    missing: allMissing,
    warnings: allWarnings,
  };
}

