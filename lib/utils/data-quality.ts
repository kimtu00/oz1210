/**
 * @file data-quality.ts
 * @description 데이터 품질 검증 유틸리티
 *
 * API 응답 데이터의 품질을 검증하고 누락된 정보를 감지합니다.
 */

import type { TourItem, TourDetail } from "@/lib/types/tour";

/**
 * 데이터 품질 이슈 타입
 */
export interface DataQualityIssue {
  contentId: string;
  type: "missing_image" | "missing_address" | "missing_coordinates" | "invalid_coordinates";
  severity: "low" | "medium" | "high";
  message: string;
}

/**
 * 관광지 목록 데이터 품질 검증
 *
 * @param items - 검증할 관광지 목록
 * @returns 발견된 품질 이슈 목록
 */
export function validateTourItemsQuality(items: TourItem[]): DataQualityIssue[] {
  const issues: DataQualityIssue[] = [];

  items.forEach((item) => {
    // 이미지 누락 확인
    if (!item.firstimage && !item.firstimage2) {
      issues.push({
        contentId: item.contentid,
        type: "missing_image",
        severity: "low",
        message: `관광지 "${item.title}"에 이미지가 없습니다.`,
      });
    }

    // 주소 누락 확인
    if (!item.addr1 || item.addr1.trim() === "") {
      issues.push({
        contentId: item.contentid,
        type: "missing_address",
        severity: "high",
        message: `관광지 "${item.title}"에 주소가 없습니다.`,
      });
    }

    // 좌표 누락 또는 유효하지 않은 좌표 확인
    if (!item.mapx || !item.mapy) {
      issues.push({
        contentId: item.contentid,
        type: "missing_coordinates",
        severity: "high",
        message: `관광지 "${item.title}"에 좌표가 없습니다.`,
      });
    } else {
      // 좌표 유효성 검증 (KATEC 좌표계 범위)
      const mapx = parseFloat(item.mapx);
      const mapy = parseFloat(item.mapy);

      // 한국 경도 범위: 약 124 ~ 132
      // 한국 위도 범위: 약 33 ~ 43
      // KATEC 좌표계는 10,000,000을 곱한 값이므로:
      // 경도: 1,240,000,000 ~ 1,320,000,000
      // 위도: 330,000,000 ~ 430,000,000
      if (
        mapx < 1240000000 ||
        mapx > 1320000000 ||
        mapy < 330000000 ||
        mapy > 430000000
      ) {
        issues.push({
          contentId: item.contentid,
          type: "invalid_coordinates",
          severity: "high",
          message: `관광지 "${item.title}"의 좌표가 유효하지 않습니다. (mapx: ${item.mapx}, mapy: ${item.mapy})`,
        });
      }
    }
  });

  return issues;
}

/**
 * 관광지 상세 정보 데이터 품질 검증
 *
 * @param detail - 검증할 관광지 상세 정보
 * @returns 발견된 품질 이슈 목록
 */
export function validateTourDetailQuality(detail: TourDetail): DataQualityIssue[] {
  const issues: DataQualityIssue[] = [];

  // 이미지 누락 확인
  if (!detail.firstimage && !detail.firstimage2) {
    issues.push({
      contentId: detail.contentid,
      type: "missing_image",
      severity: "low",
      message: `관광지 "${detail.title}"에 이미지가 없습니다.`,
    });
  }

  // 주소 누락 확인
  if (!detail.addr1 || detail.addr1.trim() === "") {
    issues.push({
      contentId: detail.contentid,
      type: "missing_address",
      severity: "high",
      message: `관광지 "${detail.title}"에 주소가 없습니다.`,
    });
  }

  // 좌표 누락 또는 유효하지 않은 좌표 확인
  if (!detail.mapx || !detail.mapy) {
    issues.push({
      contentId: detail.contentid,
      type: "missing_coordinates",
      severity: "high",
      message: `관광지 "${detail.title}"에 좌표가 없습니다.`,
    });
  } else {
    const mapx = parseFloat(detail.mapx);
    const mapy = parseFloat(detail.mapy);

    if (
      mapx < 1240000000 ||
      mapx > 1320000000 ||
      mapy < 330000000 ||
      mapy > 430000000
    ) {
      issues.push({
        contentId: detail.contentid,
        type: "invalid_coordinates",
        severity: "high",
        message: `관광지 "${detail.title}"의 좌표가 유효하지 않습니다.`,
      });
    }
  }

  return issues;
}

/**
 * 데이터 품질 통계
 */
export interface DataQualityStats {
  totalItems: number;
  itemsWithImages: number;
  itemsWithAddress: number;
  itemsWithValidCoordinates: number;
  issues: DataQualityIssue[];
  qualityScore: number; // 0-100
}

/**
 * 관광지 목록의 데이터 품질 통계 계산
 *
 * @param items - 분석할 관광지 목록
 * @returns 데이터 품질 통계
 */
export function calculateDataQualityStats(items: TourItem[]): DataQualityStats {
  const issues = validateTourItemsQuality(items);
  const totalItems = items.length;

  if (totalItems === 0) {
    return {
      totalItems: 0,
      itemsWithImages: 0,
      itemsWithAddress: 0,
      itemsWithValidCoordinates: 0,
      issues: [],
      qualityScore: 100,
    };
  }

  const itemsWithImages = items.filter(
    (item) => item.firstimage || item.firstimage2
  ).length;
  const itemsWithAddress = items.filter(
    (item) => item.addr1 && item.addr1.trim() !== ""
  ).length;
  const itemsWithValidCoordinates = items.filter((item) => {
    if (!item.mapx || !item.mapy) return false;
    const mapx = parseFloat(item.mapx);
    const mapy = parseFloat(item.mapy);
    return (
      mapx >= 1240000000 &&
      mapx <= 1320000000 &&
      mapy >= 330000000 &&
      mapy <= 430000000
    );
  }).length;

  // 품질 점수 계산 (각 항목별 가중치)
  const imageScore = (itemsWithImages / totalItems) * 20; // 20점
  const addressScore = (itemsWithAddress / totalItems) * 30; // 30점
  const coordinateScore = (itemsWithValidCoordinates / totalItems) * 50; // 50점
  const qualityScore = Math.round(imageScore + addressScore + coordinateScore);

  return {
    totalItems,
    itemsWithImages,
    itemsWithAddress,
    itemsWithValidCoordinates,
    issues,
    qualityScore,
  };
}

/**
 * 개발 환경에서 데이터 품질 이슈 로깅
 */
export function logDataQualityIssues(issues: DataQualityIssue[]) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  if (issues.length === 0) {
    return;
  }

  console.group("[Data Quality Issues]");
  issues.forEach((issue) => {
    const emoji = issue.severity === "high" ? "🔴" : issue.severity === "medium" ? "🟡" : "🟢";
    console.warn(`${emoji} ${issue.message}`);
  });
  console.groupEnd();
}


