/**
 * @file detail-pet-tour.tsx
 * @description 반려동물 동반 여행 정보 섹션 컴포넌트
 *
 * 반려동물 동반 여행 정보를 표시합니다:
 * - 반려동물 동반 가능 여부
 * - 반려동물 크기 제한 정보
 * - 반려동물 입장 가능 장소 (실내/실외)
 * - 반려동물 동반 추가 요금
 * - 반려동물 전용 시설 정보
 *
 * @dependencies
 * - lib/types/tour: PetTourInfo
 */

"use client";

import { Heart, Ruler, MapPin, DollarSign, Info } from "lucide-react";
import type { PetTourInfo } from "@/lib/types/tour";

interface DetailPetTourProps {
  /**
   * 반려동물 정보
   */
  petInfo: PetTourInfo;
}

/**
 * 반려동물 동반 여행 정보 섹션 컴포넌트
 */
export function DetailPetTour({ petInfo }: DetailPetTourProps) {
  // 정보 항목 목록
  const infoItems: Array<{
    icon: React.ReactNode;
    label: string;
    value: string | undefined;
  }> = [];

  if (petInfo.chkpetleash) {
    infoItems.push({
      icon: <Heart className="h-5 w-5" />,
      label: "반려동물 동반",
      value: petInfo.chkpetleash,
    });
  }

  if (petInfo.chkpetsize) {
    infoItems.push({
      icon: <Ruler className="h-5 w-5" />,
      label: "반려동물 크기",
      value: petInfo.chkpetsize,
    });
  }

  if (petInfo.chkpetplace) {
    infoItems.push({
      icon: <MapPin className="h-5 w-5" />,
      label: "입장 가능 장소",
      value: petInfo.chkpetplace,
    });
  }

  if (petInfo.chkpetfee) {
    infoItems.push({
      icon: <DollarSign className="h-5 w-5" />,
      label: "추가 요금",
      value: petInfo.chkpetfee,
    });
  }

  if (petInfo.petinfo) {
    infoItems.push({
      icon: <Info className="h-5 w-5" />,
      label: "기타 정보",
      value: petInfo.petinfo,
    });
  }

  if (petInfo.parking) {
    infoItems.push({
      icon: <MapPin className="h-5 w-5" />,
      label: "주차장 정보",
      value: petInfo.parking,
    });
  }

  // 정보가 없으면 null 반환
  if (infoItems.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border bg-card p-4 shadow-sm md:p-6" role="region" aria-label="반려동물 동반 정보">
      <div className="mb-4 flex items-center gap-2 md:mb-6">
        <Heart className="h-5 w-5 text-primary md:h-6 md:w-6" />
        <h2 className="text-xl font-semibold">반려동물 동반 정보</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0 text-muted-foreground">
              {item.icon}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground md:text-sm">
                {item.label}
              </p>
              <p className="mt-1 text-sm md:text-base">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

