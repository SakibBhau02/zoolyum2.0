import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * The CSP is enforced. It keeps `'unsafe-inline'` for Next's bootstrap script
 * and for the animation layer's inline styles — a nonce-based policy would
 * force every page to render per request, which would undo the static/ISR
 * output this site relies on. What it does lock down: script and style
 * origins, `eval`, form targets, frame ancestors, and `object`/`base` abuse.
 *
 * `unsafe-eval` is only needed by the dev overlay and React Refresh, so it is
 * dropped from the production policy.
 */
const isDev = process.env.NODE_ENV !== "production";

/**
 * Hosts the browser loads images from. The image optimiser already trusts
 * these; the CSP has to agree or `<img>`/`unoptimized` images are blocked.
 * R2 is optional, so resolve it from the same env the remotePatterns use.
 */
const r2Origin = (() => {
  try {
    return process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).origin : "";
  } catch {
    return "";
  }
})();
const youtubeThumbs = ["https://i.ytimg.com", "https://img.youtube.com"];
const imageHosts = [...youtubeThumbs, r2Origin].filter(Boolean).join(" ");

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com https://*.clarity.ms https://va.vercel-scripts.com https://connect.facebook.net`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com https://*.clarity.ms https://www.facebook.com ${imageHosts}`.trim(),
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.clarity.ms https://vitals.vercel-insights.com https://*.vercel-insights.com https://va.vercel-scripts.com https://connect.facebook.net https://www.facebook.com",
  "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com",
  "media-src 'self'",
  // `upgrade-insecure-requests` is only meaningful in an enforced policy; a
  // Report-Only header logs an error instead. Add it back when the policy is
  // promoted from Report-Only.
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // sharp is a native module; keep it out of the bundler.
  serverExternalPackages: ["sharp"],
  experimental: {
    // Keeps barrel imports from pulling the whole animation runtime into
    // routes that only use one hook.
    optimizePackageImports: ["lenis"],
    // Server Actions have a 1 MB request-body cap by default. Careers accepts
    // documents up to 10 MB and the media library up to 5 MB, so the framework
    // limit has to sit above both (multipart overhead included). The actions
    // re-check the real per-file/per-request limits in `lib/storage.ts`.
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      ...(process.env.R2_PUBLIC_URL
        ? (() => {
            try {
              const u = new URL(process.env.R2_PUBLIC_URL);
              return [{ protocol: u.protocol.replace(":", "") as "https" | "http", hostname: u.hostname }];
            } catch {
              return [];
            }
          })()
        : []),
    ],
  },
  async redirects() {
    return [
      { source: "/territory", destination: "/work", permanent: true },
      { source: "/territory/:slug", destination: "/work/:slug", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // Uploaded files (resumes, media) must never be sniffed or indexed.
        // `sandbox` neutralises script execution if an SVG is opened directly.
        source: "/uploads/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Content-Security-Policy", value: "sandbox; default-src 'none'; style-src 'unsafe-inline'; img-src data:" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
