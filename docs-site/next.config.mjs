import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/grades-tracker",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default withMDX(nextConfig);
