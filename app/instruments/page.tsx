/**
 * @file page.tsx
 * @description Supabase 데이터 조회 예제 페이지
 *
 * Supabase 공식 가이드를 참고한 예제입니다:
 * https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 *
 * 이 페이지는 Supabase에서 데이터를 조회하는 방법을 보여줍니다.
 * Clerk 인증이 필요한 경우 `createClerkSupabaseClient()`를 사용합니다.
 */

import { Suspense } from "react";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * Instruments 데이터를 조회하는 Server Component
 */
async function InstrumentsData() {
  const supabase = createClerkSupabaseClient();
  const { data: instruments, error } = await supabase
    .from("instruments")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 dark:bg-red-950/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">오류 발생</h2>
        <p className="text-red-600 dark:text-red-400 mb-4">{error.message}</p>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          instruments 테이블이 존재하지 않을 수 있습니다. Supabase SQL Editor에서 다음 쿼리를 실행하세요:
        </p>
        <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
          {`-- Create the table
CREATE TABLE IF NOT EXISTS instruments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL
);

-- Insert sample data
INSERT INTO instruments (name)
VALUES ('violin'), ('viola'), ('cello')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;

-- Create public read policy
CREATE POLICY "public can read instruments"
ON instruments
FOR SELECT
TO anon
USING (true);`}
        </pre>
      </div>
    );
  }

  if (!instruments || instruments.length === 0) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">데이터 없음</h2>
        <p className="text-gray-600 dark:text-gray-400">instruments 테이블에 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Instruments 목록</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Supabase에서 조회한 데이터입니다.</p>
        <ul className="space-y-2">
          {instruments.map((instrument: { id: number; name: string }) => (
            <li
              key={instrument.id}
              className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{instrument.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">ID: {instrument.id}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Raw JSON 데이터</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">디버깅용 JSON 출력</p>
        <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
          {JSON.stringify(instruments, null, 2)}
        </pre>
      </div>
    </div>
  );
}

/**
 * Instruments 페이지
 *
 * Supabase 공식 가이드를 참고한 예제 페이지입니다.
 */
export default function InstrumentsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Supabase 데이터 조회 예제</h1>
        <p className="text-gray-600 dark:text-gray-400">
          이 페이지는 Supabase에서 데이터를 조회하는 방법을 보여줍니다.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          참고:{" "}
          <a
            href="https://supabase.com/docs/guides/getting-started/quickstarts/nextjs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Supabase 공식 Next.js 가이드
          </a>
        </p>
      </div>

      <Suspense
        fallback={
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">로딩 중...</h2>
            <p className="text-gray-600 dark:text-gray-400">데이터를 불러오는 중입니다.</p>
          </div>
        }
      >
        <InstrumentsData />
      </Suspense>
    </div>
  );
}

