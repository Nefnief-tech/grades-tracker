/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true, // For better debugging in production

  images: {
    domains: ["appwrite.nief.tech", "cloud.appwrite.io"],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Explicitly set output to export static files
  output: "export",

  // Disable various optimizations that might be causing issues
  swcMinify: false,

  // Simplified webpack config focused on CSS reliability
  webpack: (config, { dev }) => {
    // Ensure CSS handling is reliable
    if (!dev) {
      // Use more conservative CSS minification
      const rules = config.module.rules
        .find((rule) => typeof rule.oneOf === "object")
        .oneOf.filter((rule) => Array.isArray(rule.use));

      rules.forEach((rule) => {
        rule.use.forEach((moduleLoader) => {
          if (
            moduleLoader.loader?.includes("css-loader") &&
            !moduleLoader.loader?.includes("postcss-loader") &&
            typeof moduleLoader.options.modules === "object"
          ) {
            moduleLoader.options = {
              ...moduleLoader.options,
              modules: {
                ...moduleLoader.options.modules,
                // Use a more reliable class name format
                getLocalIdent: (context, _, exportName) => {
                  return `${context.resourcePath
                    .split("/")
                    .pop()
                    .replace(/\.[^.]+$/, "")}_${exportName}`;
                },
              },
            };
          }
        });
      });
    }

    return config;
  },
};

module.exports = withPWA(nextConfig);
