/**
 * @file api-metrics.ts
 * @description API 성능 측정 및 모니터링 유틸리티
 *
 * 개발 환경에서 API 응답 속도, 사용량 등을 측정하는 도구입니다.
 */

/**
 * API 호출 메트릭 타입
 */
export interface APIMetric {
  endpoint: string;
  timestamp: number;
  duration: number; // ms
  status: "success" | "error";
  errorType?: string;
}

/**
 * API 메트릭 저장소 (개발 환경 전용)
 */
class APIMetricsStore {
  private metrics: APIMetric[] = [];
  private readonly maxMetrics = 100; // 최대 저장 개수

  /**
   * 메트릭 추가
   */
  add(metric: APIMetric) {
    if (process.env.NODE_ENV !== "development") {
      return; // 개발 환경에서만 수집
    }

    this.metrics.push(metric);

    // 최대 개수 초과 시 오래된 항목 제거
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * 모든 메트릭 조회
   */
  getAll(): APIMetric[] {
    return [...this.metrics];
  }

  /**
   * 최근 N개 메트릭 조회
   */
  getRecent(count: number = 10): APIMetric[] {
    return this.metrics.slice(-count);
  }

  /**
   * 평균 응답 시간 계산
   */
  getAverageDuration(endpoint?: string): number {
    const filtered = endpoint
      ? this.metrics.filter((m) => m.endpoint === endpoint)
      : this.metrics;

    if (filtered.length === 0) return 0;

    const total = filtered.reduce((sum, m) => sum + m.duration, 0);
    return total / filtered.length;
  }

  /**
   * 에러율 계산
   */
  getErrorRate(endpoint?: string): number {
    const filtered = endpoint
      ? this.metrics.filter((m) => m.endpoint === endpoint)
      : this.metrics;

    if (filtered.length === 0) return 0;

    const errorCount = filtered.filter((m) => m.status === "error").length;
    return errorCount / filtered.length;
  }

  /**
   * 메트릭 초기화
   */
  clear() {
    this.metrics = [];
  }

  /**
   * 메트릭 요약 로그 출력
   */
  logSummary() {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    if (this.metrics.length === 0) {
      console.log("[API Metrics] No metrics collected yet.");
      return;
    }

    console.group("[API Metrics Summary]");
    console.log(`Total calls: ${this.metrics.length}`);
    console.log(`Average duration: ${this.getAverageDuration().toFixed(2)}ms`);
    console.log(`Error rate: ${(this.getErrorRate() * 100).toFixed(2)}%`);

    // 엔드포인트별 통계
    const endpoints = new Set(this.metrics.map((m) => m.endpoint));
    endpoints.forEach((endpoint) => {
      const endpointMetrics = this.metrics.filter((m) => m.endpoint === endpoint);
      console.log(
        `  ${endpoint}: ${endpointMetrics.length} calls, avg ${this.getAverageDuration(endpoint).toFixed(2)}ms, error rate ${(this.getErrorRate(endpoint) * 100).toFixed(2)}%`
      );
    });

    console.groupEnd();
  }
}

// 싱글톤 인스턴스
export const apiMetricsStore = new APIMetricsStore();

/**
 * API 호출 시간 측정 데코레이터
 *
 * @param endpoint - API 엔드포인트 이름
 * @param fn - 측정할 함수
 * @returns 측정 결과와 함께 함수 실행 결과 반환
 */
export async function measureAPICall<T>(
  endpoint: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  let status: "success" | "error" = "success";
  let errorType: string | undefined;

  try {
    const result = await fn();
    const duration = performance.now() - startTime;

    apiMetricsStore.add({
      endpoint,
      timestamp: Date.now(),
      duration,
      status,
    });

    // 개발 환경에서 느린 호출 경고 (3초 이상)
    if (process.env.NODE_ENV === "development" && duration > 3000) {
      console.warn(
        `[API Metrics] Slow API call detected: ${endpoint} took ${duration.toFixed(2)}ms`
      );
    }

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    status = "error";
    errorType = error instanceof Error ? error.name : "Unknown";

    apiMetricsStore.add({
      endpoint,
      timestamp: Date.now(),
      duration,
      status,
      errorType,
    });

    throw error;
  }
}

/**
 * 개발 환경에서 메트릭 요약을 주기적으로 출력
 */
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // 브라우저 콘솔에서 접근 가능하도록 전역 객체에 추가
  (window as any).__apiMetrics = {
    getAll: () => apiMetricsStore.getAll(),
    getRecent: (count?: number) => apiMetricsStore.getRecent(count),
    getAverageDuration: (endpoint?: string) =>
      apiMetricsStore.getAverageDuration(endpoint),
    getErrorRate: (endpoint?: string) => apiMetricsStore.getErrorRate(endpoint),
    clear: () => apiMetricsStore.clear(),
    logSummary: () => apiMetricsStore.logSummary(),
  };

  // 5분마다 요약 출력
  setInterval(() => {
    if (apiMetricsStore.getAll().length > 0) {
      apiMetricsStore.logSummary();
    }
  }, 5 * 60 * 1000);
}


