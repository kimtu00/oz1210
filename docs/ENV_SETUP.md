# 환경변수 설정 가이드

이 문서는 My Trip 프로젝트의 환경변수 설정 방법을 안내합니다.

## 목차

1. [개요](#개요)
2. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
3. [프로덕션 환경 설정 (Vercel)](#프로덕션-환경-설정-vercel)
4. [환경변수 목록](#환경변수-목록)
5. [보안 모범 사례](#보안-모범-사례)
6. [환경변수 검증](#환경변수-검증)
7. [문제 해결](#문제-해결)

## 개요

My Trip 프로젝트는 다음 서비스와 통합되어 있습니다:

- **Clerk**: 사용자 인증
- **Supabase**: 데이터베이스 및 스토리지
- **한국관광공사 API**: 관광지 정보
- **네이버 지도 API**: 지도 서비스

각 서비스에 대한 API 키와 설정을 환경변수로 관리합니다.

## 로컬 개발 환경 설정

### 1. .env 파일 생성

프로젝트 루트 디렉토리에 `.env` 파일을 생성합니다:

```bash
# .env.example 파일을 복사
cp .env.example .env
```

### 2. 환경변수 값 입력

`.env` 파일을 열고 각 환경변수에 실제 값을 입력합니다.

각 서비스별 키 발급 방법은 아래 섹션을 참고하세요.

### 3. 환경변수 검증

환경변수가 올바르게 설정되었는지 확인합니다:

```bash
npm run verify:env
```

모든 필수 환경변수가 설정되어 있으면 성공 메시지가 표시됩니다.

## 프로덕션 환경 설정 (Vercel)

### 1. Vercel 대시보드 접속

1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 메뉴 선택

### 2. 환경변수 추가

각 환경변수를 추가합니다:

1. **Name**: 환경변수 이름 (예: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
2. **Value**: 환경변수 값
3. **Environment**: 적용할 환경 선택
   - **Production**: 프로덕션 환경
   - **Preview**: 프리뷰 환경 (PR 등)
   - **Development**: 개발 환경

### 3. 환경변수 확인

모든 환경변수를 추가한 후, 다음 명령어로 확인할 수 있습니다:

```bash
# Vercel CLI 사용 (선택 사항)
vercel env ls
```

## 환경변수 목록

### Clerk Authentication

| 환경변수 | 필수 | 설명 | 노출 여부 |
|---------|------|------|----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk 공개 키 | 클라이언트 노출 |
| `CLERK_SECRET_KEY` | ✅ | Clerk 비밀 키 | 서버 전용 |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | ⚠️ | 로그인 페이지 URL (기본값: `/sign-in`) | 클라이언트 노출 |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | ⚠️ | 로그인 후 리다이렉트 URL (기본값: `/`) | 클라이언트 노출 |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | ⚠️ | 회원가입 후 리다이렉트 URL (기본값: `/`) | 클라이언트 노출 |

**키 발급 방법:**
1. [Clerk 대시보드](https://dashboard.clerk.com/) 접속
2. 프로젝트 선택
3. **API Keys** 메뉴에서 키 확인

### Supabase

| 환경변수 | 필수 | 설명 | 노출 여부 |
|---------|------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 프로젝트 URL | 클라이언트 노출 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Anon Key | 클라이언트 노출 |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase Service Role Key | 서버 전용 |
| `NEXT_PUBLIC_STORAGE_BUCKET` | ⚠️ | Storage 버킷 이름 (기본값: `uploads`) | 클라이언트 노출 |

**키 발급 방법:**
1. [Supabase 대시보드](https://app.supabase.com/) 접속
2. 프로젝트 선택
3. **Settings** → **API** 메뉴에서 키 확인
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret**: `SUPABASE_SERVICE_ROLE_KEY`

### 한국관광공사 API

| 환경변수 | 필수 | 설명 | 노출 여부 |
|---------|------|------|----------|
| `TOUR_API_KEY` | ✅* | 서버 사이드용 API 키 | 서버 전용 |
| `NEXT_PUBLIC_TOUR_API_KEY` | ✅* | 클라이언트 사이드용 API 키 | 클라이언트 노출 |

\* `TOUR_API_KEY` 또는 `NEXT_PUBLIC_TOUR_API_KEY` 중 하나는 필수입니다.

**키 발급 방법:**
1. [공공데이터포털](https://www.data.go.kr/) 접속
2. 회원가입 및 로그인
3. **한국관광공사_국문 관광정보 서비스** API 신청
4. 마이페이지에서 인증키 확인

**권장 사항:**
- 서버 사이드에서만 사용하는 경우 `TOUR_API_KEY` 사용 (더 안전)
- 클라이언트에서도 사용하는 경우 `NEXT_PUBLIC_TOUR_API_KEY` 사용

### 네이버 지도 API

| 환경변수 | 필수 | 설명 | 노출 여부 |
|---------|------|------|----------|
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | ✅ | 네이버 지도 API Client ID | 클라이언트 노출 |

**키 발급 방법:**
1. [네이버 클라우드 플랫폼](https://www.ncloud.com/) 접속
2. 회원가입 및 로그인 (신용카드 등록 필요)
3. **AI·NAVER API** → **Maps** → **Web Dynamic Map** 서비스 신청
4. **Application** 등록 후 Client ID 확인

### 기타

| 환경변수 | 필수 | 설명 | 노출 여부 |
|---------|------|------|----------|
| `NEXT_PUBLIC_SITE_URL` | ⚠️ | 사이트 URL (기본값: `https://my-trip.vercel.app`) | 클라이언트 노출 |

## 보안 모범 사례

### 1. NEXT_PUBLIC_ 접두사 이해

- **`NEXT_PUBLIC_` 접두사가 있는 환경변수**: 클라이언트에 노출됨
  - 브라우저에서 `process.env.NEXT_PUBLIC_*`로 접근 가능
  - 번들에 포함되어 누구나 볼 수 있음
  - 공개해도 안전한 키만 사용

- **`NEXT_PUBLIC_` 접두사가 없는 환경변수**: 서버 전용
  - 서버 사이드에서만 접근 가능
  - 클라이언트에 노출되지 않음
  - 비밀 키는 이 형식 사용

### 2. 환경변수 노출 방지

❌ **하지 말아야 할 것:**
- `.env` 파일을 git에 커밋
- 비밀 키를 `NEXT_PUBLIC_` 접두사로 설정
- 환경변수를 코드에 하드코딩
- 프로덕션 키를 로컬 개발 환경에 사용

✅ **해야 할 것:**
- `.env` 파일을 `.gitignore`에 추가
- `.env.example` 파일에는 예시 값만 포함
- 프로덕션과 개발 환경의 키 분리
- 정기적으로 키 로테이션

### 3. 환경변수 관리 체크리스트

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] `.env.example` 파일에 실제 값이 없는지 확인
- [ ] 프로덕션 환경변수가 Vercel에 올바르게 설정되었는지 확인
- [ ] 비밀 키가 `NEXT_PUBLIC_` 접두사 없이 설정되었는지 확인
- [ ] 환경변수 검증 스크립트가 통과하는지 확인

## 환경변수 검증

### 자동 검증

프로젝트에는 환경변수 검증 스크립트가 포함되어 있습니다:

```bash
npm run verify:env
```

이 스크립트는 다음을 확인합니다:
- 모든 필수 환경변수가 설정되어 있는지
- 환경변수 형식이 올바른지 (URL 등)
- 선택적 환경변수에 대한 권장 사항

### 빌드 전 검증

빌드 전에 환경변수를 검증하는 것을 권장합니다:

```bash
# 환경변수 검증
npm run verify:env

# 검증 통과 후 빌드
npm run build
```

### CI/CD 통합

CI/CD 파이프라인에서 빌드 전에 환경변수를 검증할 수 있습니다:

```yaml
# 예시: GitHub Actions
- name: Verify environment variables
  run: npm run verify:env
  env:
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.CLERK_PUBLISHABLE_KEY }}
    # ... 기타 환경변수
```

## 문제 해결

### 환경변수를 찾을 수 없다는 에러

**증상:**
```
Error: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set
```

**해결 방법:**
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. 환경변수 이름이 정확한지 확인 (대소문자 구분)
3. `.env` 파일을 수정한 후 개발 서버를 재시작
4. `npm run verify:env`로 누락된 환경변수 확인

### 환경변수가 적용되지 않음

**해결 방법:**
1. 개발 서버 재시작: `npm run dev`
2. `.env` 파일 위치 확인 (프로젝트 루트 디렉토리)
3. 환경변수 이름 확인 (오타 없음)
4. Vercel의 경우 환경변수 추가 후 재배포 필요

### 프로덕션에서 환경변수 오류

**해결 방법:**
1. Vercel 대시보드에서 환경변수 확인
2. 환경변수가 올바른 환경(Production)에 설정되었는지 확인
3. 환경변수 추가 후 재배포
4. Vercel 로그에서 에러 메시지 확인

## 추가 자료

- [Next.js 환경변수 문서](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Clerk 환경변수 설정](https://clerk.com/docs/quickstarts/nextjs)
- [Supabase 환경변수 설정](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)
- [Vercel 환경변수 설정](https://vercel.com/docs/concepts/projects/environment-variables)

