import type { NextConfig } from "next";

// 번들 분석 설정
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      {
        protocol: "https",
        hostname: "**.go.kr", // 한국관광공사 이미지
      },
      {
        protocol: "https",
        hostname: "**.naver.com", // 네이버 지도 관련
      },
    ],
  },
  // 성능 최적화 설정
  compiler: {
    // 프로덕션 빌드에서 console 제거 (선택 사항)
    // removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    // 큰 패키지 최적화 (lucide-react 등)
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  // SWC 최소화는 기본적으로 활성화됨
};

export default withBundleAnalyzer(nextConfig);
