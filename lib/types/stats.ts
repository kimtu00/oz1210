/**
 * @file stats.ts
 * @description 통계 관련 타입 정의
 *
 * 관광지 통계 대시보드에서 사용하는 데이터 구조를 정의합니다.
 */

/**
 * 지역별 관광지 통계
 */
export interface RegionStats {
  regionCode: string; // 지역코드
  regionName: string; // 지역명
  count: number; // 관광지 개수
}

/**
 * 타입별 관광지 통계
 */
export interface TypeStats {
  contentTypeId: string; // 콘텐츠타입ID
  contentTypeName: string; // 타입명
  count: number; // 관광지 개수
}

/**
 * 통계 요약 정보
 */
export interface StatsSummary {
  totalCount: number; // 전체 관광지 수
  topRegions: RegionStats[]; // 상위 지역 (최대 3개)
  topTypes: TypeStats[]; // 상위 타입 (최대 3개)
  lastUpdated: Date; // 마지막 업데이트 시간
}


