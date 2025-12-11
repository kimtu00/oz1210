# Supabase 설정 확인 가이드

## 개요

Phase 5의 Supabase 설정 확인 작업을 수행하기 위한 가이드입니다.

## 실행 방법

### 1. tsx 설치 (필요한 경우)

```bash
pnpm add -D tsx
```

### 2. 스크립트 실행

```bash
pnpm verify:supabase
```

또는

```bash
pnpm tsx scripts/verify-supabase-setup.ts
```

## 확인 항목

스크립트는 다음 항목들을 자동으로 확인합니다:

1. **테이블 존재 확인**
   - `users` 테이블 존재 여부
   - `bookmarks` 테이블 존재 여부

2. **테이블 구조 확인**
   - `users` 테이블의 컬럼 구조 (id, clerk_id, name, created_at)
   - `bookmarks` 테이블의 컬럼 구조 (id, user_id, content_id, created_at)

3. **UNIQUE 제약조건 확인**
   - `bookmarks` 테이블의 `(user_id, content_id)` UNIQUE 제약조건
   - 실제 중복 삽입 시도로 검증

4. **외래키 관계 확인**
   - `bookmarks.user_id` → `users.id` 외래키 관계
   - CASCADE 삭제 정책 확인

5. **인덱스 확인**
   - `idx_bookmarks_user_id`
   - `idx_bookmarks_content_id`
   - `idx_bookmarks_created_at`

6. **RLS 상태 확인**
   - `users` 테이블 RLS 비활성화 여부
   - `bookmarks` 테이블 RLS 비활성화 여부

## 예상 결과

### 모든 확인 항목이 통과된 경우

```
🎉 모든 확인 항목이 통과되었습니다!

📝 다음 단계:
   - Phase 5의 '북마크 목록 페이지' 개발을 진행하세요
```

### 문제가 발견된 경우

```
❌ 실패한 항목:
   - [항목명]: [에러 메시지]

💡 해결 방안:
   1. supabase/db.sql 스크립트를 Supabase SQL Editor에서 실행
   2. Supabase 대시보드에서 테이블 및 제약조건 확인
   3. 필요한 경우 마이그레이션 파일 생성 및 적용
```

## 수동 확인 방법

스크립트 실행이 불가능한 경우 또는 더 정확한 확인이 필요한 경우, Supabase 대시보드에서 직접 확인할 수 있습니다.

### 1. Supabase 대시보드 접속

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 "SQL Editor" 클릭

### 2. Table Editor에서 확인

1. 좌측 메뉴에서 "Table Editor" 클릭
2. `users` 테이블 확인
   - 컬럼: `id` (UUID), `clerk_id` (TEXT), `name` (TEXT), `created_at` (TIMESTAMP)
3. `bookmarks` 테이블 확인
   - 컬럼: `id` (UUID), `user_id` (UUID), `content_id` (TEXT), `created_at` (TIMESTAMP)
   - 외래키: `user_id` → `users.id`
   - UNIQUE 제약조건: `(user_id, content_id)`

### 3. SQL Editor에서 확인

다음 SQL 쿼리들을 순서대로 실행하여 정확한 상태를 확인할 수 있습니다:

#### 3.1 테이블 존재 확인

```sql
-- users, bookmarks 테이블 존재 여부 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'bookmarks')
ORDER BY table_name;
```

**예상 결과**: `users`, `bookmarks` 두 행이 반환되어야 합니다.

#### 3.2 테이블 구조 확인

```sql
-- users 테이블 구조 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- bookmarks 테이블 구조 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bookmarks'
ORDER BY ordinal_position;
```

**예상 결과**:
- `users`: `id` (uuid), `clerk_id` (text), `name` (text), `created_at` (timestamp with time zone)
- `bookmarks`: `id` (uuid), `user_id` (uuid), `content_id` (text), `created_at` (timestamp with time zone)

#### 3.3 UNIQUE 제약조건 확인

```sql
-- bookmarks 테이블의 UNIQUE 제약조건 확인
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS columns
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE' 
  AND tc.table_name = 'bookmarks'
GROUP BY tc.constraint_name, tc.table_name;
```

**예상 결과**: `unique_user_bookmark` 제약조건이 `user_id, content_id` 컬럼에 설정되어 있어야 합니다.

#### 3.4 외래키 관계 확인

```sql
-- bookmarks 테이블의 외래키 확인
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'bookmarks';
```

**예상 결과**: `bookmarks.user_id` → `users.id` 외래키 관계가 `CASCADE` 삭제 정책과 함께 설정되어 있어야 합니다.

#### 3.5 인덱스 확인

```sql
-- bookmarks 테이블의 인덱스 확인
SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'bookmarks'
ORDER BY indexname;
```

**예상 결과**: 다음 인덱스들이 존재해야 합니다:
- `idx_bookmarks_user_id` (또는 `bookmarks_user_id_idx`)
- `idx_bookmarks_content_id` (또는 `bookmarks_content_id_idx`)
- `idx_bookmarks_created_at` (또는 `bookmarks_created_at_idx`)

#### 3.6 RLS 상태 확인

```sql
-- users, bookmarks 테이블의 RLS 상태 확인
SELECT 
  tablename, 
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'bookmarks')
ORDER BY tablename;
```

**예상 결과**: `rowsecurity` 컬럼이 `false`여야 합니다 (RLS 비활성화).

## 문제 해결

### 테이블이 없는 경우

`supabase/db.sql` 파일의 내용을 Supabase SQL Editor에서 실행하세요.

### RLS가 활성화된 경우

개발 환경에서는 RLS를 비활성화해야 합니다:

```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks DISABLE ROW LEVEL SECURITY;
```

### UNIQUE 제약조건이 없는 경우

다음 SQL을 실행하여 UNIQUE 제약조건을 생성하세요:

```sql
ALTER TABLE public.bookmarks
ADD CONSTRAINT unique_user_bookmark UNIQUE(user_id, content_id);
```

### 외래키가 없는 경우

다음 SQL을 실행하여 외래키를 생성하세요:

```sql
ALTER TABLE public.bookmarks
ADD CONSTRAINT fk_bookmarks_user_id 
FOREIGN KEY (user_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE;
```

### 인덱스가 없는 경우

다음 SQL을 실행하여 인덱스를 생성하세요:

```sql
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_content_id ON public.bookmarks(content_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);
```

### 전체 스키마 재생성

모든 문제를 한 번에 해결하려면 `supabase/db.sql` 파일의 전체 내용을 Supabase SQL Editor에서 실행하세요.

## 참고 파일

- `supabase/db.sql`: 데이터베이스 스키마 정의
- `scripts/verify-supabase-setup.ts`: 확인 스크립트
- `lib/api/supabase-api.ts`: Supabase API 클라이언트

