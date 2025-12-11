/**
 * @file detail-intro.tsx
 * @description 관광지 운영 정보 섹션 컴포넌트
 *
 * 관광지의 운영 정보를 표시합니다:
 * - 이용시간/개장시간
 * - 휴무일
 * - 이용요금
 * - 주차 가능 여부
 * - 수용인원
 * - 체험 프로그램
 * - 유모차/반려동물 동반 가능 여부
 *
 * @dependencies
 * - lib/types/tour: TourIntro
 */

"use client";

import { Clock, Calendar, DollarSign, Car, Users, Baby, Heart } from "lucide-react";
import type { TourIntro } from "@/lib/types/tour";

interface DetailIntroProps {
  /**
   * 관광지 운영 정보
   */
  intro: TourIntro;
}

/**
 * 관광 타입별 운영 정보 필드 매핑
 */
function getIntroFields(contentTypeId: string) {
  const typeMap: Record<string, {
    usetime?: string;
    restdate?: string;
    parking?: string;
  }> = {
    "12": { // 관광지
      usetime: "usetime",
      restdate: "restdate",
      parking: "parking",
    },
    "14": { // 문화시설
      usetime: "usetimeculture",
      restdate: "restdateculture",
      parking: "parkingculture",
    },
    "28": { // 레포츠
      usetime: "usetimeleports",
      restdate: "restdateleports",
      parking: "parkingleports",
    },
    "32": { // 숙박
      usetime: "checkintime",
      restdate: "checkouttime",
      parking: "parkinglodging",
    },
    "38": { // 쇼핑
      usetime: "opentime",
      restdate: "restdateshopping",
      parking: "parkingshopping",
    },
    "39": { // 음식점
      usetime: "opentimefood",
      restdate: "restdatefood",
      parking: "parkingfood",
    },
  };

  return typeMap[contentTypeId] || {};
}

/**
 * 관광지 운영 정보 섹션 컴포넌트
 */
export function DetailIntro({ intro }: DetailIntroProps) {
  const fields = getIntroFields(intro.contenttypeid);
  
  // 이용시간/개장시간
  const usetime = fields.usetime 
    ? (intro as any)[fields.usetime]
    : null;
  
  // 휴무일
  const restdate = fields.restdate
    ? (intro as any)[fields.restdate]
    : null;
  
  // 주차
  const parking = fields.parking
    ? (intro as any)[fields.parking]
    : intro.parking;

  // 정보 항목 목록
  const infoItems: Array<{
    icon: React.ReactNode;
    label: string;
    value: string | undefined;
  }> = [];

  if (usetime) {
    infoItems.push({
      icon: <Clock className="h-5 w-5" />,
      label: "이용시간",
      value: usetime,
    });
  }

  if (restdate) {
    infoItems.push({
      icon: <Calendar className="h-5 w-5" />,
      label: "휴무일",
      value: restdate,
    });
  }

  if (parking) {
    infoItems.push({
      icon: <Car className="h-5 w-5" />,
      label: "주차",
      value: parking,
    });
  }

  if (intro.infocenter) {
    infoItems.push({
      icon: <Users className="h-5 w-5" />,
      label: "문의처",
      value: intro.infocenter,
    });
  }

  if (intro.chkpet) {
    infoItems.push({
      icon: <Heart className="h-5 w-5" />,
      label: "반려동물 동반",
      value: intro.chkpet,
    });
  }

  // 정보가 없으면 null 반환
  if (infoItems.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border bg-card p-4 shadow-sm md:p-6" role="region" aria-label="운영 정보">
      <h2 className="mb-4 text-xl font-semibold md:mb-6">운영 정보</h2>
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

