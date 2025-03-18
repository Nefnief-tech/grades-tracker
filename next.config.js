/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable image optimization
  images: {
    domains: ["localhost"],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Add content security policy
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
  // Disable TypeScript checking during build if environment variable is set
  typescript: {
    // This will completely ignore TypeScript errors during build
    ignoreBuildErrors: process.env.NEXT_TYPECHECK === "false",
  },
  // Update deprecated options
  experimental: {
    // With this:
    serverExternalPackages: [
      // Add your external packages here
    ],
  },
};

module.exports = nextConfig;
