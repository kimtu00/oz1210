/**
 * @file region-chart-client.tsx
 * @description 지역별 관광지 분포 Bar Chart Client Component
 *
 * 클라이언트 사이드 인터랙션(클릭, 호버)을 처리하는 차트 컴포넌트입니다.
 */

"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { RegionStats } from "@/lib/types/stats";

// recharts 동적 import로 코드 분할 최적화
const BarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(
  () => import("recharts").then((mod) => mod.Bar),
  { ssr: false }
);
const XAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import("recharts").then((mod) => mod.YAxis),
  { ssr: false }
);
const Cell = dynamic(
  () => import("recharts").then((mod) => mod.Cell),
  { ssr: false }
);

/**
 * 차트 데이터 형식
 */
interface ChartData {
  name: string; // 지역명
  count: number; // 관광지 개수
  regionCode: string; // 지역 코드 (클릭 시 사용)
}

/**
 * 숫자 포맷팅 (천 단위 구분)
 */
function formatNumber(num: number): string {
  return new Intl.NumberFormat("ko-KR").format(num);
}

/**
 * 지역별 분포 차트 Client Component
 *
 * @param data - 지역별 통계 데이터
 */
export function RegionChartClient({ data }: { data: RegionStats[] }) {
  const router = useRouter();

  // 상위 10개 지역만 표시
  const topRegions = data.slice(0, 10);

  // 차트 데이터 형식으로 변환
  const chartData: ChartData[] = topRegions.map((region) => ({
    name: region.regionName,
    count: region.count,
    regionCode: region.regionCode,
  }));

  // 바 클릭 핸들러
  const handleBarClick = (entry: ChartData) => {
    router.push(`/?areaCode=${entry.regionCode}`);
  };

  // Chart Config (shadcn/ui Chart 스타일링)
  const chartConfig = {
    count: {
      label: "관광지 개수",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="w-full" role="region" aria-label="지역별 관광지 분포 차트">
      <ChartContainer config={chartConfig} className="h-[300px] sm:h-[400px]">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          aria-label="지역별 관광지 분포 차트"
          onClick={(data) => {
            if (data && data.activePayload && data.activePayload[0]) {
              const entry = data.activePayload[0].payload as ChartData;
              handleBarClick(entry);
            }
          }}
        >
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatNumber(value)}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => [
                  `${formatNumber(Number(value))}개`,
                  "관광지 개수",
                ]}
              />
            }
          />
          <Bar
            dataKey="count"
            fill="var(--color-count)"
            style={{ cursor: "pointer" }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill="var(--color-count)"
                style={{ cursor: "pointer" }}
                aria-label={`${entry.name}: ${formatNumber(entry.count)}개 관광지. 클릭하여 해당 지역 관광지 목록 보기`}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

