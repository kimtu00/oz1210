# Clerk + Supabase 통합 가이드

이 문서는 2025년 4월 이후 권장되는 **네이티브 통합 방식**을 기반으로 작성되었습니다.

## 개요

Clerk와 Supabase의 네이티브 통합을 통해:
- JWT 템플릿 불필요 (이전 방식 대비 개선)
- Supabase JWT secret key를 Clerk와 공유할 필요 없음
- Clerk 세션 토큰을 직접 Supabase에 전달하여 인증

## 사전 설정

### 1. Clerk Dashboard 설정

1. [Clerk Dashboard의 Supabase 통합 설정 페이지](https://dashboard.clerk.com/setup/supabase)로 이동
2. 설정 옵션을 선택하고 **"Activate Supabase integration"** 클릭
3. 표시되는 **Clerk domain**을 복사 (예: `your-app.clerk.accounts.dev`)

### 2. Supabase Dashboard 설정

1. [Supabase Dashboard > Authentication > Sign In / Up](https://supabase.com/dashboard/project/_/auth/third-party)로 이동
2. **"Add provider"** 클릭 후 **"Clerk"** 선택
3. Clerk Dashboard에서 복사한 **Clerk domain**을 붙여넣기
4. **"Create connection"** 클릭

### 3. 환경 변수 설정

`.env.local` 파일에 다음 변수들이 설정되어 있는지 확인:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # 서버 사이드 전용
```

## 데이터베이스 스키마

### Users 테이블

`supabase/migrations/setup_schema.sql`에 정의된 `users` 테이블:

```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT NOT NULL UNIQUE,  -- Clerk User ID
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

### RLS 정책

Row Level Security (RLS)가 활성화되어 있으며, `auth.jwt()->>'sub'`로 Clerk user ID를 확인합니다:

- **SELECT**: 사용자는 자신의 레코드만 조회 가능
- **UPDATE**: 사용자는 자신의 레코드만 업데이트 가능
- **INSERT**: 사용자는 자신의 레코드만 삽입 가능

## 코드 사용법

### Server Component / Server Action

```tsx
// app/page.tsx
import { createClerkSupabaseClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = createClerkSupabaseClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .single();
  
  return <div>...</div>;
}
```

### Client Component

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';

export default function MyComponent() {
  const supabase = useClerkSupabaseClient();
  
  async function fetchData() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .single();
    return data;
  }
  
  return <div>...</div>;
}
```

### 공개 데이터 (인증 불필요)

```tsx
import { supabase } from '@/lib/supabase/client';

// RLS 정책이 'to anon'인 데이터에 접근
const { data } = await supabase
  .from('public_posts')
  .select('*');
```

### 관리자 작업 (RLS 우회)

```tsx
// app/api/admin/route.ts
import { getServiceRoleClient } from '@/lib/supabase/service-role';

export async function POST() {
  const supabase = getServiceRoleClient();
  
  // RLS를 우회하여 모든 데이터 접근 가능
  const { data } = await supabase
    .from('users')
    .select('*');
  
  return Response.json(data);
}
```

## 사용자 동기화

Clerk 사용자가 로그인하면 자동으로 Supabase `users` 테이블에 동기화됩니다.

### 동기화 흐름

1. 사용자가 Clerk로 로그인
2. `SyncUserProvider`가 `useSyncUser` 훅 실행
3. `/api/sync-user` API 라우트 호출
4. Clerk에서 사용자 정보 조회
5. Supabase `users` 테이블에 upsert (Service Role 사용)

### 수동 동기화

필요한 경우 수동으로 동기화할 수 있습니다:

```tsx
'use client';

import { useAuth } from '@clerk/nextjs';

export function SyncButton() {
  const { userId } = useAuth();
  
  async function handleSync() {
    const response = await fetch('/api/sync-user', {
      method: 'POST',
    });
    
    if (response.ok) {
      console.log('User synced successfully');
    }
  }
  
  return <button onClick={handleSync}>Sync User</button>;
}
```

## RLS 정책 작성 가이드

### 기본 패턴

Clerk user ID는 JWT의 `sub` 클레임에 저장됩니다:

```sql
-- 사용자 자신의 데이터만 조회
CREATE POLICY "Users can view own data"
ON your_table
FOR SELECT
TO authenticated
USING (
    user_id = (SELECT auth.jwt()->>'sub')
);

-- 사용자 자신의 데이터만 삽입
CREATE POLICY "Users can insert own data"
ON your_table
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = (SELECT auth.jwt()->>'sub')
);
```

### Storage RLS 정책

Storage 버킷의 RLS 정책 예시 (`supabase/migrations/setup_storage.sql` 참고):

```sql
-- 사용자는 자신의 폴더에만 업로드 가능
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'uploads' AND
    (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);
```

## 문제 해결

### RLS 정책이 작동하지 않는 경우

1. **Clerk 통합이 활성화되었는지 확인**
   - Clerk Dashboard에서 Supabase 통합 상태 확인
   - Supabase Dashboard에서 Clerk provider 연결 확인

2. **JWT에 `role: "authenticated"` 클레임이 있는지 확인**
   - Clerk 통합 활성화 시 자동으로 추가됨

3. **RLS가 활성화되었는지 확인**
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public';
   ```

4. **JWT 내용 확인 (디버깅용)**
   ```sql
   SELECT auth.jwt()->>'sub' as clerk_user_id;
   ```

### 토큰이 전달되지 않는 경우

1. **Server Component**: `auth().getToken()`이 올바르게 호출되는지 확인
2. **Client Component**: `useAuth().getToken()`이 올바르게 호출되는지 확인
3. **환경 변수**: `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 설정되었는지 확인

## 참고 자료

- [Clerk 공식 문서: Supabase 통합](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase 공식 문서: Third-Party Auth](https://supabase.com/docs/guides/auth/third-party/clerk)
- [예제 저장소: Clerk + Supabase + Next.js](https://github.com/clerk/clerk-supabase-nextjs)

## 마이그레이션 (JWT 템플릿 → 네이티브 통합)

기존에 JWT 템플릿을 사용하던 경우:

1. Clerk Dashboard에서 JWT 템플릿 제거 (선택사항)
2. Supabase Dashboard에서 Clerk를 Third-Party Auth Provider로 추가
3. 코드에서 `accessToken` 함수 사용 확인
4. RLS 정책이 `auth.jwt()->>'sub'`를 사용하는지 확인

## 보안 주의사항

- **Service Role Key**: 절대 클라이언트에 노출하지 마세요
- **RLS 정책**: 프로덕션에서는 반드시 활성화하세요
- **환경 변수**: `.env.local`을 `.gitignore`에 추가하세요
- **토큰 검증**: Supabase가 자동으로 Clerk 토큰을 검증합니다

