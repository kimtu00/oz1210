/**
 * @file server.ts
 * @description Clerk + Supabase 네이티브 통합 클라이언트 (Server Component/Server Action용)
 *
 * 2025년 4월 이후 권장되는 네이티브 통합 방식:
 * - JWT 템플릿 불필요
 * - Supabase JWT secret key를 Clerk와 공유할 필요 없음
 * - Clerk 세션 토큰을 직접 Supabase에 전달
 * - Supabase가 자동으로 Clerk 토큰 검증
 *
 * 주요 기능:
 * - Server Component에서 인증된 사용자의 데이터 접근
 * - Server Action에서 데이터 조작
 * - RLS 정책이 `auth.jwt()->>'sub'`로 Clerk user ID 확인
 *
 * @dependencies
 * - @supabase/supabase-js: Supabase 클라이언트 라이브러리
 * - @clerk/nextjs/server: Clerk 서버 사이드 인증
 *
 * @see {@link /docs/clerk-supabase-integration.md} - 통합 가이드
 */

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 생성 (Server Component/Server Action용)
 *
 * 이 함수는 Server Component나 Server Action에서 사용합니다.
 * Clerk 세션 토큰을 자동으로 Supabase 요청에 포함시킵니다.
 *
 * @returns Supabase 클라이언트 인스턴스 (Clerk 인증 포함)
 *
 * @example
 * ```tsx
 * // Server Component
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 *
 * export default async function MyPage() {
 *   const supabase = createClerkSupabaseClient();
 *   const { data, error } = await supabase
 *     .from('users')
 *     .select('*')
 *     .single();
 *   
 *   return <div>{data?.name}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Server Action
 * 'use server';
 *
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 *
 * export async function updateUser(name: string) {
 *   const supabase = createClerkSupabaseClient();
 *   const { error } = await supabase
 *     .from('users')
 *     .update({ name })
 *     .eq('clerk_id', (await auth()).userId!);
 *   
 *   if (error) throw error;
 * }
 * ```
 */
export function createClerkSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      const { getToken } = await auth();
      return (await getToken()) ?? null;
    },
  });
}
