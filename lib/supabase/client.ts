/**
 * @file client.ts
 * @description Supabase 클라이언트 (공개 데이터용, 인증 불필요)
 *
 * 이 클라이언트는 인증이 필요 없는 공개 데이터에 접근할 때 사용합니다.
 * RLS 정책이 'to anon'인 데이터만 접근 가능합니다.
 *
 * 인증이 필요한 경우:
 * - Server Component: `lib/supabase/server.ts`의 `createClerkSupabaseClient()` 사용
 * - Client Component: `lib/supabase/clerk-client.ts`의 `useClerkSupabaseClient()` 사용
 *
 * @dependencies
 * - @supabase/supabase-js: Supabase 클라이언트 라이브러리
 *
 * @see {@link https://supabase.com/docs/guides/getting-started/quickstarts/nextjs} - Supabase 공식 가이드
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

/**
 * 공개 데이터용 Supabase 클라이언트
 *
 * 인증이 필요 없는 공개 데이터에 접근할 때 사용합니다.
 * RLS 정책이 'to anon'인 데이터만 접근 가능합니다.
 *
 * @example
 * ```tsx
 * import { supabase } from '@/lib/supabase/client';
 *
 * // 공개 데이터 조회
 * const { data } = await supabase
 *   .from('public_posts')
 *   .select('*');
 * ```
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
