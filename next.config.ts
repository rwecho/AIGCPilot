import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.aigc.cn',
      },
      {
        protocol: 'https',
        hostname: 'aigc.izzi.cn',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      // 允许所有 https 图片（如果你需要采集更多源，可以使用这个通用通配符）
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
};

export default nextConfig;
