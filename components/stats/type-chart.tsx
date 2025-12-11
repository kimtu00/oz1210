/**
 * @file type-chart.tsx
 * @description 관광 타입별 분포 Donut Chart 컴포넌트
 *
 * 통계 대시보드에 관광 타입별 분포를 시각화하는 Donut Chart를 표시합니다.
 *
 * 주요 기능:
 * 1. 관광 타입별 관광지 개수를 Donut Chart로 표시
 * 2. 8가지 타입 모두 표시 (관광지, 문화시설, 축제/행사, 여행코스, 레포츠, 숙박, 쇼핑, 음식점)
 * 3. 타입별 비율 (백분율) 계산 및 표시
 * 4. 섹션 클릭 시 해당 타입 목록 페이지로 이동
 * 5. 호버 시 타입명, 개수, 비율 표시
 * 6. 다크/라이트 모드 지원
 * 7. 반응형 디자인
 * 8. 접근성 지원 (ARIA 라벨)
 *
 * @dependencies
 * - lib/api/stats-api: getTypeStats
 * - lib/types/stats: TypeStats
 * - components/ui/chart: ChartContainer, ChartTooltip, ChartTooltipContent
 * - recharts: PieChart, Pie, Cell
 */

import { Suspense } from "react";
import { getTypeStats } from "@/lib/api/stats-api";
import { TypeChartClient } from "./type-chart-client";
import { TypeChartSkeleton } from "./type-chart-skeleton";
import { StatsError } from "./stats-error";
import type { TypeStats } from "@/lib/types/stats";

/**
 * 관광 타입별 분포 차트 컴포넌트 (Server Component)
 *
 * Server Component에서 데이터를 가져와 Client Component로 전달합니다.
 */
export async function TypeChart() {
  try {
    const data = await getTypeStats();
    return <TypeChartClient data={data} />;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "타입별 통계 데이터를 불러오는 중 오류가 발생했습니다.";

    return <StatsError message={errorMessage} />;
  }
}

/**
 * Suspense로 감싼 관광 타입별 분포 차트
 */
export function TypeChartWithSuspense() {
  return (
    <Suspense fallback={<TypeChartSkeleton />}>
      <TypeChart />
    </Suspense>
  );
}

