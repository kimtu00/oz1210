# Clerk 한국어 로컬라이제이션 가이드

이 문서는 Clerk 컴포넌트를 한국어로 설정하는 방법을 설명합니다.

## 개요

Clerk는 `@clerk/localizations` 패키지를 통해 다양한 언어를 지원합니다. 한국어는 `koKR` 키로 제공됩니다.

**참고**: 이 기능은 현재 실험적(experimental) 기능입니다. 문제가 발생하면 [Clerk 지원팀](https://clerk.com/contact/support)에 문의하세요.

## 현재 설정

프로젝트의 `app/layout.tsx`에서 이미 한국어 로컬라이제이션이 적용되어 있습니다:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

<ClerkProvider localization={koKR}>
  {/* ... */}
</ClerkProvider>
```

## 지원되는 언어

Clerk는 다음 언어를 지원합니다:

| 언어 | 언어 태그 (BCP 47) | 키 |
|------|-------------------|-----|
| 한국어 | ko-KR | `koKR` |
| 영어 (미국) | en-US | `enUS` |
| 일본어 | ja-JP | `jaJP` |
| 중국어 (간체) | zh-CN | `zhCN` |
| 중국어 (번체) | zh-TW | `zhTW` |

전체 언어 목록은 [Clerk 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization#languages)를 참고하세요.

## 사용법

### 기본 사용법

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={koKR}>
      {children}
    </ClerkProvider>
  );
}
```

### 커스텀 로컬라이제이션

기본 한국어 로컬라이제이션에 커스텀 문자열을 추가하거나 수정할 수 있습니다:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

const customKoKR = {
  ...koKR,
  signUp: {
    start: {
      title: "계정 만들기",
      subtitle: "{{applicationName}}에 가입하세요",
    },
  },
  signIn: {
    start: {
      title: "로그인",
      subtitle: "{{applicationName}}에 로그인하세요",
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={customKoKR}>
      {children}
    </ClerkProvider>
  );
}
```

### 에러 메시지 커스터마이징

특정 에러 메시지를 한국어로 커스터마이징할 수 있습니다:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

const customKoKR = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    not_allowed_access:
      "접근이 허용되지 않은 이메일 도메인입니다. 접근을 원하시면 이메일로 문의해주세요.",
    form_identifier_not_found:
      "입력하신 이메일 주소로 등록된 계정을 찾을 수 없습니다.",
    form_password_incorrect:
      "비밀번호가 올바르지 않습니다. 다시 확인해주세요.",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={customKoKR}>
      {children}
    </ClerkProvider>
  );
}
```

사용 가능한 에러 키 목록은 [영어 로컬라이제이션 파일](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)에서 `unstable__errors` 객체를 검색하여 확인할 수 있습니다.

## Tailwind CSS v4 호환성

Tailwind CSS v4를 사용하는 경우, `appearance` prop에 `cssLayerName: "clerk"`을 설정해야 합니다:

```tsx
<ClerkProvider
  localization={koKR}
  appearance={{
    cssLayerName: "clerk", // Tailwind CSS v4 호환성 (필수)
  }}
>
  {children}
</ClerkProvider>
```

## 주의사항

### 호스팅된 Account Portal

로컬라이제이션은 **Clerk 컴포넌트**에만 적용됩니다. 호스팅된 [Clerk Account Portal](https://clerk.com/docs/guides/customizing-clerk/account-portal)은 여전히 영어로 표시됩니다.

### 실험적 기능

이 기능은 현재 실험적(experimental) 상태입니다. 프로덕션 환경에서 사용하기 전에 충분히 테스트하세요.

## 스타일 커스터마이징

로컬라이제이션과 함께 스타일도 커스터마이징할 수 있습니다:

```tsx
<ClerkProvider
  localization={koKR}
  appearance={{
    cssLayerName: "clerk",
    elements: {
      formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
      formButtonSecondary: "bg-gray-200 hover:bg-gray-300",
      card: "shadow-lg rounded-lg",
    },
  }}
>
  {children}
</ClerkProvider>
```

## 예제

### SignIn 컴포넌트에 한국어 적용

```tsx
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        routing="path"
        path="/sign-in"
        redirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
```

`ClerkProvider`에서 이미 `koKR` 로컬라이제이션이 설정되어 있으므로, `SignIn` 컴포넌트는 자동으로 한국어로 표시됩니다.

### SignUp 컴포넌트에 한국어 적용

```tsx
// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        routing="path"
        path="/sign-up"
        redirectUrl="/onboarding"
        signInUrl="/sign-in"
      />
    </div>
  );
}
```

## 문제 해결

### 로컬라이제이션이 적용되지 않는 경우

1. **패키지 설치 확인**
   ```bash
   npm list @clerk/localizations
   ```

2. **import 확인**
   ```tsx
   import { koKR } from "@clerk/localizations";
   ```

3. **ClerkProvider 확인**
   - `localization` prop이 올바르게 전달되었는지 확인
   - `appearance` prop과 함께 사용하는 경우 올바른 구조인지 확인

### 특정 문자열이 번역되지 않는 경우

1. [영어 로컬라이제이션 파일](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)에서 해당 키 확인
2. 커스텀 로컬라이제이션 객체에 해당 키 추가
3. GitHub에 이슈 제출 또는 PR 생성

## 참고 자료

- [Clerk 공식 문서: Localization](https://clerk.com/docs/guides/customizing-clerk/localization)
- [@clerk/localizations npm 패키지](https://www.npmjs.com/package/@clerk/localizations)
- [영어 로컬라이제이션 소스 코드](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)
- [Clerk GitHub 저장소](https://github.com/clerk/javascript)

## 기여하기

새로운 로컬라이제이션 키를 추가하거나 기존 한국어 번역을 개선하고 싶다면:

1. [Clerk JavaScript 저장소](https://github.com/clerk/javascript)를 포크
2. `packages/localizations/src/ko-KR.ts` 파일 수정
3. Pull Request 생성

자세한 내용은 [Clerk 기여 가이드](https://github.com/clerk/javascript/blob/main/CONTRIBUTING.md)를 참고하세요.

