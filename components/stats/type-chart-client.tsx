/**
 * @file type-chart-client.tsx
 * @description 관광 타입별 분포 Donut Chart Client Component
 *
 * 클라이언트 사이드 인터랙션(클릭, 호버)을 처리하는 차트 컴포넌트입니다.
 */

"use client";

import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { TypeStats } from "@/lib/types/stats";

/**
 * 차트 데이터 형식
 */
interface ChartData {
  name: string; // 타입명
  value: number; // 관광지 개수
  percentage: number; // 비율 (백분율)
  contentTypeId: string; // 타입 ID (클릭 시 사용)
}

/**
 * 숫자 포맷팅 (천 단위 구분)
 */
function formatNumber(num: number): string {
  return new Intl.NumberFormat("ko-KR").format(num);
}

/**
 * 비율 포맷팅 (백분율, 소수점 1자리)
 */
function formatPercentage(num: number): string {
  return `${num.toFixed(1)}%`;
}

/**
 * 관광 타입별 분포 차트 Client Component
 *
 * @param data - 타입별 통계 데이터
 */
export function TypeChartClient({ data }: { data: TypeStats[] }) {
  const router = useRouter();

  // 전체 관광지 수 계산
  const totalCount = data.reduce((sum, type) => sum + type.count, 0);

  // 차트 데이터 형식으로 변환 (비율 계산 포함)
  const chartData: ChartData[] = data.map((type) => {
    const percentage = totalCount > 0 ? (type.count / totalCount) * 100 : 0;
    return {
      name: type.contentTypeName,
      value: type.count,
      percentage,
      contentTypeId: type.contentTypeId,
    };
  });

  // 섹션 클릭 핸들러
  const handlePieClick = (entry: ChartData) => {
    router.push(`/?contentTypeId=${entry.contentTypeId}`);
  };

  // Chart Config (shadcn/ui Chart 스타일링)
  // 8가지 타입에 대해 chart-1 ~ chart-5 색상을 순환 사용
  const chartConfig = {
    관광지: {
      label: "관광지",
      color: "hsl(var(--chart-1))",
    },
    문화시설: {
      label: "문화시설",
      color: "hsl(var(--chart-2))",
    },
    "축제/행사": {
      label: "축제/행사",
      color: "hsl(var(--chart-3))",
    },
    여행코스: {
      label: "여행코스",
      color: "hsl(var(--chart-4))",
    },
    레포츠: {
      label: "레포츠",
      color: "hsl(var(--chart-5))",
    },
    숙박: {
      label: "숙박",
      color: "hsl(var(--chart-1))",
    },
    쇼핑: {
      label: "쇼핑",
      color: "hsl(var(--chart-2))",
    },
    음식점: {
      label: "음식점",
      color: "hsl(var(--chart-3))",
    },
  };

  // 색상 배열 (타입명 순서대로)
  const colors = chartData.map((item) => {
    const config = chartConfig[item.name as keyof typeof chartConfig];
    return config?.color || "hsl(var(--chart-1))";
  });

  return (
    <div className="w-full" role="region" aria-label="관광 타입별 분포 차트">
      <ChartContainer config={chartConfig} className="h-[300px] sm:h-[400px]">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="90%"
            paddingAngle={2}
            onClick={(data) => {
              if (data && data.activePayload && data.activePayload[0]) {
                const entry = data.activePayload[0].payload as ChartData;
                handlePieClick(entry);
              }
            }}
            style={{ cursor: "pointer" }}
            aria-label="관광 타입별 분포 차트"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index]}
                style={{ cursor: "pointer" }}
                aria-label={`${entry.name}: ${formatNumber(entry.value)}개 (${formatPercentage(entry.percentage)}). 클릭하여 해당 타입 관광지 목록 보기`}
              />
            ))}
          </Pie>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, props) => {
                  const entry = props.payload as ChartData;
                  return [
                    `${formatNumber(Number(value))}개 (${formatPercentage(entry.percentage)})`,
                    entry.name,
                  ];
                }}
              />
            }
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
}

