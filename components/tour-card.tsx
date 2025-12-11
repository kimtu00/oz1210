/**
 * @file tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 개별 관광지 정보를 카드 형태로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * - 썸네일 이미지 표시 (기본 이미지 fallback)
 * - 관광지명, 주소, 타입 뱃지 표시
 * - 호버 효과 (scale, shadow)
 * - 클릭 시 상세페이지 이동
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - next/link: 페이지 이동
 * - lib/types/tour: TourItem 타입, getContentTypeName 함수
 */

"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { TourItem } from "@/lib/types/tour";
import { getContentTypeName } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourCardProps {
  /**
   * 관광지 데이터
   */
  tour: TourItem;
  /**
   * 추가 클래스명
   */
  className?: string;
  /**
   * 선택된 상태 (지도 연동용)
   */
  isSelected?: boolean;
  /**
   * 클릭 핸들러 (지도 연동용)
   */
  onClick?: () => void;
}

/**
 * 관광지 카드 컴포넌트
 *
 * @example
 * ```tsx
 * <TourCard tour={tourItem} />
 * ```
 */
export function TourCard({
  tour,
  className,
  isSelected = false,
  onClick,
}: TourCardProps) {
  // 이미지 URL 결정 (useMemo로 메모이제이션)
  const imageUrl = useMemo(
    () => tour.firstimage || tour.firstimage2 || null,
    [tour.firstimage, tour.firstimage2]
  );

  // 상세페이지 URL (useMemo로 메모이제이션)
  const detailUrl = useMemo(
    () => `/places/${tour.contentid}`,
    [tour.contentid]
  );

  // 관광 타입 이름 (useMemo로 메모이제이션)
  const contentTypeName = useMemo(
    () => getContentTypeName(tour.contenttypeid),
    [tour.contenttypeid]
  );

  // 주소 (addr1 + addr2) (useMemo로 메모이제이션)
  const address = useMemo(
    () => tour.addr2 ? `${tour.addr1} ${tour.addr2}` : tour.addr1,
    [tour.addr1, tour.addr2]
  );

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      // 지도 연동: 지도 이동만 하고 상세페이지 이동은 기본 동작 사용
      onClick();
    }
    // onClick이 없으면 기본 Link 동작 (상세페이지 이동)
  };

  return (
    <Link
      href={detailUrl}
      onClick={handleClick}
      className={cn(
        "group block overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isSelected && "ring-2 ring-primary border-primary shadow-lg",
        className
      )}
      aria-label={`${tour.title} 상세보기`}
    >
      {/* 썸네일 이미지 */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${tour.title} 이미지`}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            unoptimized // 외부 이미지이므로 최적화 비활성화
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <MapPin className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* 카드 내용 */}
      <div className="p-3 sm:p-4">
        {/* 관광 타입 뱃지 */}
        <div className="mb-1.5 sm:mb-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-medium text-primary">
            {contentTypeName}
          </span>
        </div>

        {/* 관광지명 */}
        <h3 className="mb-2 line-clamp-2 text-base sm:text-lg font-semibold leading-tight group-hover:text-primary">
          {tour.title}
        </h3>

        {/* 주소 */}
        <div className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-muted-foreground" />
          <p className="line-clamp-2 text-xs sm:text-sm text-muted-foreground">
            {address}
          </p>
        </div>
      </div>
    </Link>
  );
}

