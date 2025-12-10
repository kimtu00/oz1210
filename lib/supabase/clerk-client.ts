/**
 * @file clerk-client.ts
 * @description Clerk + Supabase 네이티브 통합 클라이언트 (Client Component용)
 *
 * 2025년 4월 이후 권장되는 네이티브 통합 방식:
 * - JWT 템플릿 불필요
 * - useAuth().getToken()으로 현재 세션 토큰 사용
 * - React Hook으로 제공되어 Client Component에서 사용
 * - Clerk 세션 토큰이 자동으로 Supabase 요청에 포함됨
 *
 * 주요 기능:
 * - Client Component에서 인증된 사용자의 데이터 접근
 * - 실시간 데이터 구독 (Realtime)
 * - Storage 파일 업로드/다운로드
 *
 * @dependencies
 * - @supabase/supabase-js: Supabase 클라이언트 라이브러리
 * - @clerk/nextjs: Clerk 클라이언트 사이드 인증
 *
 * @see {@link /docs/clerk-supabase-integration.md} - 통합 가이드
 */

"use client";

import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 훅 (Client Component용)
 *
 * 이 훅은 Client Component에서 사용합니다.
 * Clerk 세션 토큰을 자동으로 Supabase 요청에 포함시킵니다.
 *
 * @returns Supabase 클라이언트 인스턴스 (Clerk 인증 포함)
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 * import { useEffect, useState } from 'react';
 *
 * export default function MyComponent() {
 *   const supabase = useClerkSupabaseClient();
 *   const [data, setData] = useState(null);
 *
 *   useEffect(() => {
 *     async function fetchData() {
 *       const { data, error } = await supabase
 *         .from('users')
 *         .select('*')
 *         .single();
 *       
 *       if (error) {
 *         console.error(error);
 *         return;
 *       }
 *       
 *       setData(data);
 *     }
 *
 *     fetchData();
 *   }, [supabase]);
 *
 *   return <div>{data?.name}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // 실시간 구독 예시
 * 'use client';
 *
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 * import { useEffect } from 'react';
 *
 * export default function RealtimeComponent() {
 *   const supabase = useClerkSupabaseClient();
 *
 *   useEffect(() => {
 *     const channel = supabase
 *       .channel('users')
 *       .on('postgres_changes', {
 *         event: '*',
 *         schema: 'public',
 *         table: 'users',
 *       }, (payload) => {
 *         console.log('Change received!', payload);
 *       })
 *       .subscribe();
 *
 *     return () => {
 *       supabase.removeChannel(channel);
 *     };
 *   }, [supabase]);
 *
 *   return <div>Listening for changes...</div>;
 * }
 * ```
 */
export function useClerkSupabaseClient() {
  const { getToken } = useAuth();

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
    }

    return createClient(supabaseUrl, supabaseKey, {
      async accessToken() {
        return (await getToken()) ?? null;
      },
    });
  }, [getToken]);

  return supabase;
}
