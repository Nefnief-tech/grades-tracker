/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Enable standalone output for Docker
  swcMinify: true,
  reactStrictMode: true,
  experimental: {
    // Enable you to use React Server Components if needed
    serverComponentsExternalPackages: [],
  },
};

module.exports = nextConfig;
