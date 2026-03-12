import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

function toRemotePattern(rawUrl?: string): RemotePattern | null {
  if (!rawUrl) {
    return null;
  }

  try {
    const url = new URL(rawUrl);
    const pathname = url.pathname.endsWith("/")
      ? `${url.pathname}**`
      : `${url.pathname}/**`;
    const protocol = url.protocol === "http:" ? "http" : "https";

    return {
      protocol,
      hostname: url.hostname,
      port: url.port || "",
      pathname,
    };
  } catch {
    return null;
  }
}

function toOrigin(rawUrl?: string) {
  if (!rawUrl) {
    return null;
  }

  try {
    const url = new URL(rawUrl);
    return url.origin;
  } catch {
    return null;
  }
}

const remotePatterns = [
  toRemotePattern(process.env.SUPABASE_URL),
  toRemotePattern(process.env.SUPABASE_IMAGE_BASE_URL),
].filter((pattern): pattern is NonNullable<typeof pattern> => pattern !== null);

const externalOrigins = [
  toOrigin(process.env.SUPABASE_URL),
  toOrigin(process.env.SUPABASE_IMAGE_BASE_URL),
].filter((origin): origin is string => origin !== null);

const externalWsOrigins = externalOrigins.map((origin) =>
  origin.startsWith("https://") ? origin.replace("https://", "wss://") : origin.replace("http://", "ws://"),
);

function buildContentSecurityPolicy() {
  const connectSources = [
    "'self'",
    ...externalOrigins,
    ...externalWsOrigins,
    ...(process.env.NODE_ENV !== "production" ? ["ws:", "wss:"] : []),
  ].join(" ");
  const mediaSources = ["'self'", "blob:", "data:", ...externalOrigins].join(" ");
  const imageSources = ["'self'", "blob:", "data:", ...externalOrigins].join(" ");
  const scriptSources = [
    "'self'",
    "'unsafe-inline'",
    ...(process.env.NODE_ENV !== "production" ? ["'unsafe-eval'"] : []),
  ].join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSources}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imageSources}`,
    "font-src 'self' data:",
    `connect-src ${connectSources}`,
    `media-src ${mediaSources}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
  },
  async headers() {
    const headers = [
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
      },
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin",
      },
      {
        key: "Cross-Origin-Resource-Policy",
        value: "same-site",
      },
      {
        key: "Content-Security-Policy",
        value: buildContentSecurityPolicy(),
      },
    ];

    if (process.env.NODE_ENV === "production") {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/:path*",
        headers,
      },
    ];
  },
};

export default nextConfig;
