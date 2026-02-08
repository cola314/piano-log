import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/piano-log",
  images: { unoptimized: true },
};

export default nextConfig;
