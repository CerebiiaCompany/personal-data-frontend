import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

const nextConfig: NextConfig = {
  /* Performance optimizations */
  reactStrictMode: true,

  /**
   * Proxy del portal ARCO titular: evita CORS con x-arco-token en desarrollo
   * cuando el backend aún no expone ese header en Access-Control-Allow-Headers.
   */
  async rewrites() {
    return [
      {
        source: "/api/v1/arco/:path*",
        destination: `${apiBaseUrl}/arco/:path*`,
      },
    ];
  },
  
  /* Compiler optimizations */
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  /* Image optimization */
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  /* Experimental features for better performance */
  experimental: {
    optimizePackageImports: ["@iconify/react", "sonner"],
  },
};

export default withSentryConfig(nextConfig, {
  org: "cerebiia-sas",
  project: "javascript-nextjs",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  tunnelRoute: "/monitoring",
});
