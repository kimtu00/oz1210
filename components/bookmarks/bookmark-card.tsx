/**
 * @file bookmark-card.tsx
 * @description 북마크 카드 컴포넌트
 *
 * TourCard를 확장하여 삭제 버튼을 추가한 북마크 전용 카드 컴포넌트입니다.
 *
 * 주요 기능:
 * - TourCard 재사용
 * - 삭제 버튼 추가
 * - 삭제 확인 다이얼로그
 * - Optimistic update 지원
 *
 * @dependencies
 * - components/tour-card: TourCard
 * - components/ui/dialog: Dialog
 * - components/ui/button: Button
 * - actions/bookmark: removeBookmark
 * - sonner: toast
 */

"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TourCard } from "@/components/tour-card";
import { deleteBookmark } from "@/actions/bookmark";
import { toast } from "sonner";
import type { TourItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface BookmarkCardProps {
  /**
   * 관광지 데이터
   */
  tour: TourItem;
  /**
   * 삭제 콜백 (삭제 성공 시 호출)
   */
  onDelete?: (contentId: string) => void;
  /**
   * 삭제 버튼 표시 여부
   */
  showDeleteButton?: boolean;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 북마크 카드 컴포넌트
 *
 * @example
 * ```tsx
 * <BookmarkCard tour={tourItem} onDelete={handleDelete} />
 * ```
 */
export function BookmarkCard({
  tour,
  onDelete,
  showDeleteButton = true,
  className,
}: BookmarkCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteBookmark(tour.contentid);
      if (result.success) {
        toast.success("북마크가 삭제되었습니다");
        onDelete?.(tour.contentid);
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(result.error || "북마크 삭제에 실패했습니다");
      }
    } catch (error) {
      console.error("[BookmarkCard] Failed to delete bookmark:", error);
      toast.error("북마크 삭제 중 오류가 발생했습니다");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className={cn("group relative", className)}>
        <TourCard tour={tour} />
        {showDeleteButton && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 z-10 h-9 w-9 sm:h-8 sm:w-8 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={handleDeleteClick}
            aria-label={`${tour.title} 북마크 삭제`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleDeleteClick(e as any);
              }
            }}
          >
            <Trash2 className="h-4 w-4 sm:h-4 sm:w-4" />
          </Button>
        )}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>북마크 삭제</DialogTitle>
            <DialogDescription>
              정말 "{tour.title}" 북마크를 삭제하시겠습니까?
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

