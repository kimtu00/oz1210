/**
 * @file robots.ts
 * @description robots.txt 생성
 *
 * Next.js 15의 MetadataRoute.Robots를 사용하여 robots.txt를 생성합니다.
 *
 * 크롤링 규칙:
 * - 모든 크롤러 허용
 * - /bookmarks 경로 차단 (인증 필요)
 * - sitemap URL 포함
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://my-trip.vercel.app";

/**
 * robots.txt 생성
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/bookmarks"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

