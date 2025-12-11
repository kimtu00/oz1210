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

/**
 * 북마크 삭제
 *
 * @param contentId - 삭제할 관광지 콘텐츠 ID
 * @returns 성공 여부
 */
export async function deleteBookmark(
  contentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await removeBookmark(contentId);
    return { success: result };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "북마크 삭제 중 오류가 발생했습니다";
    return { success: false, error: errorMessage };
  }
}

/**
 * 북마크 일괄 삭제
 *
 * @param contentIds - 삭제할 관광지 콘텐츠 ID 배열
 * @returns 성공 여부 및 삭제된 개수
 */
export async function removeBookmarksBatch(
  contentIds: string[]
): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  if (!contentIds || contentIds.length === 0) {
    return { success: false, deletedCount: 0, error: "삭제할 북마크가 없습니다" };
  }

  try {
    // 병렬 처리로 모든 북마크 삭제 시도
    const results = await Promise.allSettled(
      contentIds.map((contentId) => removeBookmark(contentId))
    );

    // 성공한 개수 계산
    const deletedCount = results.filter(
      (result) => result.status === "fulfilled" && result.value === true
    ).length;

    const failedCount = contentIds.length - deletedCount;

    if (deletedCount === 0) {
      return {
        success: false,
        deletedCount: 0,
        error: "북마크 삭제에 실패했습니다",
      };
    }

    if (failedCount > 0) {
      return {
        success: true,
        deletedCount,
        error: `${deletedCount}개 삭제되었지만, ${failedCount}개 삭제에 실패했습니다`,
      };
    }

    return { success: true, deletedCount };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "북마크 일괄 삭제 중 오류가 발생했습니다";
    return { success: false, deletedCount: 0, error: errorMessage };
  }
}


