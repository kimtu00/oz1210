/**
 * @file accessibility-checker.ts
 * @description 접근성 검증 유틸리티
 *
 * 색상 대비, 터치 영역 크기 등을 검증하는 도구입니다.
 */

/**
 * 접근성 검증 결과
 */
export interface AccessibilityCheckResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
}

/**
 * 터치 영역 크기 검증
 *
 * @param width - 너비 (px)
 * @param height - 높이 (px)
 * @param elementName - 요소 이름 (로깅용)
 * @returns 검증 결과
 */
export function validateTouchTargetSize(
  width: number,
  height: number,
  elementName: string
): AccessibilityCheckResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  const minSize = 44; // WCAG 권장 최소 터치 영역 크기 (px)

  if (width < minSize || height < minSize) {
    issues.push(
      `${elementName}의 터치 영역이 최소 크기(${minSize}x${minSize}px)보다 작습니다. (현재: ${width}x${height}px)`
    );
  } else if (width < 48 || height < 48) {
    warnings.push(
      `${elementName}의 터치 영역이 권장 크기(48x48px)보다 작습니다. (현재: ${width}x${height}px)`
    );
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
}

/**
 * 색상 대비 비율 계산 (WCAG 기준)
 *
 * @param color1 - 첫 번째 색상 (hex 또는 rgb)
 * @param color2 - 두 번째 색상 (hex 또는 rgb)
 * @returns 대비 비율
 */
export function calculateContrastRatio(
  color1: string,
  color2: string
): number {
  // 간단한 대비 비율 계산 (실제로는 더 정확한 알고리즘 필요)
  // 여기서는 기본적인 검증만 수행
  // 실제 구현은 전문 라이브러리 사용 권장 (예: color-contrast-checker)

  // hex 색상을 rgb로 변환
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    return 0;
  }

  // 상대 휘도 계산
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  // 대비 비율 계산
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * hex 색상을 rgb로 변환
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * 상대 휘도 계산
 */
function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * 색상 대비 검증 (WCAG AA 기준)
 *
 * @param foreground - 전경색
 * @param background - 배경색
 * @param elementName - 요소 이름 (로깅용)
 * @returns 검증 결과
 */
export function validateColorContrast(
  foreground: string,
  background: string,
  elementName: string
): AccessibilityCheckResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  const ratio = calculateContrastRatio(foreground, background);

  // WCAG AA 기준: 일반 텍스트 4.5:1, 큰 텍스트 3:1
  // WCAG AAA 기준: 일반 텍스트 7:1, 큰 텍스트 4.5:1
  if (ratio < 3) {
    issues.push(
      `${elementName}의 색상 대비가 WCAG AA 기준(3:1)을 만족하지 않습니다. (현재: ${ratio.toFixed(2)}:1)`
    );
  } else if (ratio < 4.5) {
    warnings.push(
      `${elementName}의 색상 대비가 WCAG AA 일반 텍스트 기준(4.5:1)을 만족하지 않습니다. (현재: ${ratio.toFixed(2)}:1)`
    );
  } else if (ratio < 7) {
    // WCAG AAA 기준 미달이지만 AA 기준은 만족
    warnings.push(
      `${elementName}의 색상 대비가 WCAG AAA 기준(7:1)을 만족하지 않습니다. (현재: ${ratio.toFixed(2)}:1)`
    );
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
}

/**
 * 개발 환경에서 접근성 이슈 로깅
 */
export function logAccessibilityIssues(
  result: AccessibilityCheckResult,
  context: string
) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  if (result.issues.length === 0 && result.warnings.length === 0) {
    return;
  }

  console.group(`[Accessibility] ${context}`);
  if (result.issues.length > 0) {
    result.issues.forEach((issue) => {
      console.error(`🔴 ${issue}`);
    });
  }
  if (result.warnings.length > 0) {
    result.warnings.forEach((warning) => {
      console.warn(`🟡 ${warning}`);
    });
  }
  console.groupEnd();
}

/**
 * 접근성 체크리스트 검증
 *
 * 개발 환경에서 컴포넌트의 접근성을 검증합니다.
 */
export function validateAccessibilityChecklist(element: HTMLElement): {
  hasAriaLabel: boolean;
  hasRole: boolean;
  hasKeyboardSupport: boolean;
  touchTargetSize: AccessibilityCheckResult;
} {
  const rect = element.getBoundingClientRect();
  const hasAriaLabel =
    element.hasAttribute("aria-label") ||
    element.hasAttribute("aria-labelledby");
  const hasRole = element.hasAttribute("role");
  const hasKeyboardSupport =
    element.tabIndex >= 0 || element.tagName === "BUTTON" || element.tagName === "A";

  const touchTargetSize = validateTouchTargetSize(
    rect.width,
    rect.height,
    element.tagName.toLowerCase()
  );

  return {
    hasAriaLabel,
    hasRole,
    hasKeyboardSupport,
    touchTargetSize,
  };
}


