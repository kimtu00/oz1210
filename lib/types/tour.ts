/**
 * @file tour.ts
 * @description 한국관광공사 API 관광지 관련 타입 정의
 *
 * 한국관광공사 공공 API (KorService2)의 응답 데이터 구조를 정의합니다.
 * API 문서: https://www.data.go.kr/data/15101578/openapi.do
 */

/**
 * 관광지 목록 항목 (areaBasedList2, searchKeyword2 응답)
 */
export interface TourItem {
  addr1: string; // 주소
  addr2?: string; // 상세주소
  areacode: string; // 지역코드
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 콘텐츠타입ID
  title: string; // 제목
  mapx: string; // 경도 (KATEC 좌표계, 정수형)
  mapy: string; // 위도 (KATEC 좌표계, 정수형)
  firstimage?: string; // 대표이미지1
  firstimage2?: string; // 대표이미지2
  tel?: string; // 전화번호
  cat1?: string; // 대분류
  cat2?: string; // 중분류
  cat3?: string; // 소분류
  modifiedtime: string; // 수정일
}

/**
 * 관광지 상세 정보 (detailCommon2 응답)
 */
export interface TourDetail {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2?: string;
  zipcode?: string;
  tel?: string;
  homepage?: string;
  overview?: string; // 개요 (긴 설명)
  firstimage?: string;
  firstimage2?: string;
  mapx: string; // 경도 (KATEC 좌표계)
  mapy: string; // 위도 (KATEC 좌표계)
}

/**
 * 관광지 운영 정보 (detailIntro2 응답)
 *
 * 타입별로 필드가 다르므로 선택적 필드로 정의합니다.
 * 주요 필드:
 * - 관광지(12): usetime, restdate, parking, chkpet
 * - 문화시설(14): usetimeculture, restdateculture, parkingculture
 * - 축제/행사(15): eventstartdate, eventenddate, eventplace
 * - 여행코스(25): distance, taketime, schedule
 * - 레포츠(28): usetimeleports, restdateleports, parkingleports
 * - 숙박(32): checkintime, checkouttime, parkinglodging
 * - 쇼핑(38): opentime, restdateshopping, parkingshopping
 * - 음식점(39): opentimefood, restdatefood, parkingfood
 */
export interface TourIntro {
  contentid: string;
  contenttypeid: string;
  // 공통 필드
  infocenter?: string; // 문의처
  parking?: string; // 주차 가능
  chkpet?: string; // 반려동물 동반
  // 타입별 필드 (선택적)
  usetime?: string; // 이용시간 (관광지)
  restdate?: string; // 휴무일 (관광지)
  usetimeculture?: string; // 이용시간 (문화시설)
  restdateculture?: string; // 휴무일 (문화시설)
  eventstartdate?: string; // 행사 시작일 (축제/행사)
  eventenddate?: string; // 행사 종료일 (축제/행사)
  eventplace?: string; // 행사 장소 (축제/행사)
  distance?: string; // 거리 (여행코스)
  taketime?: string; // 소요시간 (여행코스)
  schedule?: string; // 일정 (여행코스)
  usetimeleports?: string; // 이용시간 (레포츠)
  restdateleports?: string; // 휴무일 (레포츠)
  parkingleports?: string; // 주차 (레포츠)
  checkintime?: string; // 체크인 시간 (숙박)
  checkouttime?: string; // 체크아웃 시간 (숙박)
  parkinglodging?: string; // 주차 (숙박)
  opentime?: string; // 영업시간 (쇼핑/음식점)
  restdateshopping?: string; // 휴무일 (쇼핑)
  parkingshopping?: string; // 주차 (쇼핑)
  opentimefood?: string; // 영업시간 (음식점)
  restdatefood?: string; // 휴무일 (음식점)
  parkingfood?: string; // 주차 (음식점)
}

/**
 * 관광지 이미지 정보 (detailImage2 응답)
 */
export interface TourImage {
  contentid: string;
  originimgurl: string; // 원본 이미지 URL
  serialnum: string; // 이미지 일련번호
  smallimageurl?: string; // 썸네일 이미지 URL
}

/**
 * 반려동물 동반 여행 정보 (detailPetTour2 응답)
 */
export interface PetTourInfo {
  contentid: string;
  contenttypeid: string;
  chkpetleash?: string; // 애완동물 동반 여부
  chkpetsize?: string; // 애완동물 크기
  chkpetplace?: string; // 입장 가능 장소 (실내/실외)
  chkpetfee?: string; // 추가 요금
  petinfo?: string; // 기타 반려동물 정보
  parking?: string; // 주차장 정보
}

/**
 * 지역 코드 정보 (areaCode2 응답)
 */
export interface AreaCode {
  code: string; // 지역코드
  name: string; // 지역명
  rnum: number; // 순번
}

/**
 * KATEC 좌표를 WGS84 좌표로 변환합니다.
 *
 * 한국관광공사 API는 KATEC 좌표계를 사용하며,
 * 정수형으로 저장되어 있습니다 (예: 1281234567).
 * 이를 WGS84 좌표로 변환하려면 10,000,000으로 나눕니다.
 *
 * @param mapx - KATEC 경도 (문자열)
 * @param mapy - KATEC 위도 (문자열)
 * @returns WGS84 좌표 (lng: 경도, lat: 위도)
 *
 * @example
 * ```ts
 * const { lng, lat } = convertKATECToWGS84("1281234567", "3756789012");
 * // { lng: 128.1234567, lat: 37.56789012 }
 * ```
 */
export function convertKATECToWGS84(
  mapx: string,
  mapy: string
): { lng: number; lat: number } {
  return {
    lng: parseFloat(mapx) / 10000000,
    lat: parseFloat(mapy) / 10000000,
  };
}

/**
 * 관광 타입 ID와 이름 매핑
 */
export const CONTENT_TYPE_MAP: Record<string, string> = {
  "12": "관광지",
  "14": "문화시설",
  "15": "축제/행사",
  "25": "여행코스",
  "28": "레포츠",
  "32": "숙박",
  "38": "쇼핑",
  "39": "음식점",
} as const;

/**
 * 관광 타입 ID로 이름을 가져옵니다.
 *
 * @param contentTypeId - 관광 타입 ID
 * @returns 관광 타입 이름 (없으면 "기타")
 */
export function getContentTypeName(contentTypeId: string): string {
  return CONTENT_TYPE_MAP[contentTypeId] || "기타";
}


