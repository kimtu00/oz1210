/**
 * @file bookmark-list.tsx
 * @description 북마크 목록 컴포넌트
 *
 * 북마크된 관광지 목록을 그리드 레이아웃으로 표시하는 컴포넌트입니다.
 * 정렬, 일괄 삭제, 개별 삭제 기능을 포함합니다.
 *
 * 주요 기능:
 * - 북마크된 관광지 목록 표시
 * - 정렬 옵션 (최신순, 이름순, 지역별)
 * - 일괄 삭제 기능
 * - 개별 삭제 기능
 * - TourCard 컴포넌트 재사용
 * - 그리드 레이아웃 (반응형)
 * - 빈 상태 처리
 *
 * @dependencies
 * - components/bookmarks/bookmark-card: BookmarkCard
 * - components/bookmarks/bookmark-sort: BookmarkSort
 * - components/bookmarks/bookmark-bulk-actions: BookmarkBulkActions
 * - lib/types/tour: TourItem
 */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BookmarkCard } from "@/components/bookmarks/bookmark-card";
import { BookmarkSort, type SortOption } from "@/components/bookmarks/bookmark-sort";
import { BookmarkBulkActions } from "@/components/bookmarks/bookmark-bulk-actions";
import type { TourItem } from "@/lib/types/tour";

interface BookmarkListProps {
  /**
   * 북마크된 관광지 목록 (bookmarkCreatedAt 포함 가능)
   */
  bookmarks: (TourItem & { bookmarkCreatedAt?: string })[];
}

/**
 * 빈 상태 컴포넌트
 */
function BookmarkEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
      <Star className="mb-4 h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50" />
      <h2 className="mb-2 text-lg sm:text-xl font-semibold">아직 북마크한 관광지가 없습니다</h2>
      <p className="mb-6 text-sm sm:text-base text-muted-foreground px-4">
        관광지를 북마크하여 나중에 쉽게 찾아보세요
      </p>
      <Link href="/">
        <Button className="min-h-[44px] px-6">
          관광지 둘러보기
        </Button>
      </Link>
    </div>
  );
}

/**
 * 정렬 함수
 */
function sortBookmarks(
  bookmarks: (TourItem & { bookmarkCreatedAt?: string })[],
  sortOption: SortOption
): (TourItem & { bookmarkCreatedAt?: string })[] {
  const sorted = [...bookmarks];

  switch (sortOption) {
    case "latest":
      // 최신순: bookmarkCreatedAt 기준 (내림차순)
      return sorted.sort((a, b) => {
        const dateA = a.bookmarkCreatedAt ? new Date(a.bookmarkCreatedAt).getTime() : 0;
        const dateB = b.bookmarkCreatedAt ? new Date(b.bookmarkCreatedAt).getTime() : 0;
        return dateB - dateA;
      });

    case "name":
      // 이름순: title 기준 (가나다순)
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "ko"));

    case "region":
      // 지역별: areacode 기준
      return sorted.sort((a, b) => {
        const codeA = a.areacode || "";
        const codeB = b.areacode || "";
        return codeA.localeCompare(codeB);
      });

    default:
      return sorted;
  }
}

/**
 * 북마크 목록 컴포넌트
 *
 * @example
 * ```tsx
 * <BookmarkList bookmarks={bookmarkItems} />
 * ```
 */
export function BookmarkList({ bookmarks }: BookmarkListProps) {
  const router = useRouter();
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 정렬된 목록 (useMemo로 메모이제이션)
  const sortedBookmarks = useMemo(
    () => sortBookmarks(bookmarks, sortOption),
    [bookmarks, sortOption]
  );

  // 선택 모드 활성화 여부
  const isSelectMode = selectedIds.size > 0;

  // 개별 항목 선택/해제
  const handleItemSelect = (contentId: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    if (checked) {
      newSelectedIds.add(contentId);
    } else {
      newSelectedIds.delete(contentId);
    }
    setSelectedIds(newSelectedIds);
  };

  // 삭제 완료 후 처리
  const handleDeleteComplete = () => {
    setSelectedIds(new Set());
    router.refresh();
  };

  // 개별 삭제 처리
  const handleItemDelete = (contentId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(contentId);
      return newSet;
    });
    router.refresh();
  };

  // 빈 상태 처리
  if (bookmarks.length === 0) {
    return <BookmarkEmpty />;
  }

  return (
    <div>
      {/* 헤더: 정렬 옵션 및 북마크 개수 */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="text-sm sm:text-base text-muted-foreground">
          총 {bookmarks.length}개의 북마크
        </div>
        <BookmarkSort value={sortOption} onValueChange={setSortOption} />
      </div>

      {/* 일괄 삭제 UI */}
      <BookmarkBulkActions
        selectedIds={selectedIds}
        allIds={sortedBookmarks.map((b) => b.contentid)}
        onSelectionChange={setSelectedIds}
        onDeleteComplete={handleDeleteComplete}
      />

      {/* 북마크 목록 그리드 */}
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="북마크 목록"
      >
        {sortedBookmarks.map((tour) => (
          <div key={tour.contentid} className="relative">
            {/* 체크박스 (선택 모드 활성화 시) */}
            {isSelectMode && (
              <div className="absolute left-2 top-2 z-20">
                <Checkbox
                  checked={selectedIds.has(tour.contentid)}
                  onCheckedChange={(checked) =>
                    handleItemSelect(tour.contentid, checked === true)
                  }
                  aria-label={`${tour.title} 선택`}
                  className="h-5 w-5 bg-background/90 backdrop-blur-sm border-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                />
              </div>
            )}
            <BookmarkCard
              tour={tour}
              onDelete={handleItemDelete}
              showDeleteButton={!isSelectMode}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
