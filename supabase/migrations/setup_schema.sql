-- Users 테이블 생성
-- Clerk 인증과 연동되는 사용자 정보를 저장하는 테이블
-- 2025년 4월 이후 권장되는 네이티브 통합 방식 사용

CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.users OWNER TO postgres;

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) 활성화
-- 2025년 네이티브 통합: auth.jwt()->>'sub'로 Clerk user ID 확인
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 레코드만 조회 가능
CREATE POLICY "Users can view own record"
ON public.users
FOR SELECT
TO authenticated
USING (
    clerk_id = (SELECT auth.jwt()->>'sub')
);

-- RLS 정책: 사용자는 자신의 레코드만 업데이트 가능
CREATE POLICY "Users can update own record"
ON public.users
FOR UPDATE
TO authenticated
USING (
    clerk_id = (SELECT auth.jwt()->>'sub')
)
WITH CHECK (
    clerk_id = (SELECT auth.jwt()->>'sub')
);

-- RLS 정책: 인증된 사용자는 자신의 레코드만 삽입 가능
-- (일반적으로 서비스 역할로 동기화하지만, 클라이언트에서도 가능하도록)
CREATE POLICY "Users can insert own record"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
    clerk_id = (SELECT auth.jwt()->>'sub')
);

-- 권한 부여
GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;
