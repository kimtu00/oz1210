/**
 * @file Navbar.tsx
 * @description 메인 네비게이션 바
 *
 * 로고, 검색창, 네비게이션 링크, 로그인 버튼을 포함하는 헤더 컴포넌트입니다.
 */

"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { performanceMetricsStore } from "@/lib/utils/performance-metrics";

const Navbar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentKeyword = searchParams.get("keyword") || "";
  const [searchQuery, setSearchQuery] = useState(currentKeyword);
  const [isSearching, setIsSearching] = useState(false);

  // URL의 keyword가 변경되면 검색창 업데이트
  useEffect(() => {
    setSearchQuery(currentKeyword);
  }, [currentKeyword]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSearching) return;

    setIsSearching(true);
    const trimmedQuery = searchQuery.trim();
    performanceMetricsStore.measureSearch(trimmedQuery || "clear", () => {
      if (trimmedQuery) {
        // 기존 필터 파라미터 유지하면서 keyword 추가, 페이지는 1로 리셋
        const params = new URLSearchParams(searchParams.toString());
        params.set("keyword", trimmedQuery);
        params.delete("page"); // 검색 시 페이지 1로 리셋
        router.push(`/?${params.toString()}`);
      } else {
        // 검색어가 없으면 keyword 제거, 페이지도 제거
        const params = new URLSearchParams(searchParams.toString());
        params.delete("keyword");
        params.delete("page");
        const queryString = params.toString();
        router.push(queryString ? `/?${queryString}` : "/");
      }
      // 로딩 상태는 Suspense가 처리하므로 짧은 지연 후 리셋
      setTimeout(() => setIsSearching(false), 100);
    });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("keyword");
    params.delete("page"); // 검색어 제거 시 페이지도 제거
    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        {/* 로고 */}
        <Link href="/" className="text-xl font-bold">
          My Trip
        </Link>

        {/* 검색창 (데스크톱) */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md mx-4"
        >
          <div className="relative w-full">
            {isSearching ? (
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Loading size="sm" />
              </div>
            ) : (
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            )}
            <Input
              type="search"
              placeholder="관광지 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 w-full"
              disabled={isSearching}
            />
            {searchQuery && !isSearching && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="검색어 지우기"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        {/* 네비게이션 링크 */}
        <nav className="hidden md:flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            홈
          </Link>
          <Link
            href="/stats"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            통계
          </Link>
          <SignedIn>
            <Link
              href="/bookmarks"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              북마크
            </Link>
          </SignedIn>
        </nav>

        {/* 로그인 버튼 / UserButton */}
        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                로그인
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>

      {/* 검색창 (모바일) */}
      <div className="md:hidden border-t px-4 py-2">
        <form onSubmit={handleSearch}>
          <div className="relative">
            {isSearching ? (
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Loading size="sm" />
              </div>
            ) : (
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            )}
            <Input
              type="search"
              placeholder="관광지 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 w-full"
              disabled={isSearching}
            />
            {searchQuery && !isSearching && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="검색어 지우기"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </header>
  );
};

export default Navbar;
