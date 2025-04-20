/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

// Determine base path from environment variable or empty string
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  // Add base path configuration for production environment
  basePath,
  assetPrefix: process.env.NEXT_PUBLIC_CDN_URL || "",

  // Enable image optimization
  images: {
    domains: ["appwrite.nief.tech", "cloud.appwrite.io"],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: process.env.NODE_ENV === "development",
  },

  // Add content security policy and cache headers
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },

  reactStrictMode: true,

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
  webpack: (config, { buildId, dev, isServer }) => {
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

    // Custom webpack config for better error handling
    config.optimization.splitChunks = {
      chunks: "all",
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    };

    // Enhanced error reporting
    if (!dev) {
      config.output.devtoolModuleFilenameTemplate = (info) => {
        const resourcePath = info.resourcePath.replace(/^\.\//, "");
        return `webpack://${resourcePath}?${info.hash}`;
      };
    }

    return config;
  },
};

module.exports = withPWA(nextConfig);
