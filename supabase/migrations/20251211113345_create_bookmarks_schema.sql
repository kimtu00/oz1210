-- =====================================================
-- 마이그레이션: My Trip 북마크 스키마 생성
-- 작성일: 2025-12-11
-- 설명: My Trip 프로젝트의 북마크 기능을 위한 데이터베이스 스키마
--       - Clerk 인증 연동 (users.clerk_id)
--       - RLS 비활성화 (개발 환경)
--       - PRD 2.4.5 북마크 기능 구현
-- =====================================================

-- =====================================================
-- users 테이블 (Clerk 인증 연동)
-- =====================================================
-- Clerk 인증과 연동되는 사용자 정보를 저장하는 테이블
-- clerk_id를 통해 Clerk 사용자와 1:1 매핑

CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.users OWNER TO postgres;

-- Row Level Security (RLS) 비활성화
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.users IS 'Clerk 인증과 연동되는 사용자 정보';
COMMENT ON COLUMN public.users.clerk_id IS 'Clerk User ID (예: user_2abc...)';
COMMENT ON COLUMN public.users.name IS '사용자 이름';

-- =====================================================
-- bookmarks 테이블 (북마크 기능)
-- =====================================================
-- 사용자가 관광지를 북마크할 수 있는 기능
-- 각 사용자는 동일한 관광지를 한 번만 북마크 가능 (UNIQUE 제약)

CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content_id TEXT NOT NULL,  -- 한국관광공사 API의 contentid
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

    -- 동일 사용자가 같은 관광지를 중복 북마크하는 것을 방지
    CONSTRAINT unique_user_bookmark UNIQUE(user_id, content_id)
);

-- 테이블 소유자 설정
ALTER TABLE public.bookmarks OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_content_id ON public.bookmarks(content_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);

-- Row Level Security (RLS) 비활성화
ALTER TABLE public.bookmarks DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.bookmarks TO anon;
GRANT ALL ON TABLE public.bookmarks TO authenticated;
GRANT ALL ON TABLE public.bookmarks TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.bookmarks IS '사용자 북마크 정보 - 관광지 즐겨찾기';
COMMENT ON COLUMN public.bookmarks.user_id IS 'users 테이블의 사용자 ID';
COMMENT ON COLUMN public.bookmarks.content_id IS '한국관광공사 API contentid (예: 125266)';

