import type { NextConfig } from "next";

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
};

export default nextConfig;
