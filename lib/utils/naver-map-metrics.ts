/**
 * @file naver-map-metrics.ts
 * @description 네이버 지도 API 성능 측정 및 모니터링 유틸리티
 *
 * 개발 환경에서 네이버 지도 API 사용량, 로딩 성능 등을 측정하는 도구입니다.
 */

/**
 * 네이버 지도 메트릭 타입
 */
export interface NaverMapMetric {
  timestamp: number;
  action: "load" | "marker_create" | "marker_update" | "map_move" | "map_zoom";
  duration?: number; // ms
  markerCount?: number;
  error?: string;
}

/**
 * 네이버 지도 메트릭 저장소 (개발 환경 전용)
 */
class NaverMapMetricsStore {
  private metrics: NaverMapMetric[] = [];
  private readonly maxMetrics = 100; // 최대 저장 개수
  private loadStartTime: number | null = null;
  private loadEndTime: number | null = null;

  /**
   * 메트릭 추가
   */
  add(metric: NaverMapMetric) {
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
   * 지도 로딩 시작 시간 기록
   */
  startLoad() {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    this.loadStartTime = performance.now();
  }

  /**
   * 지도 로딩 완료 시간 기록
   */
  endLoad() {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    if (this.loadStartTime === null) {
      return;
    }
    this.loadEndTime = performance.now();
    const duration = this.loadEndTime - this.loadStartTime;

    this.add({
      timestamp: Date.now(),
      action: "load",
      duration,
    });

    // 로딩 시간이 3초 이상이면 경고
    if (duration > 3000) {
      console.warn(
        `[Naver Map Metrics] Slow map load detected: ${duration.toFixed(2)}ms`
      );
    }

    this.loadStartTime = null;
    this.loadEndTime = null;
  }

  /**
   * 모든 메트릭 조회
   */
  getAll(): NaverMapMetric[] {
    return [...this.metrics];
  }

  /**
   * 최근 N개 메트릭 조회
   */
  getRecent(count: number = 10): NaverMapMetric[] {
    return this.metrics.slice(-count);
  }

  /**
   * 평균 로딩 시간 계산
   */
  getAverageLoadTime(): number {
    const loadMetrics = this.metrics.filter((m) => m.action === "load" && m.duration);
    if (loadMetrics.length === 0) return 0;

    const total = loadMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / loadMetrics.length;
  }

  /**
   * 총 마커 생성 횟수
   */
  getTotalMarkerCreations(): number {
    return this.metrics.filter((m) => m.action === "marker_create").length;
  }

  /**
   * 메트릭 초기화
   */
  clear() {
    this.metrics = [];
    this.loadStartTime = null;
    this.loadEndTime = null;
  }

  /**
   * 메트릭 요약 로그 출력
   */
  logSummary() {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    if (this.metrics.length === 0) {
      console.log("[Naver Map Metrics] No metrics collected yet.");
      return;
    }

    console.group("[Naver Map Metrics Summary]");
    console.log(`Total actions: ${this.metrics.length}`);
    console.log(`Average load time: ${this.getAverageLoadTime().toFixed(2)}ms`);
    console.log(`Total marker creations: ${this.getTotalMarkerCreations()}`);

    // 액션별 통계
    const actions = new Set(this.metrics.map((m) => m.action));
    actions.forEach((action) => {
      const actionMetrics = this.metrics.filter((m) => m.action === action);
      console.log(`  ${action}: ${actionMetrics.length} times`);
    });

    console.groupEnd();
  }
}

// 싱글톤 인스턴스
export const naverMapMetricsStore = new NaverMapMetricsStore();

/**
 * 좌표 변환 정확성 검증
 *
 * @param mapx - KATEC 경도 (문자열)
 * @param mapy - KATEC 위도 (문자열)
 * @returns 변환된 WGS84 좌표 및 검증 결과
 */
export function validateCoordinateConversion(
  mapx: string,
  mapy: string
): {
  lng: number;
  lat: number;
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 좌표가 비어있는지 확인
  if (!mapx || !mapy) {
    errors.push("좌표 값이 비어있습니다.");
    return { lng: 0, lat: 0, isValid: false, errors };
  }

  // 숫자로 변환 가능한지 확인
  const mapxNum = parseFloat(mapx);
  const mapyNum = parseFloat(mapy);

  if (isNaN(mapxNum) || isNaN(mapyNum)) {
    errors.push("좌표 값이 숫자가 아닙니다.");
    return { lng: 0, lat: 0, isValid: false, errors };
  }

  // KATEC 좌표계 범위 확인 (한국 경도: 124~132, 위도: 33~43)
  // KATEC는 10,000,000을 곱한 값이므로:
  // 경도: 1,240,000,000 ~ 1,320,000,000
  // 위도: 330,000,000 ~ 430,000,000
  if (mapxNum < 1240000000 || mapxNum > 1320000000) {
    errors.push(`경도 값이 유효 범위를 벗어났습니다: ${mapxNum}`);
  }
  if (mapyNum < 330000000 || mapyNum > 430000000) {
    errors.push(`위도 값이 유효 범위를 벗어났습니다: ${mapyNum}`);
  }

  // WGS84 변환
  const lng = mapxNum / 10000000;
  const lat = mapyNum / 10000000;

  // 변환된 좌표 범위 확인
  if (lng < 124 || lng > 132) {
    errors.push(`변환된 경도가 유효 범위를 벗어났습니다: ${lng}`);
  }
  if (lat < 33 || lat > 43) {
    errors.push(`변환된 위도가 유효 범위를 벗어났습니다: ${lat}`);
  }

  return {
    lng,
    lat,
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * ncpKeyId 파라미터 검증
 *
 * @param keyId - 검증할 ncpKeyId
 * @returns 검증 결과
 */
export function validateNcpKeyId(keyId: string | undefined): {
  isValid: boolean;
  error?: string;
} {
  if (!keyId) {
    return {
      isValid: false,
      error: "ncpKeyId가 설정되지 않았습니다.",
    };
  }

  // ncpKeyId는 일반적으로 문자열 형태
  // 구 ncpClientId와 구분하기 위해 형식 확인
  // (실제 형식은 네이버 클라우드 플랫폼 문서 참조)
  if (keyId.length < 10) {
    return {
      isValid: false,
      error: "ncpKeyId 형식이 올바르지 않습니다. (너무 짧음)",
    };
  }

  return { isValid: true };
}

/**
 * 개발 환경에서 메트릭 요약을 주기적으로 출력
 */
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // 브라우저 콘솔에서 접근 가능하도록 전역 객체에 추가
  (window as any).__naverMapMetrics = {
    getAll: () => naverMapMetricsStore.getAll(),
    getRecent: (count?: number) => naverMapMetricsStore.getRecent(count),
    getAverageLoadTime: () => naverMapMetricsStore.getAverageLoadTime(),
    getTotalMarkerCreations: () => naverMapMetricsStore.getTotalMarkerCreations(),
    clear: () => naverMapMetricsStore.clear(),
    logSummary: () => naverMapMetricsStore.logSummary(),
  };

  // 5분마다 요약 출력
  setInterval(() => {
    if (naverMapMetricsStore.getAll().length > 0) {
      naverMapMetricsStore.logSummary();
    }
  }, 5 * 60 * 1000);
}


