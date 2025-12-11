/**
 * @file bookmark-button.tsx
 * @description 북마크 버튼 컴포넌트
 *
 * 관광지를 북마크하거나 북마크를 해제하는 기능을 제공합니다.
 * - 별 아이콘 (채워짐/비어있음)
 * - 북마크 상태 확인
 * - 북마크 추가/제거 기능
 * - 인증된 사용자 확인 (Clerk)
 * - 로그인하지 않은 경우: 로그인 유도
 *
 * @dependencies
 * - @clerk/nextjs: SignedIn, SignedOut, SignInButton
 * - lib/api/supabase-api: getBookmark, addBookmark, removeBookmark
 * - sonner: toast 알림
 */

"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { checkBookmark, toggleBookmark } from "@/actions/bookmark";

interface BookmarkButtonProps {
  /**
   * 관광지 콘텐츠 ID
   */
  contentId: string;
}

/**
 * 북마크 버튼 컴포넌트
 */
export function BookmarkButton({ contentId }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 북마크 상태 확인
  useEffect(() => {
    async function loadBookmarkStatus() {
      try {
        const bookmarked = await checkBookmark(contentId);
        setIsBookmarked(bookmarked);
      } catch (error) {
        console.error("[BookmarkButton] Failed to check bookmark:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBookmarkStatus();
  }, [contentId]);

  // 북마크 토글
  const handleToggleBookmark = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await toggleBookmark(contentId, isBookmarked);
      if (result.success) {
        setIsBookmarked(result.isBookmarked);
        toast.success(
          result.isBookmarked
            ? "북마크에 추가되었습니다"
            : "북마크가 해제되었습니다"
        );
      } else {
        toast.error(result.error || "북마크 처리 중 오류가 발생했습니다");
      }
    } catch (error) {
      console.error("[BookmarkButton] Failed to toggle bookmark:", error);
      toast.error("북마크 처리 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SignedIn>
        <Button
          variant="outline"
          onClick={handleToggleBookmark}
          disabled={isLoading}
          className="min-h-[44px] gap-2"
          aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
          aria-pressed={isBookmarked}
        >
          <Star
            className={`h-4 w-4 ${
              isBookmarked
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
          {isBookmarked ? "북마크됨" : "북마크"}
        </Button>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="outline" className="min-h-[44px] gap-2" aria-label="북마크 (로그인 필요)">
            <Star className="h-4 w-4 text-muted-foreground" />
            북마크
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  );
}

