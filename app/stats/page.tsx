/**
 * @file page.tsx
 * @description 통계 대시보드 페이지
 *
 * 주요 기능:
 * 1. 지역별 관광지 분포 통계 (Bar Chart)
 * 2. 관광 타입별 분포 통계 (Donut Chart)
 * 3. 통계 요약 카드
 *
 * 레이아웃 구조:
 * - 단일 컬럼 레이아웃 (모바일 우선)
 * - 상단: 통계 요약 카드
 * - 중단: 지역별 분포 차트
 * - 하단: 관광 타입별 분포 차트
 *
 * @dependencies
 * - 향후 구현: lib/api/stats-api.ts (통계 데이터 수집)
 * - 향후 구현: components/stats/* (통계 컴포넌트들)
 */

import { Suspense } from "react";
import { BarChart3 } from "lucide-react";
import type { Metadata } from "next";
import { RegionChartWithSuspense } from "@/components/stats/region-chart";
import { TypeChartWithSuspense } from "@/components/stats/type-chart";
import { StatsSummary } from "@/components/stats/stats-summary";
import { StatsSummarySkeleton } from "@/components/stats/stats-summary";

/**
 * 통계 페이지 메타데이터
 */
export const metadata: Metadata = {
  title: "통계 대시보드 - My Trip",
  description: "전국 관광지 통계를 한눈에 확인하세요. 지역별, 타입별 관광지 분포를 차트로 시각화합니다.",
  openGraph: {
    title: "통계 대시보드 - My Trip",
    description: "전국 관광지 통계를 한눈에 확인하세요",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "통계 대시보드 - My Trip",
    description: "전국 관광지 통계를 한눈에 확인하세요",
  },
};

/**
 * 통계 대시보드 페이지
 */
export default function StatsPage() {
  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-6">
        {/* 페이지 헤더 */}
        <section className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">통계 대시보드</h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            전국 관광지 통계를 지역별, 타입별로 확인할 수 있습니다.
          </p>
        </section>

        {/* 통계 요약 카드 섹션 */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl font-semibold mb-4">통계 요약</h2>
          <Suspense fallback={<StatsSummarySkeleton />}>
            <StatsSummary />
          </Suspense>
        </section>

        {/* 지역별 분포 차트 섹션 */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl font-semibold mb-4">지역별 관광지 분포</h2>
          <div className="rounded-lg border bg-card p-4 sm:p-6">
            <RegionChartWithSuspense />
          </div>
        </section>

        {/* 관광 타입별 분포 차트 섹션 */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl font-semibold mb-4">관광 타입별 분포</h2>
          <div className="rounded-lg border bg-card p-4 sm:p-6">
            <TypeChartWithSuspense />
          </div>
        </section>
      </div>
    </main>
  );
}

