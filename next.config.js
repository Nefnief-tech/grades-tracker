/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,

  output: "standalone",

  // Add this to fix path resolution issues
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fix duplicate module resolution paths
      config.resolve.alias = {
        ...config.resolve.alias,
        "@/app": "/app",
      };
    }
    return config;
  },

  // Define environment variables with defaults
  env: {
    NEXT_PUBLIC_APPWRITE_ENDPOINT:
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "",
    NEXT_PUBLIC_APPWRITE_PROJECT_ID:
      process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
    NEXT_PUBLIC_APPWRITE_DATABASE_ID:
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
    NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID:
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "",
    NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID:
      process.env.NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID || "",
    NEXT_PUBLIC_APPWRITE_GRADES_COLLECTION_ID:
      process.env.NEXT_PUBLIC_APPWRITE_GRADES_COLLECTION_ID || "",
    NEXT_PUBLIC_APPWRITE_POMODORO_COLLECTION_ID:
      process.env.NEXT_PUBLIC_APPWRITE_POMODORO_COLLECTION_ID || "",
    NEXT_PUBLIC_ENABLE_CLOUD_FEATURES:
      process.env.NEXT_PUBLIC_ENABLE_CLOUD_FEATURES || "true",
    NEXT_PUBLIC_ENABLE_ENCRYPTION:
      process.env.NEXT_PUBLIC_ENABLE_ENCRYPTION || "true",
    NEXT_PUBLIC_DEBUG: process.env.NEXT_PUBLIC_DEBUG || "false",
  },

  // Log environment setup during build time to help with debugging
  onDemandEntries: {
    // Add any specific config here
  },

  // Handle redirects
  async redirects() {
    return [
      {
        source: "/app",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Optimize image loading
  images: {
    domains: ["cloud.appwrite.io"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

// Log environment variables during build (without revealing secrets)
console.log("Building Next.js with environment:");
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log(
  "- NEXT_PUBLIC_APPWRITE_ENDPOINT:",
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ? "Set ✓" : "Not set ✗"
);
console.log(
  "- NEXT_PUBLIC_APPWRITE_PROJECT_ID:",
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ? "Set ✓" : "Not set ✗"
);
console.log(
  "- NEXT_PUBLIC_APPWRITE_DATABASE_ID:",
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ? "Set ✓" : "Not set ✗"
);

module.exports = withPWA(nextConfig);
