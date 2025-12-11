/**
 * @file share-button.tsx
 * @description 공유 기능 컴포넌트
 *
 * 관광지 상세페이지 URL을 복사하는 기능을 제공합니다.
 * - URL 복사 기능
 * - 복사 완료 토스트 메시지
 *
 * @dependencies
 * - sonner: toast 알림
 */

"use client";

import { useState, useEffect } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonProps {
  /**
   * 관광지 콘텐츠 ID
   */
  contentId: string;
  /**
   * 관광지명
   */
  title: string;
}

/**
 * 공유 버튼 컴포넌트
 */
export function ShareButton({ contentId, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  // URL 복사 기능
  const handleShare = async () => {
    const url = `${window.location.origin}/places/${contentId}`;

    // Web Share API 지원 여부 확인
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} - My Trip`,
          text: `${title} 관광지 정보를 확인해보세요`,
          url: url,
        });
        return;
      } catch (error) {
        // 사용자가 공유를 취소한 경우는 에러로 처리하지 않음
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed:", error);
        }
      }
    }

    // Web Share API가 없거나 실패한 경우 클립보드에 복사
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("링크가 복사되었습니다");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("링크 복사에 실패했습니다");
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleShare}
      className="min-h-[44px] gap-2"
      aria-label="공유하기"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          복사됨
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          공유하기
        </>
      )}
    </Button>
  );
}

