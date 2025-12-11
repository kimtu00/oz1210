/**
 * @file detail-gallery.tsx
 * @description 관광지 이미지 갤러리 컴포넌트
 *
 * 관광지의 이미지들을 갤러리 형태로 표시합니다.
 * - 대표 이미지 + 서브 이미지들
 * - 이미지 클릭 시 전체화면 모달
 * - 이미지 없으면 기본 이미지
 *
 * @dependencies
 * - lib/types/tour: TourImage
 * - next/image: 이미지 최적화
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TourImage } from "@/lib/types/tour";

interface DetailGalleryProps {
  /**
   * 이미지 목록
   */
  images: TourImage[];
}

/**
 * 관광지 이미지 갤러리 컴포넌트
 */
export function DetailGallery({ images }: DetailGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  if (images.length === 0) {
    return null;
  }

  // 대표 이미지 (첫 번째 이미지)
  const mainImage = images[0];

  // 서브 이미지들 (나머지)
  const subImages = images.slice(1);

  // 모달 열기
  const openModal = (index: number) => {
    setSelectedIndex(index);
  };

  // 모달 닫기
  const closeModal = () => {
    setSelectedIndex(null);
  };

  // 이전 이미지
  const prevImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
  };

  // 다음 이미지
  const nextImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
  };

  // 키보드 이벤트 처리
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevImage();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    // 모달이 열릴 때 포커스를 닫기 버튼으로 이동
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, images.length]);

  // 포커스 트랩 (모달 내부에서만 포커스 이동)
  useEffect(() => {
    if (selectedIndex === null || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener("keydown", handleTabKey);
    return () => {
      modal.removeEventListener("keydown", handleTabKey);
    };
  }, [selectedIndex]);

  return (
    <>
      <section className="space-y-4" role="region" aria-label="이미지 갤러리">
        <h2 className="text-xl font-semibold">이미지 갤러리</h2>

        {/* 대표 이미지 */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={mainImage.originimgurl}
            alt={`${mainImage.contentid} 이미지 1`}
            fill
            className="cursor-pointer object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, 80vw"
            onClick={() => openModal(0)}
            unoptimized
          />
        </div>

        {/* 서브 이미지 그리드 */}
        {subImages.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {subImages.slice(0, 8).map((image, index) => (
              <div
                key={image.serialnum}
                className="relative aspect-square overflow-hidden rounded-lg bg-muted"
              >
                <Image
                  src={image.originimgurl}
                  alt={`${image.contentid} 이미지 ${index + 2}`}
                  fill
                  className="cursor-pointer object-cover transition-transform hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 20vw"
                  onClick={() => openModal(index + 1)}
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 전체화면 모달 */}
      {selectedIndex !== null && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeModal}
        >
          {/* 닫기 버튼 */}
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 min-h-[44px] min-w-[44px] text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
            onClick={closeModal}
            aria-label="닫기"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* 이전 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 min-h-[44px] min-w-[44px] text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            aria-label="이전 이미지"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          {/* 다음 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 min-h-[44px] min-w-[44px] text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            aria-label="다음 이미지"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          {/* 이미지 */}
          <div
            className="relative h-full w-full max-w-7xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="gallery-modal-title" className="sr-only">
              이미지 {selectedIndex + 1} / {images.length}
            </h3>
            <div className="relative h-full w-full">
              <Image
                src={images[selectedIndex].originimgurl}
                alt={`${images[selectedIndex].contentid} 이미지 ${selectedIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                unoptimized
              />
            </div>
          </div>

          {/* 이미지 인덱스 표시 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white md:text-base">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}

