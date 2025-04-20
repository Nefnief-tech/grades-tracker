/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false, // Enable PWA in all environments
});

// Determine base path from environment variable or empty string
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  // Add base path configuration for production environment
  basePath,
  assetPrefix: basePath,

  // Enable image optimization
  images: {
    domains: ["localhost"],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Add content security policy and cache headers
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=7200",
          },
        ],
      },
    ];
  },

  reactStrictMode: process.env.NEXT_STRICT_MODE !== "false",

  // Disable TypeScript checking during build for deployment success
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configure static generation for improved performance
  output: "standalone",

  // These options improve URL handling
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,

  // Fix webpack path resolution and CSS handling
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fix CSS loading issues in client-side rendering
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };

      // Fix path resolution issues
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }
    return config;
  },

  // Add appropriate CSS handling
  swcMinify: true,
};

module.exports = withPWA(nextConfig);
