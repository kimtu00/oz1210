/**
 * @file region-chart.tsx
 * @description 지역별 관광지 분포 Bar Chart 컴포넌트
 *
 * 통계 대시보드에 지역별 관광지 분포를 시각화하는 Bar Chart를 표시합니다.
 *
 * 주요 기능:
 * 1. 지역별 관광지 개수를 Bar Chart로 표시
 * 2. 상위 10개 지역 표시
 * 3. 바 클릭 시 해당 지역 목록 페이지로 이동
 * 4. 호버 시 정확한 개수 표시
 * 5. 다크/라이트 모드 지원
 * 6. 반응형 디자인
 * 7. 접근성 지원 (ARIA 라벨, 키보드 네비게이션)
 *
 * @dependencies
 * - lib/api/stats-api: getRegionStats
 * - lib/types/stats: RegionStats
 * - components/ui/chart: ChartContainer, ChartTooltip, ChartTooltipContent
 * - recharts: BarChart, Bar, XAxis, YAxis
 */

import { Suspense } from "react";
import { getRegionStats } from "@/lib/api/stats-api";
import { RegionChartClient } from "./region-chart-client";
import { RegionChartSkeleton } from "./region-chart-skeleton";
import { StatsError } from "./stats-error";
import type { RegionStats } from "@/lib/types/stats";

/**
 * 지역별 분포 차트 컴포넌트 (Server Component)
 *
 * Server Component에서 데이터를 가져와 Client Component로 전달합니다.
 */
export async function RegionChart() {
  try {
    const data = await getRegionStats();
    return <RegionChartClient data={data} />;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "지역별 통계 데이터를 불러오는 중 오류가 발생했습니다.";

    return <StatsError message={errorMessage} />;
  }
}

/**
 * Suspense로 감싼 지역별 분포 차트
 */
export function RegionChartWithSuspense() {
  return (
    <Suspense fallback={<RegionChartSkeleton />}>
      <RegionChart />
    </Suspense>
  );
}

