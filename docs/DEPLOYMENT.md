# 배포 가이드

이 문서는 My Trip 프로젝트를 Vercel에 배포하는 방법을 안내합니다.

## 목차

1. [배포 전 준비](#배포-전-준비)
2. [Vercel 배포 설정](#vercel-배포-설정)
3. [환경변수 설정](#환경변수-설정)
4. [빌드 테스트](#빌드-테스트)
5. [프로덕션 배포](#프로덕션-배포)
6. [배포 후 확인](#배포-후-확인)
7. [문제 해결](#문제-해결)

## 배포 전 준비

### 1. 필수 확인 사항

배포 전에 다음 항목을 확인하세요:

- [ ] 모든 필수 환경변수가 로컬에서 정상 작동하는지 확인
- [ ] 환경변수 검증 통과 (`npm run verify:env`)
- [ ] 로컬 빌드 성공 (`pnpm build`)
- [ ] 로컬 프로덕션 서버 실행 확인 (`pnpm start`)
- [ ] 주요 기능이 정상 작동하는지 확인
- [ ] Git 저장소에 코드가 커밋되어 있는지 확인

### 2. 환경변수 검증

로컬에서 환경변수를 검증합니다:

```bash
npm run verify:env
```

모든 필수 환경변수가 설정되어 있어야 합니다. 자세한 내용은 [docs/ENV_SETUP.md](./ENV_SETUP.md)를 참고하세요.

### 3. 빌드 테스트

로컬에서 프로덕션 빌드를 테스트합니다:

```bash
# 빌드 실행
pnpm build

# 프로덕션 서버 실행
pnpm start
```

빌드가 성공하고 프로덕션 서버가 정상적으로 실행되는지 확인하세요.

## Vercel 배포 설정

### 1. Vercel 계정 생성

1. [Vercel](https://vercel.com)에 가입하거나 로그인
2. GitHub 계정 연동 (권장)

### 2. 프로젝트 생성

#### 방법 1: Vercel 대시보드에서 생성

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. **Add New...** → **Project** 클릭
3. GitHub 저장소 선택 또는 Import
4. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `pnpm build` (자동 설정됨)
   - **Output Directory**: `.next` (자동 설정됨)
   - **Install Command**: `pnpm install` (자동 설정됨)

#### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 실행
vercel

# 프로덕션 배포
vercel --prod
```

### 3. GitHub 연동 (자동 배포)

1. Vercel 대시보드에서 프로젝트 선택
2. **Settings** → **Git** 메뉴 선택
3. **Production Branch** 설정 (기본값: `main` 또는 `master`)
4. **Automatic deployments** 활성화:
   - Production: `main` 브랜치에 푸시 시 자동 배포
   - Preview: PR 생성 시 프리뷰 배포

## 환경변수 설정

### 1. Vercel 대시보드에서 환경변수 추가

1. Vercel 대시보드에서 프로젝트 선택
2. **Settings** → **Environment Variables** 메뉴 선택
3. 각 환경변수를 추가:

#### Clerk Authentication

| 환경변수 | 값 |
|---------|-----|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 대시보드에서 발급받은 Publishable Key |
| `CLERK_SECRET_KEY` | Clerk 대시보드에서 발급받은 Secret Key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` (선택) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/` (선택) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/` (선택) |

#### Supabase

| 환경변수 | 값 |
|---------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key |
| `NEXT_PUBLIC_STORAGE_BUCKET` | `uploads` (선택) |

#### 한국관광공사 API

| 환경변수 | 값 |
|---------|-----|
| `TOUR_API_KEY` | 한국관광공사 API 키 (서버 사이드용, 권장) |
| 또는 `NEXT_PUBLIC_TOUR_API_KEY` | 한국관광공사 API 키 (클라이언트 사이드용) |

#### 네이버 지도 API

| 환경변수 | 값 |
|---------|-----|
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | 네이버 지도 API Client ID |

#### 기타

| 환경변수 | 값 |
|---------|-----|
| `NEXT_PUBLIC_SITE_URL` | 배포된 사이트 URL (예: `https://my-trip.vercel.app`) |

### 2. 환경별 설정

각 환경변수를 다음 환경에 적용할지 선택:

- **Production**: 프로덕션 환경에만 적용
- **Preview**: 프리뷰 환경 (PR 등)에만 적용
- **Development**: 개발 환경에만 적용

**권장 사항:**
- 모든 필수 환경변수는 **Production**과 **Preview**에 설정
- 개발 전용 환경변수는 **Development**에만 설정

### 3. 환경변수 확인

환경변수를 추가한 후:

1. **Settings** → **Environment Variables**에서 모든 환경변수가 올바르게 설정되었는지 확인
2. 환경변수 이름의 오타 확인
3. 값이 올바르게 입력되었는지 확인 (공백, 따옴표 등)

## 빌드 테스트

### 1. 로컬 빌드 테스트

배포 전에 로컬에서 빌드를 테스트합니다:

```bash
# 환경변수 검증
npm run verify:env

# 빌드 실행
pnpm build

# 빌드 성공 확인
# 출력에 "Build completed successfully" 메시지 확인
```

### 2. 빌드 에러 해결

빌드 중 에러가 발생하면:

1. **환경변수 확인**: `npm run verify:env`로 누락된 환경변수 확인
2. **타입 에러**: `pnpm lint`로 타입 에러 확인
3. **의존성 문제**: `pnpm install`로 의존성 재설치
4. **빌드 로그 확인**: 에러 메시지를 자세히 확인

### 3. 프로덕션 서버 테스트

빌드가 성공하면 프로덕션 서버를 실행하여 테스트:

```bash
pnpm start
```

브라우저에서 `http://localhost:3000` 접속하여 다음을 확인:

- [ ] 홈페이지가 정상적으로 로드됨
- [ ] 관광지 목록이 표시됨
- [ ] 검색 기능이 작동함
- [ ] 상세페이지가 정상적으로 로드됨
- [ ] 인증 기능이 작동함 (로그인/회원가입)

## 프로덕션 배포

### 1. 첫 배포

#### 방법 1: Vercel 대시보드에서 배포

1. Vercel 대시보드에서 프로젝트 선택
2. **Deployments** 탭에서 **Deploy** 버튼 클릭
3. 배포 완료까지 대기 (약 2-5분)

#### 방법 2: Git 푸시로 자동 배포

```bash
# main 브랜치에 푸시
git push origin main
```

GitHub에 푸시하면 자동으로 배포가 시작됩니다.

### 2. 배포 상태 확인

1. Vercel 대시보드의 **Deployments** 탭에서 배포 상태 확인
2. 배포가 완료되면 **Ready** 상태로 변경됨
3. 배포된 URL 확인 (예: `https://my-trip.vercel.app`)

### 3. 배포 로그 확인

배포 중 에러가 발생하면:

1. **Deployments** 탭에서 해당 배포 클릭
2. **Build Logs** 확인
3. 에러 메시지 확인 및 해결

## 배포 후 확인

### 1. 기본 확인 사항

배포가 완료되면 다음을 확인하세요:

- [ ] 사이트가 정상적으로 접속됨
- [ ] HTTPS가 활성화되어 있음
- [ ] 도메인이 올바르게 설정됨

### 2. 기능 테스트

#### 홈페이지 테스트

- [ ] 관광지 목록이 표시됨
- [ ] 필터 기능이 작동함
- [ ] 검색 기능이 작동함
- [ ] 페이지네이션이 작동함
- [ ] 지도가 정상적으로 표시됨

#### 상세페이지 테스트

- [ ] 관광지 상세 정보가 표시됨
- [ ] 이미지 갤러리가 작동함
- [ ] 지도가 정상적으로 표시됨
- [ ] 북마크 기능이 작동함 (로그인 필요)
- [ ] 공유 기능이 작동함

#### 인증 테스트

- [ ] 로그인 기능이 작동함
- [ ] 회원가입 기능이 작동함
- [ ] 로그아웃 기능이 작동함
- [ ] 인증된 사용자만 접근 가능한 페이지 보호됨

#### 통계 페이지 테스트

- [ ] 통계 대시보드가 표시됨
- [ ] 차트가 정상적으로 렌더링됨
- [ ] 데이터가 올바르게 표시됨

#### 북마크 페이지 테스트

- [ ] 로그인한 사용자만 접근 가능
- [ ] 북마크 목록이 표시됨
- [ ] 북마크 추가/삭제가 작동함

### 3. 성능 테스트

#### Lighthouse 테스트

```bash
# 로컬에서 Lighthouse 측정 (배포된 URL 사용)
npm run lighthouse:measure
```

목표 점수:
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

#### Web Vitals 확인

1. Chrome DevTools → **Lighthouse** 탭
2. **Performance** 카테고리 선택
3. **Analyze page load** 실행
4. Core Web Vitals 확인:
   - LCP (Largest Contentful Paint): < 2.5초
   - FID (First Input Delay): < 100ms
   - CLS (Cumulative Layout Shift): < 0.1

### 4. 에러 모니터링

배포 후 에러가 발생하는지 확인:

1. Vercel 대시보드의 **Functions** 탭에서 에러 로그 확인
2. 브라우저 콘솔에서 에러 확인
3. 네트워크 탭에서 실패한 요청 확인

## 문제 해결

### 빌드 실패

**증상:** Vercel 배포 시 빌드 실패

**해결 방법:**
1. 로컬에서 빌드 테스트: `pnpm build`
2. 빌드 로그 확인: Vercel 대시보드의 **Build Logs**
3. 환경변수 확인: 모든 필수 환경변수가 설정되었는지 확인
4. 의존성 문제: `package.json`의 의존성 버전 확인
5. Node.js 버전: Vercel의 Node.js 버전 확인 (기본값: 18.x)

### 환경변수 오류

**증상:** 런타임에서 환경변수를 찾을 수 없다는 에러

**해결 방법:**
1. Vercel 대시보드에서 환경변수 확인
2. 환경변수 이름 확인 (대소문자, 오타)
3. 환경변수가 올바른 환경(Production)에 설정되었는지 확인
4. 환경변수 추가 후 재배포

### API 호출 실패

**증상:** 한국관광공사 API 또는 다른 API 호출 실패

**해결 방법:**
1. API 키가 올바르게 설정되었는지 확인
2. API 키의 Rate Limit 확인
3. CORS 설정 확인 (필요시)
4. 네트워크 탭에서 요청/응답 확인

### 이미지 로드 실패

**증상:** 이미지가 표시되지 않음

**해결 방법:**
1. `next.config.ts`의 `remotePatterns` 설정 확인
2. 이미지 URL이 올바른지 확인
3. 외부 이미지 서버의 CORS 설정 확인

### 인증 오류

**증상:** Clerk 인증이 작동하지 않음

**해결 방법:**
1. Clerk 환경변수가 올바르게 설정되었는지 확인
2. Clerk 대시보드에서 Allowed Origins 설정 확인
3. Vercel 배포 URL을 Clerk의 Allowed Origins에 추가

## 추가 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/app/building-your-application/deploying)
- [Clerk 배포 가이드](https://clerk.com/docs/deployments/overview)
- [Supabase 배포 가이드](https://supabase.com/docs/guides/hosting/overview)

## 체크리스트

### 배포 전

- [ ] 모든 필수 환경변수 로컬에서 검증 완료
- [ ] 로컬 빌드 성공 (`pnpm build`)
- [ ] 로컬 프로덕션 서버 테스트 완료
- [ ] 주요 기능 테스트 완료
- [ ] Git 저장소에 코드 커밋 완료

### 배포 중

- [ ] Vercel 프로젝트 생성 완료
- [ ] GitHub 저장소 연동 완료
- [ ] 모든 환경변수 Vercel에 설정 완료
- [ ] 빌드 설정 확인 완료

### 배포 후

- [ ] 사이트 접속 확인
- [ ] 홈페이지 기능 테스트 완료
- [ ] 상세페이지 기능 테스트 완료
- [ ] 인증 기능 테스트 완료
- [ ] 통계 페이지 테스트 완료
- [ ] 북마크 페이지 테스트 완료
- [ ] Lighthouse 성능 테스트 완료
- [ ] 에러 모니터링 확인 완료

