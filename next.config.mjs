/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';


// 增强的缓存策略
const customRuntimeCaching = [
  // 音频文件缓存
  {
    urlPattern: /\.(?:mp3|wav|ogg)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'audio-cache',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 天
      },
    },
  },
  // 图片资源缓存
  {
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'image-cache',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 天
      },
    },
  },
  // 静态资源缓存
  {
    urlPattern: /\.(?:js|css)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-resources',
      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 24 * 60 * 60, // 1 天
      },
    },
  },
  // API 请求缓存
  {
    urlPattern: /^https:\/\/api\.*/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'api-cache',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 分钟
      },
      networkTimeoutSeconds: 3,
    },
  },
  // 页面缓存
  {
    urlPattern: /^https:\/\/.*\//,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'page-cache',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60, // 1 小时
      },
    },
  },
];

const nextConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: customRuntimeCaching,
})({
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  compress: true,
  poweredByHeader: false,
});

export default nextConfig;
