import type { NextConfig } from "next";

const isBrowserTestServer = Boolean(process.env.NEXT_DIST_DIR);

const nextConfig: NextConfig = {
    output: "standalone",
    ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
    ...(isBrowserTestServer ? { typescript: { tsconfigPath: "tsconfig.browser-tests.json" } } : {}),
};

export default nextConfig;
