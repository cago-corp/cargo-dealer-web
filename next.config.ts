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

const remotePatterns = [
  toRemotePattern(process.env.SUPABASE_URL),
  toRemotePattern(process.env.SUPABASE_IMAGE_BASE_URL),
].filter((pattern): pattern is NonNullable<typeof pattern> => pattern !== null);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
  },
};

export default nextConfig;
