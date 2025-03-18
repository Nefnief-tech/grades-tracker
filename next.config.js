/** @type {import('next').NextConfig} */
const nextConfig = {
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
