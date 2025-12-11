/**
 * @file detail-map.tsx
 * @description 관광지 지도 섹션 컴포넌트
 *
 * 관광지의 위치를 지도에 표시합니다:
 * - 해당 관광지 위치 마커 표시
 * - 길찾기 버튼
 * - 좌표 정보 표시 (선택 사항)
 *
 * @dependencies
 * - lib/types/tour: TourDetail, convertKATECToWGS84
 * - next/script: 네이버 지도 스크립트 로드
 */

"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import type { TourDetail } from "@/lib/types/tour";
import { convertKATECToWGS84 } from "@/lib/types/tour";

interface DetailMapProps {
  /**
   * 관광지 상세 정보
   */
  detail: TourDetail;
}

/**
 * 관광지 지도 섹션 컴포넌트
 */
export function DetailMap({ detail }: DetailMapProps) {
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markerRef = useRef<naver.maps.Marker | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 좌표 변환
  const { lng, lat } = convertKATECToWGS84(detail.mapx, detail.mapy);

  // 네이버 지도 클라이언트 ID
  const naverMapClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  // 네이버 지도 초기화
  useEffect(() => {
    if (typeof window === "undefined" || !window.naver?.maps || !isMapLoaded) {
      return;
    }

    const mapOptions: naver.maps.MapOptions = {
      center: new window.naver.maps.LatLng(lat, lng),
      zoom: 15,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
      },
    };

    const map = new window.naver.maps.Map("detail-map", mapOptions);
    mapRef.current = map;

    // 마커 생성
    const marker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(lat, lng),
      map: map,
      title: detail.title,
    });
    markerRef.current = marker;

    // 인포윈도우 생성
    const infoWindow = new window.naver.maps.InfoWindow({
      content: `
        <div style="padding: 10px; min-width: 150px;">
          <strong>${detail.title}</strong>
          <p style="margin-top: 5px; font-size: 12px; color: #666;">${detail.addr1}</p>
        </div>
      `,
    });

    // 마커 클릭 시 인포윈도우 표시
    window.naver.maps.Event.addListener(marker, "click", () => {
      infoWindow.open(map, marker);
    });

    // 마커 클릭 시 인포윈도우 자동 표시
    infoWindow.open(map, marker);

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [lat, lng, detail.title, detail.addr1, isMapLoaded]);

  // 길찾기 URL 생성
  const directionsUrl = `https://map.naver.com/v5/directions/${lng},${lat}`;

  return (
    <>
      {/* 네이버 지도 스크립트 */}
      {naverMapClientId && (
        <Script
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverMapClientId}`}
          strategy="lazyOnload"
          onLoad={() => setIsMapLoaded(true)}
        />
      )}

      <section className="space-y-4" role="region" aria-label="위치 정보">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-xl font-semibold">위치</h2>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="min-h-[44px] gap-2"
          >
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="네이버 지도에서 길찾기 (새 창)"
            >
              길찾기
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* 지도 컨테이너 */}
        {!isMapLoaded ? (
          <div className="flex h-[300px] items-center justify-center rounded-lg border bg-muted md:h-[400px]">
            <Loading />
          </div>
        ) : (
          <div
            id="detail-map"
            role="application"
            aria-label={`${detail.title} 위치 지도`}
            className="h-[300px] w-full rounded-lg border bg-muted md:h-[400px]"
          />
        )}
      </section>
    </>
  );
}

