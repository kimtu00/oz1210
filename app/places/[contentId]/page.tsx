/**
 * @file page.tsx
 * @description 관광지 상세페이지
 *
 * 주요 기능:
 * 1. 관광지 기본 정보 표시
 * 2. 운영 정보 표시
 * 3. 이미지 갤러리
 * 4. 지도 표시
 * 5. 공유 및 북마크 기능
 * 6. 반려동물 정보 표시
 * 7. 추천 관광지 섹션
 *
 * @dependencies
 * - lib/api/tour-api: getDetailCommon, getDetailIntro, getDetailImage, getDetailPetTour
 * - components/tour-detail/*: 각 섹션 컴포넌트들
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getDetailCommon, getDetailIntro, getDetailImage, getDetailPetTour } from "@/lib/api/tour-api";
import { DetailInfo } from "@/components/tour-detail/detail-info";
import { DetailIntro } from "@/components/tour-detail/detail-intro";
import { DetailGallery } from "@/components/tour-detail/detail-gallery";
import { DetailMap } from "@/components/tour-detail/detail-map";
import { DetailPetTour } from "@/components/tour-detail/detail-pet-tour";
import { DetailRecommendations } from "@/components/tour-detail/detail-recommendations";
import { ShareButton } from "@/components/tour-detail/share-button";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import type { Metadata } from "next";
import type { TourDetail } from "@/lib/types/tour";

/**
 * 상세페이지 메타데이터 생성
 */
async function generateMetadata({
  params,
}: {
  params: Promise<{ contentId: string }>;
}): Promise<Metadata> {
  const { contentId } = await params;
  
  try {
    const detail = await getDetailCommon(contentId);
    
    const description = detail.overview 
      ? detail.overview.substring(0, 100) 
      : `${detail.title} 관광지 정보`;
    const imageUrl = detail.firstimage;

    return {
      title: `${detail.title} - My Trip`,
      description,
      openGraph: {
        title: detail.title,
        description,
        images: imageUrl 
          ? [{ url: imageUrl, width: 1200, height: 630 }]
          : [],
        url: `https://my-trip.vercel.app/places/${contentId}`,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: detail.title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: "관광지 상세 - My Trip",
      description: "관광지 상세 정보를 확인하세요",
    };
  }
}

/**
 * 상세페이지 데이터 로드
 */
async function TourDetailData({
  contentId,
}: {
  contentId: string;
}) {
  try {
    // 병렬로 데이터 로드
    const [detail, intro, images, petInfo] = await Promise.all([
      getDetailCommon(contentId),
      getDetailCommon(contentId).then(async (d) => {
        try {
          return await getDetailIntro(d.contentid, d.contenttypeid);
        } catch {
          return null;
        }
      }),
      getDetailImage({ contentId, numOfRows: 20 }).catch(() => []),
      getDetailPetTour(contentId).catch(() => null),
    ]);

    return (
      <div className="space-y-8">
        {/* 기본 정보 섹션 */}
        <DetailInfo detail={detail} />

        {/* 액션 버튼 (공유, 북마크) */}
        <div className="flex gap-3">
          <ShareButton contentId={contentId} title={detail.title} />
          <BookmarkButton contentId={contentId} />
        </div>

        {/* 운영 정보 섹션 */}
        {intro && <DetailIntro intro={intro} />}

        {/* 이미지 갤러리 */}
        {images.length > 0 && <DetailGallery images={images} />}

        {/* 지도 섹션 */}
        <DetailMap detail={detail} />

        {/* 반려동물 정보 섹션 */}
        {petInfo && <DetailPetTour petInfo={petInfo} />}

        {/* 추천 관광지 섹션 */}
        <DetailRecommendations
          currentContentId={detail.contentid}
          contentTypeId={detail.contenttypeid}
        />
      </div>
    );
  } catch (error) {
    console.error("[TourDetailPage] Failed to fetch detail:", error);
    notFound();
  }
}

/**
 * 상세페이지 컴포넌트
 */
export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ contentId: string }>;
}) {
  const { contentId } = await params;

  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="container mx-auto max-w-5xl px-4 py-4 md:px-6 md:py-6">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="min-h-[44px] gap-2" aria-label="목록으로 돌아가기">
              <ArrowLeft className="h-4 w-4" />
              목록으로
            </Button>
          </Link>
        </div>

        {/* 상세 정보 */}
        <Suspense
          fallback={
            <div className="space-y-8">
              <div className="h-64 animate-pulse rounded-lg bg-muted" />
              <div className="h-32 animate-pulse rounded-lg bg-muted" />
              <div className="h-96 animate-pulse rounded-lg bg-muted" />
            </div>
          }
        >
          <TourDetailData contentId={contentId} />
        </Suspense>
      </div>
    </main>
  );
}

export { generateMetadata };

