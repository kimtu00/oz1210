/**
 * @file sitemap.ts
 * @description 동적 sitemap 생성
 *
 * Next.js 15의 MetadataRoute.Sitemap을 사용하여 동적 sitemap을 생성합니다.
 *
 * 포함되는 페이지:
 * - 정적 페이지: /, /stats
 * - 동적 페이지: 관광지 상세페이지 (/places/[contentId])
 *   - 최대 1000개 관광지 포함
 *   - 각 지역별로 API 호출하여 관광지 수집
 *
 * @dependencies
 * - lib/api/tour-api: getAreaCode, getAreaBasedList
 */

import { MetadataRoute } from "next";
import { getAreaCode, getAreaBasedList } from "@/lib/api/tour-api";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://my-trip.vercel.app";
const MAX_TOUR_PAGES = 1000; // 최대 관광지 상세페이지 수

/**
 * 관광지 상세페이지 URL 목록 생성
 */
async function getTourDetailPages(): Promise<MetadataRoute.Sitemap> {
  const tourPages: MetadataRoute.Sitemap = [];
  
  try {
    // 지역코드 목록 조회
    const areaCodes = await getAreaCode();
    
    // 각 지역별로 관광지 수집 (병렬 처리)
    const promises = areaCodes.slice(0, 17).map(async (area) => { // 시/도만 (17개)
      try {
        // 각 지역에서 최대 60개씩 수집 (17개 지역 * 60개 = 1020개, 최대 1000개로 제한)
        const { items } = await getAreaBasedList({
          areaCode: area.code,
          numOfRows: 60,
          pageNo: 1,
        });
        
        return items.map((item) => ({
          url: `${BASE_URL}/places/${item.contentid}`,
          lastModified: item.modifiedtime 
            ? new Date(item.modifiedtime) 
            : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
      } catch (error) {
        console.error(`[Sitemap] Failed to fetch tours for area ${area.code}:`, error);
        return [];
      }
    });
    
    const results = await Promise.allSettled(promises);
    
    // 성공한 결과만 수집
    for (const result of results) {
      if (result.status === "fulfilled") {
        tourPages.push(...result.value);
        
        // 최대 개수 제한
        if (tourPages.length >= MAX_TOUR_PAGES) {
          tourPages.splice(MAX_TOUR_PAGES);
          break;
        }
      }
    }
  } catch (error) {
    console.error("[Sitemap] Failed to generate tour pages:", error);
  }
  
  return tourPages;
}

/**
 * Sitemap 생성
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/stats`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
  
  // 동적 페이지: 관광지 상세페이지
  const tourPages = await getTourDetailPages();
  
  return [...staticPages, ...tourPages];
}

