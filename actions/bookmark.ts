/**
 * @file bookmark.ts
 * @description 북마크 관련 Server Actions
 *
 * 북마크 추가/제거/조회를 위한 Server Actions입니다.
 *
 * @dependencies
 * - lib/api/supabase-api: getBookmark, addBookmark, removeBookmark
 */

"use server";

import { getBookmark, addBookmark, removeBookmark } from "@/lib/api/supabase-api";

/**
 * 북마크 상태 조회
 */
export async function checkBookmark(contentId: string): Promise<boolean> {
  try {
    return await getBookmark(contentId);
  } catch (error) {
    console.error("[checkBookmark] Failed:", error);
    return false;
  }
}

/**
 * 북마크 추가
 */
export async function toggleBookmark(
  contentId: string,
  isBookmarked: boolean
): Promise<{ success: boolean; isBookmarked: boolean; error?: string }> {
  try {
    if (isBookmarked) {
      await removeBookmark(contentId);
      return { success: true, isBookmarked: false };
    } else {
      await addBookmark(contentId);
      return { success: true, isBookmarked: true };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "북마크 처리 중 오류가 발생했습니다";
    return { success: false, isBookmarked, error: errorMessage };
  }
}


