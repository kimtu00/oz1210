# 성능 최적화 문서

## 개요

이 문서는 My Trip 프로젝트의 성능 최적화 작업과 측정 결과를 기록합니다.

## 목표

- **Lighthouse Performance 점수**: > 80
- **Lighthouse Accessibility 점수**: > 90
- **Lighthouse Best Practices 점수**: > 90
- **Lighthouse SEO 점수**: > 90

## 최적화 항목

### 1. 코드 분할 (Code Splitting)

#### recharts 동적 import
- `components/stats/region-chart-client.tsx`: recharts 컴포넌트를 동적 import로 변경
- `components/stats/type-chart-client.tsx`: recharts 컴포넌트를 동적 import로 변경
- **효과**: 초기 번들 크기 감소, 차트가 필요한 페이지에서만 로드

#### Next.js 자동 코드 분할
- Next.js 15는 자동으로 라우트별 코드 분할을 수행합니다
- 각 페이지는 독립적인 청크로 분할되어 로드됩니다

### 2. 번들 최적화

#### @next/bundle-analyzer 설정
- `next.config.ts`에 번들 분석 도구 설정
- `npm run analyze` 명령어로 번들 크기 분석 가능

#### 패키지 최적화
- `next.config.ts`의 `experimental.optimizePackageImports` 설정
- `lucide-react`, `recharts` 패키지 최적화
- **효과**: 사용하지 않는 코드 제거 (Tree Shaking)

### 3. API 응답 캐싱

#### 캐싱 전략
- **지역코드 조회** (`getAreaCode`): 24시간 캐싱
- **관광지 목록** (`getAreaBasedList`): 5분 캐싱
- **검색 결과** (`searchKeyword`): 5분 캐싱
- **상세 정보** (`getDetailCommon`): 1시간 캐싱
- **운영 정보** (`getDetailIntro`): 1시간 캐싱
- **이미지 목록** (`getDetailImage`): 1시간 캐싱
- **반려동물 정보** (`getDetailPetTour`): 1시간 캐싱

#### 캐시 태그
- `["area-code"]`: 지역코드
- `["tours", "area-based"]`: 지역 기반 목록
- `["tours", "search"]`: 검색 결과
- `["tour-detail"]`: 상세 정보
- `["stats", "region-stats"]`: 지역별 통계
- `["stats", "type-stats"]`: 타입별 통계

#### 구현 방법
- Next.js의 `unstable_cache` 사용
- 서버 사이드에서만 동작 (Server Component)
- 캐시 무효화는 태그 기반으로 가능

### 4. 이미지 최적화

#### Next.js Image 컴포넌트
- 모든 이미지는 `next/image` 컴포넌트 사용
- 자동 WebP 변환 및 리사이징
- Lazy loading 적용 (below-the-fold 이미지)

#### 이미지 설정
- `priority` 속성: above-the-fold 이미지에만 사용
- `sizes` 속성: 반응형 이미지 크기 최적화
- 외부 도메인 허용: `next.config.ts`에 설정

### 5. 폰트 최적화

#### 폰트 로딩
- `app/layout.tsx`에서 Google Fonts 사용
- `display: swap` 설정 (기본값)
- 폰트 파일은 자동으로 최적화됨

## 측정 방법

### Lighthouse 측정

#### 자동 측정 스크립트
```bash
# 개발 서버 실행 후
npm run lighthouse:measure

# CI 환경용
npm run lighthouse:ci
```

#### 측정 페이지
- `/` (홈페이지)
- `/stats` (통계 페이지)
- `/places/[contentId]` (상세페이지 샘플)

#### 결과 저장
- 리포트는 `lighthouse-reports/` 디렉토리에 저장됩니다
- HTML 형식으로 상세 분석 결과 확인 가능

### 번들 분석

```bash
# 번들 분석 실행
npm run analyze
```

- 브라우저에서 자동으로 번들 분석 리포트 열림
- 각 청크의 크기와 의존성 확인 가능

## 측정 결과

### 최적화 전 (기준선)
- 측정 일시: [측정 필요]
- Performance: [측정 필요]
- Accessibility: [측정 필요]
- Best Practices: [측정 필요]
- SEO: [측정 필요]

### 최적화 후
- 측정 일시: [측정 필요]
- Performance: [측정 필요]
- Accessibility: [측정 필요]
- Best Practices: [측정 필요]
- SEO: [측정 필요]

## 개선 사항 추적

### 완료된 최적화
- [x] recharts 동적 import
- [x] API 응답 캐싱 전략 구현
- [x] 번들 분석 도구 설정
- [x] 패키지 최적화 설정
- [x] Lighthouse 측정 스크립트 생성

### 향후 개선 사항
- [ ] 이미지 CDN 사용 검토
- [ ] 서비스 워커를 통한 오프라인 지원
- [ ] Critical CSS 추출
- [ ] 추가 번들 최적화 (필요시)

## 참고 자료

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)

