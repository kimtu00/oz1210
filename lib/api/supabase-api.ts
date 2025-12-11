/**
 * @file supabase-api.ts
 * @description Supabase 데이터베이스 API 클라이언트
 *
 * 북마크 관련 데이터베이스 작업을 수행하는 함수들을 제공합니다.
 *
 * @dependencies
 * - lib/supabase/clerk-client: useClerkSupabaseClient (Client Component용)
 * - lib/supabase/server: createClerkSupabaseClient (Server Component용)
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

/**
 * 북마크 조회 (Server Component/Server Action용)
 *
 * @param contentId - 관광지 콘텐츠 ID
 * @returns 북마크 여부
 */
export async function getBookmark(contentId: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) {
    return false;
  }

  const supabase = createClerkSupabaseClient();

  // users 테이블에서 clerk_id로 사용자 조회
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (userError || !user) {
    return false;
  }

  // 북마크 조회
  const { data, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("content_id", contentId)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}

/**
 * 북마크 추가 (Server Action용)
 *
 * @param contentId - 관광지 콘텐츠 ID
 * @returns 성공 여부
 */
export async function addBookmark(contentId: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("로그인이 필요합니다");
  }

  const supabase = createClerkSupabaseClient();

  // users 테이블에서 clerk_id로 사용자 조회
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (userError || !user) {
    throw new Error("사용자를 찾을 수 없습니다");
  }

  // 북마크 추가
  const { error } = await supabase.from("bookmarks").insert({
    user_id: user.id,
    content_id: contentId,
  });

  if (error) {
    // 중복 북마크는 에러가 아닌 정상 케이스
    if (error.code === "23505") {
      return true;
    }
    throw error;
  }

  return true;
}

/**
 * 북마크 제거 (Server Action용)
 *
 * @param contentId - 관광지 콘텐츠 ID
 * @returns 성공 여부
 */
export async function removeBookmark(contentId: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("로그인이 필요합니다");
  }

  const supabase = createClerkSupabaseClient();

  // users 테이블에서 clerk_id로 사용자 조회
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (userError || !user) {
    throw new Error("사용자를 찾을 수 없습니다");
  }

  // 북마크 제거
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", user.id)
    .eq("content_id", contentId);

  if (error) {
    throw error;
  }

  return true;
}

/**
 * 사용자 북마크 목록 조회 (Server Component용)
 *
 * @returns 북마크된 관광지 콘텐츠 ID 목록
 */
export async function getUserBookmarks(): Promise<string[]> {
  const { userId } = await auth();
  if (!userId) {
    return [];
  }

  const supabase = createClerkSupabaseClient();

  // users 테이블에서 clerk_id로 사용자 조회
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (userError || !user) {
    return [];
  }

  // 북마크 목록 조회
  const { data, error } = await supabase
    .from("bookmarks")
    .select("content_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((item) => item.content_id);
}

/**
 * 북마크 항목 (created_at 정보 포함)
 */
interface BookmarkWithDate {
  contentId: string;
  createdAt: string; // ISO string
}

/**
 * 사용자 북마크 목록 조회 (관광지 정보 포함)
 *
 * 북마크된 관광지의 상세 정보를 조회하여 TourItem 형태로 반환합니다.
 * 일부 관광지 정보 조회 실패 시에도 성공한 항목만 반환합니다.
 * created_at 정보를 포함하여 정렬 기능을 지원합니다.
 *
 * @returns 북마크된 관광지 정보 목록 (TourItem[] 및 created_at 정보)
 */
export async function getUserBookmarksWithDetails(): Promise<
  (import("@/lib/types/tour").TourItem & { bookmarkCreatedAt?: string })[]
> {
  const { userId } = await auth();
  if (!userId) {
    return [];
  }

  const supabase = createClerkSupabaseClient();

  // users 테이블에서 clerk_id로 사용자 조회
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (userError || !user) {
    return [];
  }

  // 북마크 목록 조회 (created_at 포함)
  const { data: bookmarks, error: bookmarksError } = await supabase
    .from("bookmarks")
    .select("content_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (bookmarksError || !bookmarks) {
    return [];
  }

  if (bookmarks.length === 0) {
    return [];
  }

  // contentId와 created_at 매핑 생성
  const bookmarkMap = new Map<string, string>();
  bookmarks.forEach((bookmark) => {
    bookmarkMap.set(
      bookmark.content_id,
      bookmark.created_at || new Date().toISOString()
    );
  });

  const contentIds = bookmarks.map((b) => b.content_id);

  // 각 contentId로 관광지 정보 조회 (병렬 처리)
  const { getDetailCommon } = await import("@/lib/api/tour-api");
  const tourDetails = await Promise.allSettled(
    contentIds.map((contentId) => getDetailCommon(contentId))
  );

  // TourDetail을 TourItem으로 변환 (created_at 정보 포함)
  const tourItems: (import("@/lib/types/tour").TourItem & {
    bookmarkCreatedAt?: string;
  })[] = [];

  for (let i = 0; i < tourDetails.length; i++) {
    const result = tourDetails[i];
    if (result.status === "fulfilled") {
      const detail = result.value;
      const contentId = contentIds[i];
      // TourDetail을 TourItem으로 변환
      // areacode와 modifiedtime는 기본값 사용 (필수 필드)
      tourItems.push({
        contentid: detail.contentid,
        contenttypeid: detail.contenttypeid,
        title: detail.title,
        addr1: detail.addr1,
        addr2: detail.addr2,
        areacode: "", // detailCommon에는 areacode가 없으므로 빈 문자열
        mapx: detail.mapx,
        mapy: detail.mapy,
        firstimage: detail.firstimage,
        firstimage2: detail.firstimage2,
        tel: detail.tel,
        cat1: undefined,
        cat2: undefined,
        cat3: undefined,
        modifiedtime: new Date().toISOString().split("T")[0], // 현재 날짜 사용
        bookmarkCreatedAt: bookmarkMap.get(contentId), // 북마크 생성 시간
      });
    } else {
      // 일부 관광지 정보 조회 실패 시 로그만 기록
      console.error(
        `[getUserBookmarksWithDetails] Failed to fetch detail for contentId: ${contentIds[i]}`,
        result.reason
      );
    }
  }

  return tourItems;
}


