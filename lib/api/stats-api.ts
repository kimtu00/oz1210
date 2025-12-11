/**
 * @file stats-api.ts
 * @description 통계 데이터 수집 API
 *
 * 통계 대시보드에 필요한 지역별, 타입별 관광지 통계 데이터를 수집합니다.
 *
 * 주요 기능:
 * - 지역별 관광지 개수 집계
 * - 타입별 관광지 개수 집계
 * - 전체 통계 요약
 *
 * @dependencies
 * - lib/api/tour-api: getAreaCode, getAreaBasedList
 * - lib/types/stats: RegionStats, TypeStats, StatsSummary
 * - lib/types/tour: AreaCode, getContentTypeName
 */

import { unstable_cache } from "next/cache";
import { getAreaCode, getAreaBasedList } from "@/lib/api/tour-api";
import { getContentTypeName } from "@/lib/types/tour";
import type { AreaCode } from "@/lib/types/tour";
import type { RegionStats, TypeStats, StatsSummary } from "@/lib/types/stats";

/**
 * 관광 타입 ID 목록
 */
const CONTENT_TYPE_IDS = ["12", "14", "15", "25", "28", "32", "38", "39"] as const;

/**
 * 지역별 관광지 통계 수집 (내부 함수)
 *
 * @returns 지역별 관광지 통계 배열
 */
async function fetchRegionStatsInternal(): Promise<RegionStats[]> {
  const startTime = Date.now();

  try {
    // 1. 전체 지역 코드 목록 조회
    const areas = await getAreaCode();

    if (areas.length === 0) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[Stats API] No area codes found");
      }
      return [];
    }

    // 2. 각 지역별로 totalCount 조회 (병렬 처리)
    const regionPromises = areas.map(async (area) => {
      try {
        const { totalCount } = await getAreaBasedList({
          areaCode: area.code,
          numOfRows: 1, // 최소 데이터만 조회 (totalCount만 필요)
          pageNo: 1,
        });

        return {
          regionCode: area.code,
          regionName: area.name,
          count: totalCount,
        } as RegionStats;
      } catch (error) {
        // 일부 지역 실패해도 나머지는 계속 진행
        if (process.env.NODE_ENV === "development") {
          console.error(
            `[Stats API] Failed to fetch stats for region ${area.code} (${area.name}):`,
            error
          );
        }
        return null;
      }
    });

    // 3. 모든 지역 통계 수집 (일부 실패 허용)
    const results = await Promise.allSettled(regionPromises);
    const regionStats: RegionStats[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value !== null) {
        regionStats.push(result.value);
      } else if (process.env.NODE_ENV === "development") {
        const area = areas[index];
        console.warn(
          `[Stats API] Skipped region ${area?.code} (${area?.name}) due to error`
        );
      }
    });

    // 최소 1개 지역도 성공하지 못하면 에러
    if (regionStats.length === 0) {
      throw new Error("모든 지역 통계 수집에 실패했습니다.");
    }

    const duration = Date.now() - startTime;
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Stats API] Region stats collected: ${regionStats.length}/${areas.length} regions in ${duration}ms`
      );
    }

    // count 내림차순 정렬
    return regionStats.sort((a, b) => b.count - a.count);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Stats API] Failed to fetch region stats:", error);
    }
    throw error;
  }
}

/**
 * 타입별 관광지 통계 수집 (내부 함수)
 *
 * @returns 타입별 관광지 통계 배열
 */
async function fetchTypeStatsInternal(): Promise<TypeStats[]> {
  const startTime = Date.now();

  try {
    // 1. 각 타입별로 totalCount 조회 (병렬 처리)
    const typePromises = CONTENT_TYPE_IDS.map(async (contentTypeId) => {
      try {
        const { totalCount } = await getAreaBasedList({
          contentTypeId,
          numOfRows: 1, // 최소 데이터만 조회 (totalCount만 필요)
          pageNo: 1,
        });

        return {
          contentTypeId,
          contentTypeName: getContentTypeName(contentTypeId),
          count: totalCount,
        } as TypeStats;
      } catch (error) {
        // 일부 타입 실패해도 나머지는 계속 진행
        if (process.env.NODE_ENV === "development") {
          console.error(
            `[Stats API] Failed to fetch stats for type ${contentTypeId}:`,
            error
          );
        }
        return null;
      }
    });

    // 2. 모든 타입 통계 수집 (일부 실패 허용)
    const results = await Promise.allSettled(typePromises);
    const typeStats: TypeStats[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value !== null) {
        typeStats.push(result.value);
      } else if (process.env.NODE_ENV === "development") {
        const contentTypeId = CONTENT_TYPE_IDS[index];
        console.warn(
          `[Stats API] Skipped type ${contentTypeId} due to error`
        );
      }
    });

    const duration = Date.now() - startTime;
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Stats API] Type stats collected: ${typeStats.length}/${CONTENT_TYPE_IDS.length} types in ${duration}ms`
      );
    }

    // count 내림차순 정렬
    return typeStats.sort((a, b) => b.count - a.count);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Stats API] Failed to fetch type stats:", error);
    }
    throw error;
  }
}

/**
 * 지역별 관광지 통계 수집
 *
 * Next.js unstable_cache를 사용하여 1시간 동안 캐싱됩니다.
 *
 * @returns 지역별 관광지 통계 배열 (count 내림차순 정렬)
 */
export const getRegionStats = unstable_cache(
  fetchRegionStatsInternal,
  ["region-stats"],
  {
    revalidate: 3600, // 1시간
    tags: ["stats", "region-stats"],
  }
);

/**
 * 타입별 관광지 통계 수집
 *
 * Next.js unstable_cache를 사용하여 1시간 동안 캐싱됩니다.
 *
 * @returns 타입별 관광지 통계 배열 (count 내림차순 정렬)
 */
export const getTypeStats = unstable_cache(
  fetchTypeStatsInternal,
  ["type-stats"],
  {
    revalidate: 3600, // 1시간
    tags: ["stats", "type-stats"],
  }
);

/**
 * 전체 통계 요약 수집
 *
 * 지역별 통계와 타입별 통계를 병렬로 수집하여 요약 정보를 생성합니다.
 * Next.js unstable_cache를 사용하여 1시간 동안 캐싱됩니다.
 *
 * @returns 통계 요약 정보
 * @throws {Error} 지역 통계와 타입 통계 모두 실패 시
 */
export async function getStatsSummary(): Promise<StatsSummary> {
  const startTime = Date.now();

  try {
    // 지역 통계와 타입 통계를 병렬로 수집
    const [regionStats, typeStats] = await Promise.all([
      getRegionStats(),
      getTypeStats(),
    ]);

    // 최소 하나라도 성공해야 함
    if (regionStats.length === 0 && typeStats.length === 0) {
      throw new Error("통계 데이터 수집에 실패했습니다.");
    }

    // 전체 관광지 수 계산: 모든 지역의 count 합산
    // (통계 목적상 근사치로 충분)
    const totalCount = regionStats.reduce((sum, region) => sum + region.count, 0);

    // Top 3 지역 (이미 정렬되어 있음)
    const topRegions = regionStats.slice(0, 3);

    // Top 3 타입 (이미 정렬되어 있음)
    const topTypes = typeStats.slice(0, 3);

    const summary: StatsSummary = {
      totalCount,
      topRegions,
      topTypes,
      lastUpdated: new Date(),
    };

    const duration = Date.now() - startTime;
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Stats API] Stats summary collected in ${duration}ms:`,
        {
          totalCount,
          topRegionsCount: topRegions.length,
          topTypesCount: topTypes.length,
        }
      );
    }

    return summary;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Stats API] Failed to fetch stats summary:", error);
    }
    throw error;
  }
}

