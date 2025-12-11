/**
 * @file tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 지역, 관광 타입, 반려동물 동반, 정렬 옵션을 제공하는 필터 컴포넌트입니다.
 * URL 쿼리 파라미터를 사용하여 필터 상태를 관리합니다.
 *
 * 주요 기능:
 * - 지역 필터 (시/도 선택)
 * - 관광 타입 필터 (다중 선택)
 * - 반려동물 동반 필터 (토글 + 크기)
 * - 정렬 옵션 (최신순, 이름순)
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - lib/api/tour-api: getAreaCode
 * - lib/types/tour: CONTENT_TYPE_MAP
 * - lib/utils/filter: parseFilterParams, updateFilterQuery
 */

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAreaCode } from "@/lib/api/tour-api";
import { CONTENT_TYPE_MAP } from "@/lib/types/tour";
import { parseFilterParams, updateFilterQuery } from "@/lib/utils/filter";
import { performanceMetricsStore } from "@/lib/utils/performance-metrics";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loading } from "@/components/ui/loading";
import { ChevronDown, X } from "lucide-react";
import type { AreaCode } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

/**
 * 관광 타입 옵션
 */
const CONTENT_TYPE_OPTIONS = Object.entries(CONTENT_TYPE_MAP).map(
  ([id, name]) => ({ id, name })
);

/**
 * 반려동물 크기 옵션
 */
const PET_SIZE_OPTIONS = [
  { value: "small", label: "소형" },
  { value: "medium", label: "중형" },
  { value: "large", label: "대형" },
] as const;

/**
 * 관광지 필터 컴포넌트
 */
export function TourFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [areas, setAreas] = useState<AreaCode[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [isFilterChanging, setIsFilterChanging] = useState(false);
  const [changingFilterType, setChangingFilterType] = useState<string | null>(null);

  // 현재 필터 파라미터 파싱 (useMemo로 메모이제이션)
  const currentParams = useMemo(
    () => parseFilterParams(Object.fromEntries(searchParams.entries())),
    [searchParams]
  );

  // 지역 목록 로드
  useEffect(() => {
    async function loadAreas() {
      try {
        setLoadingAreas(true);
        const areaList = await getAreaCode();
        setAreas(areaList);
      } catch (error) {
        console.error("[TourFilters] Failed to load areas:", error);
      } finally {
        setLoadingAreas(false);
      }
    }
    loadAreas();
  }, []);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    if (!showAreaDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-area-dropdown]')) {
        setShowAreaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAreaDropdown]);

  // 필터 업데이트 함수 (검색어 유지, 페이지는 1로 리셋) - useCallback으로 메모이제이션
  const updateFilter = useCallback((updates: Partial<typeof currentParams>, filterType?: string) => {
    setIsFilterChanging(true);
    if (filterType) {
      setChangingFilterType(filterType);
    }
    const filterName = Object.keys(updates).join(", ");
    performanceMetricsStore.measureFilterChange(filterName, () => {
      const newParams = { ...currentParams, ...updates, page: 1 };
      // keyword는 필터 업데이트 시 유지
      if (currentParams.keyword) {
        newParams.keyword = currentParams.keyword;
      }
      const query = updateFilterQuery(currentParams, newParams);
      router.push(`/?${query}`);
      // 로딩 상태는 Suspense가 처리하므로 짧은 지연 후 리셋
      setTimeout(() => {
        setIsFilterChanging(false);
        setChangingFilterType(null);
      }, 100);
    });
  }, [currentParams, router]);

  // 지역 필터 변경 (useCallback으로 메모이제이션)
  const handleAreaChange = useCallback((areaCode: string | null) => {
    updateFilter({ areaCode: areaCode || undefined }, "area");
    setShowAreaDropdown(false);
  }, [updateFilter]);

  // 관광 타입 필터 토글 (useCallback으로 메모이제이션)
  const handleContentTypeToggle = useCallback((contentTypeId: string) => {
    const currentIds = currentParams.contentTypeId || [];
    const isSelected = currentIds.includes(contentTypeId);
    const newIds = isSelected
      ? currentIds.filter((id) => id !== contentTypeId)
      : [...currentIds, contentTypeId];
    updateFilter({
      contentTypeId: newIds.length > 0 ? newIds : undefined,
    }, "type");
  }, [currentParams.contentTypeId, updateFilter]);

  // 모든 관광 타입 선택 해제 (useCallback으로 메모이제이션)
  const handleClearContentTypes = useCallback(() => {
    updateFilter({ contentTypeId: undefined }, "type");
  }, [updateFilter]);

  // 반려동물 필터 토글 (useCallback으로 메모이제이션)
  const handlePetFriendlyToggle = useCallback(() => {
    updateFilter({
      petFriendly: !currentParams.petFriendly,
      petSize: !currentParams.petFriendly ? undefined : currentParams.petSize,
    }, "pet");
  }, [currentParams.petFriendly, currentParams.petSize, updateFilter]);

  // 반려동물 크기 변경 (useCallback으로 메모이제이션)
  const handlePetSizeChange = useCallback((petSize: "small" | "medium" | "large") => {
    updateFilter({
      petSize: currentParams.petSize === petSize ? undefined : petSize,
    }, "pet");
  }, [currentParams.petSize, updateFilter]);

  // 정렬 옵션 변경 (useCallback으로 메모이제이션)
  const handleSortChange = useCallback((sort: "latest" | "name") => {
    updateFilter({ sort }, "sort");
  }, [updateFilter]);

  // 필터 초기화 (검색어는 유지)
  const handleReset = () => {
    if (currentParams.keyword) {
      router.push(`/?keyword=${encodeURIComponent(currentParams.keyword)}`);
    } else {
      router.push("/");
    }
  };

  // 선택된 필터 개수 계산 (useMemo로 메모이제이션)
  const activeFilterCount = useMemo(
    () =>
      (currentParams.areaCode ? 1 : 0) +
      (currentParams.contentTypeId?.length || 0) +
      (currentParams.petFriendly ? 1 : 0) +
      (currentParams.petSize ? 1 : 0) +
      (currentParams.sort !== "latest" ? 1 : 0),
    [currentParams]
  );

  return (
    <section
      className="space-y-3 sm:space-y-4 rounded-lg border bg-card p-3 sm:p-4"
      aria-label="관광지 필터"
    >
      {/* 필터 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold" id="filter-heading">
          필터
        </h2>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            초기화 ({activeFilterCount})
          </Button>
        )}
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* 지역 필터 */}
        <div>
          <label htmlFor="area-filter" className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium">
            지역
          </label>
          {loadingAreas ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="relative" data-area-dropdown>
              <Button
                id="area-filter"
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                disabled={isFilterChanging && changingFilterType === "area"}
                aria-label="지역 선택"
                aria-expanded={showAreaDropdown}
                aria-haspopup="listbox"
              >
                {isFilterChanging && changingFilterType === "area" ? (
                  <Loading size="sm" />
                ) : (
                  <>
                    <span>
                      {currentParams.areaCode
                        ? areas.find((a) => a.code === currentParams.areaCode)
                            ?.name || "지역 선택"
                        : "전체"}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        showAreaDropdown && "rotate-180"
                      )}
                    />
                  </>
                )}
              </Button>
              {showAreaDropdown && (
                <div
                  role="listbox"
                  className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-lg"
                  aria-label="지역 목록"
                >
                  <div className="max-h-60 overflow-auto p-1">
                    <button
                      role="option"
                      aria-selected={!currentParams.areaCode}
                      onClick={() => handleAreaChange(null)}
                      className={cn(
                        "w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary",
                        !currentParams.areaCode && "bg-accent"
                      )}
                    >
                      전체
                    </button>
                    {areas.map((area) => (
                      <button
                        key={area.code}
                        role="option"
                        aria-selected={currentParams.areaCode === area.code}
                        onClick={() => handleAreaChange(area.code)}
                        className={cn(
                          "w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary",
                          currentParams.areaCode === area.code && "bg-accent"
                        )}
                      >
                        {area.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 관광 타입 필터 */}
        <div>
          <div className="mb-1.5 sm:mb-2 flex items-center justify-between">
            <label className="text-xs sm:text-sm font-medium" id="content-type-label">
              관광 타입
            </label>
            {currentParams.contentTypeId &&
              currentParams.contentTypeId.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearContentTypes}
                  className="h-6 text-xs"
                >
                  전체
                </Button>
              )}
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {CONTENT_TYPE_OPTIONS.map(({ id, name }) => {
              const isSelected =
                currentParams.contentTypeId?.includes(id) || false;
              return (
                <Button
                  key={id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleContentTypeToggle(id)}
                  className="h-7 sm:h-8 text-xs sm:text-sm min-w-[44px] sm:min-w-0 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  disabled={isFilterChanging && changingFilterType === "type"}
                  aria-label={`${name} ${isSelected ? "선택됨" : "선택 안됨"}`}
                  aria-pressed={isSelected}
                  aria-describedby="content-type-label"
                >
                  {name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* 반려동물 동반 필터 */}
        <div>
          <label htmlFor="pet-friendly-toggle" className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium">
            반려동물 동반
          </label>
          <div className="space-y-2">
            <Button
              id="pet-friendly-toggle"
              variant={currentParams.petFriendly ? "default" : "outline"}
              size="sm"
              onClick={handlePetFriendlyToggle}
              className="w-full justify-start h-9 sm:h-10 min-h-[44px] focus:ring-2 focus:ring-primary focus:ring-offset-2"
              disabled={isFilterChanging && changingFilterType === "pet"}
              aria-label={`반려동물 동반 가능 ${currentParams.petFriendly ? "선택됨" : "선택 안됨"}`}
              aria-pressed={currentParams.petFriendly}
            >
              {isFilterChanging && changingFilterType === "pet" ? (
                <Loading size="sm" />
              ) : (
                "반려동물 동반 가능"
              )}
            </Button>
            {currentParams.petFriendly && (
              <div className="flex gap-1.5 sm:gap-2">
                {PET_SIZE_OPTIONS.map(({ value, label }) => (
                  <Button
                    key={value}
                    variant={
                      currentParams.petSize === value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      handlePetSizeChange(
                        value as "small" | "medium" | "large"
                      )
                    }
                    className="flex-1 min-h-[44px] focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label={`${label} ${currentParams.petSize === value ? "선택됨" : "선택 안됨"}`}
                    aria-pressed={currentParams.petSize === value}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 정렬 옵션 */}
        <div>
          <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium" id="sort-label">
            정렬
          </label>
          <div className="flex gap-1.5 sm:gap-2">
            <Button
              variant={currentParams.sort === "latest" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange("latest")}
              className="flex-1 min-h-[44px] focus:ring-2 focus:ring-primary focus:ring-offset-2"
              disabled={isFilterChanging && changingFilterType === "sort"}
              aria-label="최신순 정렬"
              aria-pressed={currentParams.sort === "latest"}
              aria-describedby="sort-label"
            >
              {isFilterChanging && changingFilterType === "sort" && currentParams.sort !== "latest" ? (
                <Loading size="sm" />
              ) : (
                "최신순"
              )}
            </Button>
            <Button
              variant={currentParams.sort === "name" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange("name")}
              className="flex-1 min-h-[44px] focus:ring-2 focus:ring-primary focus:ring-offset-2"
              disabled={isFilterChanging && changingFilterType === "sort"}
              aria-label="이름순 정렬"
              aria-pressed={currentParams.sort === "name"}
              aria-describedby="sort-label"
            >
              {isFilterChanging && changingFilterType === "sort" && currentParams.sort !== "name" ? (
                <Loading size="sm" />
              ) : (
                "이름순"
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

