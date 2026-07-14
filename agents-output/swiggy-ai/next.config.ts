import type { NextConfig } from "next";

// Who may embed the app in an iframe: the case study on GitHub Pages and the
// Claude artifact viewer. Everyone else is blocked (clickjacking protection).
const FRAME_ANCESTORS = [
  "'self'",
  "https://sharmasimran22122001-lang.github.io",
  "https://claude.ai",
  "https://*.claude.ai",
  "https://*.claudeusercontent.com",
].join(" ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: `frame-ancestors ${FRAME_ANCESTORS}` },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
