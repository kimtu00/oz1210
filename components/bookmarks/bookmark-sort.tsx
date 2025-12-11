/**
 * @file bookmark-sort.tsx
 * @description 북마크 정렬 옵션 컴포넌트
 *
 * 북마크 목록을 정렬하는 옵션을 제공하는 컴포넌트입니다.
 *
 * 정렬 옵션:
 * - 최신순 (created_at DESC) - 기본값
 * - 이름순 (가나다순) - title 기준
 * - 지역별 - areacode 기준
 *
 * @dependencies
 * - components/ui/select: Select 컴포넌트
 * - lucide-react: ArrowUpDown 아이콘
 */

"use client";

import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption = "latest" | "name" | "region";

interface BookmarkSortProps {
  /**
   * 현재 선택된 정렬 옵션
   */
  value: SortOption;
  /**
   * 정렬 옵션 변경 핸들러
   */
  onValueChange: (value: SortOption) => void;
}

/**
 * 북마크 정렬 옵션 컴포넌트
 *
 * @example
 * ```tsx
 * <BookmarkSort value="latest" onValueChange={handleSortChange} />
 * ```
 */
export function BookmarkSort({ value, onValueChange }: BookmarkSortProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[140px] sm:w-[160px] min-h-[44px]">
          <SelectValue placeholder="정렬" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">최신순</SelectItem>
          <SelectItem value="name">이름순</SelectItem>
          <SelectItem value="region">지역별</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

