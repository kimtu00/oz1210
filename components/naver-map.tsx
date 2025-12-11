/**
 * @file naver-map.tsx
 * @description 네이버 지도 컴포넌트
 *
 * 관광지 목록을 네이버 지도에 마커로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * - Naver Maps API v3 초기화
 * - 관광지 마커 표시
 * - 마커 클릭 시 인포윈도우
 * - 지도-리스트 연동
 * - 지도 컨트롤 (줌, 지도 유형)
 *
 * @dependencies
 * - lib/types/tour: TourItem 타입, convertKATECToWGS84 함수
 * - lib/types/naver-maps: 네이버 지도 타입 정의
 */

"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { ZoomIn, ZoomOut, Map as MapIcon, Satellite } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import type { TourItem } from "@/lib/types/tour";
import { convertKATECToWGS84, getContentTypeName } from "@/lib/types/tour";
import {
  naverMapMetricsStore,
  validateCoordinateConversion,
  validateNcpKeyId,
} from "@/lib/utils/naver-map-metrics";
import { cn } from "@/lib/utils";

interface NaverMapProps {
  /**
   * 표시할 관광지 목록
   */
  tours: TourItem[];
  /**
   * 선택된 관광지 ID (리스트 연동용)
   */
  selectedTourId?: string;
  /**
   * 관광지 선택 핸들러
   */
  onTourSelect?: (tourId: string) => void;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 네이버 지도 컴포넌트
 */
export function NaverMap({
  tours,
  selectedTourId,
  onTourSelect,
  className,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<"normal" | "satellite">("normal");
  const loadCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 네이버 지도 API 키
  const naverMapKey = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  // ncpKeyId 파라미터 검증 (개발 환경)
  if (process.env.NODE_ENV === "development") {
    const keyValidation = validateNcpKeyId(naverMapKey);
    if (!keyValidation.isValid) {
      console.warn(`[NaverMap] ${keyValidation.error}`);
    }
  }

  // window.naver 초기화 확인 (별도 useEffect)
  useEffect(() => {
    if (!isMapLoaded || typeof window === 'undefined') {
      return;
    }

    // 이미 window.naver가 준비되어 있으면 종료
    if (window.naver?.maps?.Map) {
      return;
    }

    // window.naver가 아직 초기화되지 않은 경우 재시도
    let retryCount = 0;
    const maxRetries = 10;
    
    loadCheckIntervalRef.current = setInterval(() => {
      retryCount++;
      
      if (window.naver?.maps?.Map) {
        // 초기화 완료 - interval 정리만 하고 종료
        // 지도 초기화는 아래 useEffect에서 처리
        if (loadCheckIntervalRef.current) {
          clearInterval(loadCheckIntervalRef.current);
          loadCheckIntervalRef.current = null;
        }
      } else if (retryCount >= maxRetries) {
        // 재시도 실패
        if (loadCheckIntervalRef.current) {
          clearInterval(loadCheckIntervalRef.current);
          loadCheckIntervalRef.current = null;
        }
        setMapError('네이버 지도 API를 초기화할 수 없습니다. 페이지를 새로고침해주세요.');
        console.error('[NaverMap] Failed to initialize window.naver after retries');
      }
    }, 500);

    return () => {
      if (loadCheckIntervalRef.current) {
        clearInterval(loadCheckIntervalRef.current);
        loadCheckIntervalRef.current = null;
      }
    };
  }, [isMapLoaded]);

  // 지도 초기화
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || typeof window === 'undefined') {
      return;
    }

    // window.naver가 준비되었는지 확인
    if (!window.naver || !window.naver.maps || !window.naver.maps.Map) {
      return;
    }

    // 지도 로딩 시작 시간 기록
    naverMapMetricsStore.startLoad();

    // 기본 중심 좌표 (서울)
    const defaultCenter = new window.naver.maps.LatLng(37.5665, 126.9780);
    const defaultZoom = 10;

    // 관광지가 있으면 중심 좌표 계산
    let center = defaultCenter;
    let zoom = defaultZoom;

    if (tours.length > 0) {
      const bounds = new window.naver.maps.LatLngBounds();
      let hasValidBounds = false;
      
      tours.forEach((tour) => {
        try {
          const { lat, lng } = convertKATECToWGS84(tour.mapx, tour.mapy);
          // 좌표 유효성 검사 (0,0 좌표 제외)
          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            bounds.extend(new window.naver.maps.LatLng(lat, lng));
            hasValidBounds = true;
          }
        } catch (error) {
          console.error(`[NaverMap] Failed to convert coordinates for ${tour.contentid}:`, error);
        }
      });

      if (hasValidBounds) {
        try {
          const sw = bounds.getSW();
          const ne = bounds.getNE();
          // 중심점 계산
          center = new window.naver.maps.LatLng(
            (sw.lat() + ne.lat()) / 2,
            (sw.lng() + ne.lng()) / 2
          );
        } catch (error) {
          console.error("[NaverMap] Failed to calculate center from bounds:", error);
        }
      }
    }

    // 지도 생성
    const map = new window.naver.maps.Map(mapRef.current, {
      center,
      zoom,
      minZoom: 6,
      maxZoom: 18,
      mapTypeId: window.naver.maps.MapTypeId.NORMAL,
      zoomControl: false, // 커스텀 컨트롤 사용
      mapTypeControl: false, // 커스텀 컨트롤 사용
    });

    mapInstanceRef.current = map;

    // 지도 초기화 후 약간의 지연을 두고 resize 이벤트 트리거 (지도가 완전히 렌더링되도록)
    const initTimeout = setTimeout(() => {
      if (map && window.naver && window.naver.maps && window.naver.maps.Event) {
        try {
          window.naver.maps.Event.trigger(map, 'resize');
        } catch (error) {
          console.warn('[NaverMap] Failed to trigger initial resize event:', error);
        }
      }
    }, 100);

    // 지도 리사이즈 (컨테이너 크기 변경 시)
    // 네이버 지도 API v3는 자동으로 리사이즈를 감지하지만, 
    // 명시적으로 resize 이벤트를 트리거하기 위해 ResizeObserver 사용
    let resizeObserver: ResizeObserver | null = null;
    
    if (typeof ResizeObserver !== 'undefined' && mapRef.current) {
      resizeObserver = new ResizeObserver(() => {
        // 네이버 지도 API가 완전히 로드된 후에만 resize 이벤트 트리거
        if (map && window.naver && window.naver.maps && window.naver.maps.Event) {
          try {
            window.naver.maps.Event.trigger(map, 'resize');
          } catch (error) {
            // 에러가 발생해도 무시 (지도는 자동으로 리사이즈를 감지함)
            console.warn('[NaverMap] Failed to trigger resize event:', error);
          }
        }
      });

      resizeObserver.observe(mapRef.current);
    }

    // 지도 로딩 완료 시간 기록
    naverMapMetricsStore.endLoad();

    return () => {
      clearTimeout(initTimeout);
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
      if (loadCheckIntervalRef.current) {
        clearInterval(loadCheckIntervalRef.current);
        loadCheckIntervalRef.current = null;
      }
    };
  }, [isMapLoaded, tours.length]);

  // 마커 생성 및 업데이트
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || tours.length === 0) {
      // 기존 마커 제거
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      return;
    }

    const map = mapInstanceRef.current;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 새 마커 생성
    tours.forEach((tour) => {
      try {
        // 좌표 변환 정확성 검증 (개발 환경)
        if (process.env.NODE_ENV === "development") {
          const validation = validateCoordinateConversion(tour.mapx, tour.mapy);
          if (!validation.isValid) {
            console.warn(
              `[NaverMap] Invalid coordinates for ${tour.contentid}:`,
              validation.errors
            );
          }
        }

        const { lat, lng } = convertKATECToWGS84(tour.mapx, tour.mapy);
        const position = new window.naver.maps.LatLng(lat, lng);

        // 마커 생성 메트릭 기록
        naverMapMetricsStore.add({
          timestamp: Date.now(),
          action: "marker_create",
          markerCount: markersRef.current.length + 1,
        });

        const marker = new window.naver.maps.Marker({
          position,
          map,
          title: tour.title,
          zIndex: selectedTourId === tour.contentid ? 1000 : 100,
        });

        // 마커 클릭 이벤트
        window.naver.maps.Event.addListener(marker, "click", () => {
          // 인포윈도우 생성 또는 업데이트
          if (!infoWindowRef.current) {
            infoWindowRef.current = new window.naver.maps.InfoWindow({
              maxWidth: 300,
            });
          }

          const contentTypeName = getContentTypeName(tour.contenttypeid);
          const address = tour.addr2 ? `${tour.addr1} ${tour.addr2}` : tour.addr1;

          const content = `
            <div style="padding: 12px; min-width: 200px;">
              <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
                ${tour.title}
              </div>
              <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
                <span style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px; font-size: 11px;">
                  ${contentTypeName}
                </span>
              </div>
              <div style="font-size: 12px; color: #999; margin-bottom: 8px;">
                ${address}
              </div>
              <a 
                href="/places/${tour.contentid}" 
                style="display: inline-block; padding: 6px 12px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; margin-top: 4px;"
                onmouseover="this.style.background='#0056b3'"
                onmouseout="this.style.background='#007bff'"
              >
                상세보기
              </a>
            </div>
          `;

          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(map, marker);

          // 리스트 연동
          if (onTourSelect) {
            onTourSelect(tour.contentid);
          }
        });

        markersRef.current.push(marker);
      } catch (error) {
        console.error(`[NaverMap] Failed to create marker for ${tour.contentid}:`, error);
      }
    });

    // 모든 마커를 포함하도록 지도 범위 조정
    if (markersRef.current.length > 0) {
      const bounds = new window.naver.maps.LatLngBounds();
      markersRef.current.forEach((marker) => {
        bounds.extend(marker.getPosition());
      });
      try {
        // bounds가 유효한지 확인 (getSW()와 getNE() 호출로 검증)
        bounds.getSW();
        bounds.getNE();
        map.fitBounds(bounds);
      } catch (error) {
        console.error("[NaverMap] Failed to fit bounds:", error);
      }
    }
  }, [isMapLoaded, tours, selectedTourId, onTourSelect]);

  // 선택된 관광지로 지도 이동
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !selectedTourId) return;

    const selectedTour = tours.find((tour) => tour.contentid === selectedTourId);
    if (!selectedTour) return;

    try {
      const { lat, lng } = convertKATECToWGS84(selectedTour.mapx, selectedTour.mapy);
      const position = new window.naver.maps.LatLng(lat, lng);

      mapInstanceRef.current.panTo(position);
      mapInstanceRef.current.setZoom(15);

      // 해당 마커의 인포윈도우 열기
      const marker = markersRef.current.find(
        (m) => m.getPosition().lat() === lat && m.getPosition().lng() === lng
      );

      if (marker && !infoWindowRef.current) {
        infoWindowRef.current = new window.naver.maps.InfoWindow({
          maxWidth: 300,
        });
      }

      if (marker && infoWindowRef.current) {
        const contentTypeName = getContentTypeName(selectedTour.contenttypeid);
        const address = selectedTour.addr2
          ? `${selectedTour.addr1} ${selectedTour.addr2}`
          : selectedTour.addr1;

        const content = `
          <div style="padding: 12px; min-width: 200px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
              ${selectedTour.title}
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
              <span style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px; font-size: 11px;">
                ${contentTypeName}
              </span>
            </div>
            <div style="font-size: 12px; color: #999; margin-bottom: 8px;">
              ${address}
            </div>
            <a 
              href="/places/${selectedTour.contentid}" 
              style="display: inline-block; padding: 6px 12px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; margin-top: 4px;"
              onmouseover="this.style.background='#0056b3'"
              onmouseout="this.style.background='#007bff'"
            >
              상세보기
            </a>
          </div>
        `;

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapInstanceRef.current, marker);
      }
    } catch (error) {
      console.error(`[NaverMap] Failed to move to selected tour:`, error);
    }
  }, [selectedTourId, tours, isMapLoaded]);

  // 줌 인
  const handleZoomIn = () => {
    if (!mapInstanceRef.current) return;
    const currentZoom = mapInstanceRef.current.getZoom();
    mapInstanceRef.current.setZoom(currentZoom + 1);
  };

  // 줌 아웃
  const handleZoomOut = () => {
    if (!mapInstanceRef.current) return;
    const currentZoom = mapInstanceRef.current.getZoom();
    mapInstanceRef.current.setZoom(currentZoom - 1);
  };

  // 지도 유형 변경
  const handleMapTypeToggle = () => {
    if (!mapInstanceRef.current) return;
    const newType = mapType === "normal" ? "satellite" : "normal";
    setMapType(newType);
    mapInstanceRef.current.setMapTypeId(
      newType === "normal"
        ? window.naver.maps.MapTypeId.NORMAL
        : window.naver.maps.MapTypeId.SATELLITE
    );
  };

  if (!naverMapKey) {
    return (
      <div
        className={cn(
          "flex h-[400px] lg:h-[600px] items-center justify-center rounded-lg border bg-muted/30",
          className
        )}
      >
        <div className="text-center text-muted-foreground">
          <p className="text-sm">네이버 지도 API 키가 설정되지 않았습니다</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 네이버 지도 API 스크립트 로드 */}
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverMapKey}`}
        strategy="lazyOnload"
        onLoad={() => {
          // 스크립트 로드 완료 후 window.naver 초기화 확인
          if (typeof window !== 'undefined' && window.naver?.maps?.Map) {
            setIsMapLoaded(true);
            setMapError(null);
          } else {
            // window.naver가 아직 초기화되지 않았을 수 있으므로
            // 약간의 지연 후 다시 확인
            setTimeout(() => {
              if (typeof window !== 'undefined' && window.naver?.maps?.Map) {
                setIsMapLoaded(true);
                setMapError(null);
              } else {
                setMapError('네이버 지도 API를 초기화할 수 없습니다.');
                console.error('[NaverMap] window.naver is not initialized after script load');
              }
            }, 100);
          }
        }}
        onError={() => {
          console.error("[NaverMap] Failed to load Naver Maps API");
          setMapError('네이버 지도 API를 불러오는 중 오류가 발생했습니다. API 키를 확인해주세요.');
        }}
      />

      <div className={cn("relative h-[400px] lg:h-[600px] rounded-lg overflow-hidden border", className)}>
        {/* 지도 컨테이너 */}
        <div ref={mapRef} className="w-full h-full" />

        {/* 지도 컨트롤 */}
        {isMapLoaded && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            {/* 줌 컨트롤 */}
            <div className="flex flex-col gap-1 bg-white dark:bg-gray-900 rounded-lg shadow-lg border">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                className="h-9 w-9"
                aria-label="줌 인"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                className="h-9 w-9"
                aria-label="줌 아웃"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>

            {/* 지도 유형 선택 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMapTypeToggle}
              className="h-9 w-9 bg-white dark:bg-gray-900 shadow-lg border"
              aria-label={mapType === "normal" ? "스카이뷰로 전환" : "일반 지도로 전환"}
            >
              {mapType === "normal" ? (
                <Satellite className="h-4 w-4" />
              ) : (
                <MapIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* 에러 상태 */}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30 backdrop-blur-sm z-10">
            <div className="text-center text-muted-foreground max-w-md px-4">
              <p className="text-sm font-medium mb-2 text-destructive">지도 로드 실패</p>
              <p className="text-xs mb-4">{mapError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMapError(null);
                  setIsMapLoaded(false);
                  // 페이지 새로고침
                  if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                }}
              >
                새로고침
              </Button>
            </div>
          </div>
        )}

        {/* 로딩 상태 */}
        {!isMapLoaded && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30 backdrop-blur-sm z-10">
            <Loading size="lg" showText text="지도를 불러오는 중..." />
          </div>
        )}
      </div>
    </>
  );
}

