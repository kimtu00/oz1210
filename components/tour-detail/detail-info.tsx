/**
 * @file detail-info.tsx
 * @description 관광지 기본 정보 섹션 컴포넌트
 *
 * 관광지의 기본 정보를 표시합니다:
 * - 관광지명
 * - 대표 이미지
 * - 주소 (복사 기능)
 * - 전화번호
 * - 홈페이지
 * - 개요
 * - 관광 타입 뱃지
 *
 * @dependencies
 * - lib/types/tour: TourDetail, getContentTypeName
 * - next/image: 이미지 최적화
 * - components/ui/button: 복사 버튼
 */

"use client";

import Image from "next/image";
import { MapPin, Phone, Globe, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { TourDetail } from "@/lib/types/tour";
import { getContentTypeName } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface DetailInfoProps {
  /**
   * 관광지 상세 정보
   */
  detail: TourDetail;
}

/**
 * 관광지 기본 정보 섹션 컴포넌트
 */
export function DetailInfo({ detail }: DetailInfoProps) {
  const [copied, setCopied] = useState(false);

  // 주소 복사 기능
  const handleCopyAddress = async () => {
    const address = detail.addr2
      ? `${detail.addr1} ${detail.addr2}`
      : detail.addr1;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("주소가 복사되었습니다");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("주소 복사에 실패했습니다");
    }
  };

  // 이미지 URL 결정
  const imageUrl = detail.firstimage || detail.firstimage2 || null;

  // 주소 (addr1 + addr2)
  const address = detail.addr2
    ? `${detail.addr1} ${detail.addr2}`
    : detail.addr1;

  // 관광 타입 이름
  const contentTypeName = getContentTypeName(detail.contenttypeid);

  return (
    <section className="space-y-6" role="region" aria-label="관광지 기본 정보">
      {/* 관광지명 및 타입 */}
      <div>
        <div className="mb-3">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {contentTypeName}
          </span>
        </div>
        <h1 className="text-3xl font-bold leading-tight md:text-4xl">
          {detail.title}
        </h1>
      </div>

      {/* 대표 이미지 */}
      {imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={imageUrl}
            alt={detail.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
            unoptimized
          />
        </div>
      )}

      {/* 기본 정보 카드 */}
      <div className="rounded-lg border bg-card p-4 shadow-sm md:p-6">
        <div className="space-y-4">
          {/* 주소 */}
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground md:text-sm">주소</p>
              <p className="mt-1 text-sm md:text-base">{address}</p>
              {detail.zipcode && (
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                  우편번호: {detail.zipcode}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAddress}
              className="min-h-[44px] shrink-0 min-w-[44px]"
              aria-label="주소 복사"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* 전화번호 */}
          {detail.tel && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground md:text-sm">
                  전화번호
                </p>
                <a
                  href={`tel:${detail.tel}`}
                  className="mt-1 text-sm hover:text-primary md:text-base"
                  aria-label={`${detail.tel}로 전화하기`}
                >
                  {detail.tel}
                </a>
              </div>
            </div>
          )}

          {/* 홈페이지 */}
          {detail.homepage && (
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground md:text-sm">
                  홈페이지
                </p>
                <a
                  href={detail.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 break-all text-sm text-primary hover:underline md:text-base"
                  aria-label={`${detail.title} 홈페이지 열기 (새 창)`}
                >
                  {detail.homepage}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 개요 */}
      {detail.overview && (
        <div className="rounded-lg border bg-card p-4 shadow-sm md:p-6">
          <h2 className="mb-4 text-xl font-semibold">개요</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground md:text-base">
            {detail.overview}
          </p>
        </div>
      )}
    </section>
  );
}

