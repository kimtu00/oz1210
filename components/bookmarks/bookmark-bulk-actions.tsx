/**
 * @file bookmark-bulk-actions.tsx
 * @description 북마크 일괄 삭제 UI 컴포넌트
 *
 * 체크박스 선택 및 일괄 삭제 기능을 제공하는 컴포넌트입니다.
 *
 * 주요 기능:
 * - 전체 선택/해제
 * - 개별 선택
 * - 선택된 항목 개수 표시
 * - 일괄 삭제 버튼
 * - 삭제 확인 다이얼로그
 *
 * @dependencies
 * - components/ui/checkbox: Checkbox
 * - components/ui/button: Button
 * - components/ui/dialog: Dialog
 * - actions/bookmark: removeBookmarksBatch
 * - sonner: toast
 */

"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { removeBookmarksBatch } from "@/actions/bookmark";
import { toast } from "sonner";

interface BookmarkBulkActionsProps {
  /**
   * 선택된 항목 ID 집합
   */
  selectedIds: Set<string>;
  /**
   * 전체 항목 ID 배열
   */
  allIds: string[];
  /**
   * 선택 상태 변경 핸들러
   */
  onSelectionChange: (selectedIds: Set<string>) => void;
  /**
   * 삭제 완료 콜백
   */
  onDeleteComplete?: () => void;
}

/**
 * 북마크 일괄 삭제 UI 컴포넌트
 *
 * @example
 * ```tsx
 * <BookmarkBulkActions
 *   selectedIds={selectedIds}
 *   allIds={allIds}
 *   onSelectionChange={setSelectedIds}
 *   onDeleteComplete={handleRefresh}
 * />
 * ```
 */
export function BookmarkBulkActions({
  selectedIds,
  allIds,
  onSelectionChange,
  onDeleteComplete,
}: BookmarkBulkActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedCount = selectedIds.size;
  const isAllSelected = selectedCount === allIds.length && allIds.length > 0;
  const isIndeterminate = selectedCount > 0 && selectedCount < allIds.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(new Set(allIds));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleDeleteClick = () => {
    if (selectedCount === 0) return;
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCount === 0) return;

    setIsDeleting(true);
    try {
      const contentIds = Array.from(selectedIds);
      const result = await removeBookmarksBatch(contentIds);

      if (result.success) {
        toast.success(`${result.deletedCount}개의 북마크가 삭제되었습니다`);
        if (result.error) {
          toast.warning(result.error);
        }
        onSelectionChange(new Set());
        onDeleteComplete?.();
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(result.error || "북마크 삭제에 실패했습니다");
      }
    } catch (error) {
      console.error("[BookmarkBulkActions] Failed to delete bookmarks:", error);
      toast.error("북마크 삭제 중 오류가 발생했습니다");
    } finally {
      setIsDeleting(false);
    }
  };

  if (allIds.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border bg-card p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Checkbox
            id="select-all"
            checked={isAllSelected}
            onCheckedChange={handleSelectAll}
            aria-label="전체 선택"
            className="h-5 w-5"
          />
          <label
            htmlFor="select-all"
            className="text-sm sm:text-base font-medium cursor-pointer min-h-[44px] flex items-center"
          >
            전체 선택
          </label>
          {selectedCount > 0 && (
            <span className="text-sm sm:text-base text-muted-foreground min-h-[44px] flex items-center">
              {selectedCount}개 선택됨
            </span>
          )}
        </div>
        {selectedCount > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="min-h-[44px] gap-2 w-full sm:w-auto"
            aria-label={`선택한 ${selectedCount}개 북마크 삭제`}
          >
            <Trash2 className="h-4 w-4 shrink-0" />
            <span className="truncate">삭제 ({selectedCount})</span>
          </Button>
        )}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>북마크 일괄 삭제</DialogTitle>
            <DialogDescription>
              선택한 {selectedCount}개의 북마크를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="min-h-[44px]"
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="min-h-[44px]"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

