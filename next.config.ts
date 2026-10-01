import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site is one static page, built to plain files in out/ and served by
  // GitHub Pages (see .github/workflows/deploy.yml).
  output: "export",
};

export default nextConfig;
