/**
 * @file performance-metrics.ts
 * @description 페이지 성능 측정 유틸리티
 *
 * 초기 로딩 시간, 필터/검색 응답 시간 등을 측정하는 도구입니다.
 */

/**
 * 성능 메트릭 타입
 */
export interface PerformanceMetric {
  name: string;
  timestamp: number;
  duration: number; // ms
  type: "page_load" | "filter_change" | "search" | "pagination" | "navigation";
}

/**
 * 성능 메트릭 저장소 (개발 환경 전용)
 */
class PerformanceMetricsStore {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 50; // 최대 저장 개수
  private pageLoadStartTime: number | null = null;

  /**
   * 메트릭 추가
   */
  add(metric: PerformanceMetric) {
    if (process.env.NODE_ENV !== "development") {
      return; // 개발 환경에서만 수집
    }

    this.metrics.push(metric);

    // 최대 개수 초과 시 오래된 항목 제거
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // 느린 작업 경고
    if (metric.duration > 3000) {
      console.warn(
        `[Performance] Slow ${metric.type} detected: ${metric.name} took ${metric.duration.toFixed(2)}ms`
      );
    }
  }

  /**
   * 페이지 로딩 시작 시간 기록
   */
  startPageLoad() {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    this.pageLoadStartTime = performance.now();
  }

  /**
   * 페이지 로딩 완료 시간 기록
   */
  endPageLoad() {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    if (this.pageLoadStartTime === null) {
      return;
    }
    const duration = performance.now() - this.pageLoadStartTime;

    this.add({
      name: "Initial Page Load",
      timestamp: Date.now(),
      duration,
      type: "page_load",
    });

    // 목표: 3초 이내
    if (duration > 3000) {
      console.warn(
        `[Performance] Page load exceeded target (3s): ${duration.toFixed(2)}ms`
      );
    } else {
      console.log(
        `[Performance] Page load completed in ${duration.toFixed(2)}ms (target: < 3000ms)`
      );
    }

    this.pageLoadStartTime = null;
  }

  /**
   * 필터 변경 시간 측정
   */
  measureFilterChange(filterName: string, fn: () => void | Promise<void>) {
    if (process.env.NODE_ENV !== "development") {
      return fn();
    }

    const startTime = performance.now();
    const result = fn();
    
    if (result instanceof Promise) {
      return result.then(() => {
        const duration = performance.now() - startTime;
        this.add({
          name: `Filter: ${filterName}`,
          timestamp: Date.now(),
          duration,
          type: "filter_change",
        });
      });
    } else {
      const duration = performance.now() - startTime;
      this.add({
        name: `Filter: ${filterName}`,
        timestamp: Date.now(),
        duration,
        type: "filter_change",
      });
      return result;
    }
  }

  /**
   * 검색 시간 측정
   */
  measureSearch(keyword: string, fn: () => void | Promise<void>) {
    if (process.env.NODE_ENV !== "development") {
      return fn();
    }

    const startTime = performance.now();
    const result = fn();
    
    if (result instanceof Promise) {
      return result.then(() => {
        const duration = performance.now() - startTime;
        this.add({
          name: `Search: ${keyword}`,
          timestamp: Date.now(),
          duration,
          type: "search",
        });
      });
    } else {
      const duration = performance.now() - startTime;
      this.add({
        name: `Search: ${keyword}`,
        timestamp: Date.now(),
        duration,
        type: "search",
      });
      return result;
    }
  }

  /**
   * 모든 메트릭 조회
   */
  getAll(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * 타입별 메트릭 조회
   */
  getByType(type: PerformanceMetric["type"]): PerformanceMetric[] {
    return this.metrics.filter((m) => m.type === type);
  }

  /**
   * 평균 응답 시간 계산
   */
  getAverageDuration(type?: PerformanceMetric["type"]): number {
    const filtered = type
      ? this.metrics.filter((m) => m.type === type)
      : this.metrics;

    if (filtered.length === 0) return 0;

    const total = filtered.reduce((sum, m) => sum + m.duration, 0);
    return total / filtered.length;
  }

  /**
   * 메트릭 초기화
   */
  clear() {
    this.metrics = [];
    this.pageLoadStartTime = null;
  }

  /**
   * 메트릭 요약 로그 출력
   */
  logSummary() {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    if (this.metrics.length === 0) {
      console.log("[Performance Metrics] No metrics collected yet.");
      return;
    }

    console.group("[Performance Metrics Summary]");
    console.log(`Total metrics: ${this.metrics.length}`);
    console.log(`Average duration: ${this.getAverageDuration().toFixed(2)}ms`);

    // 타입별 통계
    const types: PerformanceMetric["type"][] = [
      "page_load",
      "filter_change",
      "search",
      "pagination",
      "navigation",
    ];
    types.forEach((type) => {
      const typeMetrics = this.getByType(type);
      if (typeMetrics.length > 0) {
        const avg = this.getAverageDuration(type);
        console.log(
          `  ${type}: ${typeMetrics.length} times, avg ${avg.toFixed(2)}ms`
        );
      }
    });

    console.groupEnd();
  }
}

// 싱글톤 인스턴스
export const performanceMetricsStore = new PerformanceMetricsStore();

/**
 * 개발 환경에서 메트릭 요약을 주기적으로 출력
 */
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // 브라우저 콘솔에서 접근 가능하도록 전역 객체에 추가
  (window as any).__performanceMetrics = {
    getAll: () => performanceMetricsStore.getAll(),
    getByType: (type: PerformanceMetric["type"]) =>
      performanceMetricsStore.getByType(type),
    getAverageDuration: (type?: PerformanceMetric["type"]) =>
      performanceMetricsStore.getAverageDuration(type),
    clear: () => performanceMetricsStore.clear(),
    logSummary: () => performanceMetricsStore.logSummary(),
  };

  // 페이지 로딩 완료 시 측정
  if (document.readyState === "complete") {
    performanceMetricsStore.endPageLoad();
  } else {
    window.addEventListener("load", () => {
      performanceMetricsStore.endPageLoad();
    });
  }

  // 5분마다 요약 출력
  setInterval(() => {
    if (performanceMetricsStore.getAll().length > 0) {
      performanceMetricsStore.logSummary();
    }
  }, 5 * 60 * 1000);
}


