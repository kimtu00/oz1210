-- Instruments 예제 테이블 생성
-- Supabase 공식 Next.js 가이드 참고: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
-- 
-- 이 마이그레이션은 Supabase 연결 테스트를 위한 예제 테이블을 생성합니다.
-- /app/instruments 페이지에서 이 데이터를 조회할 수 있습니다.

-- 테이블 생성
CREATE TABLE IF NOT EXISTS public.instruments (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 샘플 데이터 삽입
INSERT INTO public.instruments (name)
VALUES 
    ('violin'),
    ('viola'),
    ('cello')
ON CONFLICT DO NOTHING;

-- RLS 활성화
ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (anon 사용자도 읽기 가능)
CREATE POLICY "public can read instruments"
ON public.instruments
FOR SELECT
TO anon
USING (true);

-- 인증된 사용자 읽기 정책
CREATE POLICY "authenticated can read instruments"
ON public.instruments
FOR SELECT
TO authenticated
USING (true);

-- 권한 부여
GRANT SELECT ON TABLE public.instruments TO anon;
GRANT SELECT ON TABLE public.instruments TO authenticated;

