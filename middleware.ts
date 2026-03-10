import { NextResponse, type NextRequest } from "next/server";
import { getDealerEntryRoute, isDealerAuthPath, isDealerLoginPath, isDealerPendingApprovalPath, isDealerProtectedPath, isDealerSignupPath, sanitizeDealerRedirectPath } from "@/shared/auth/auth-routing";
import { dealerSessionCookieName, dealerSessionSchema } from "@/shared/auth/session-contract";
import { appRoutes } from "@/shared/config/routes";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const session = await parseDealerSession(request.cookies.get(dealerSessionCookieName)?.value);

  if (!session) {
    if (isDealerProtectedPath(pathname) || isDealerPendingApprovalPath(pathname)) {
      const loginUrl = new URL(appRoutes.login(), request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (session.accessState === "active") {
    if (isDealerAuthPath(pathname)) {
      const destination = getDealerEntryRoute(
        session.accessState,
        sanitizeDealerRedirectPath(request.nextUrl.searchParams.get("next")),
      );

      return NextResponse.redirect(new URL(destination, request.url));
    }

    return NextResponse.next();
  }

  if (session.accessState === "incomplete_signup") {
    if (pathname === appRoutes.signupForm() || pathname === appRoutes.signupCard() || pathname === appRoutes.signupComplete()) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(appRoutes.signupForm(), request.url));
  }

  if (pathname === appRoutes.pendingApproval() || pathname === appRoutes.signupComplete()) {
    return NextResponse.next();
  }

  if (isDealerLoginPath(pathname) || isDealerSignupPath(pathname) || isDealerProtectedPath(pathname)) {
    return NextResponse.redirect(new URL(appRoutes.pendingApproval(), request.url));
  }

  return NextResponse.next();
}

async function parseDealerSession(rawValue?: string | null) {
  if (!rawValue) {
    return null;
  }

  const [payload, signature] = rawValue.split(".");

  if (!payload || !signature) {
    return null;
  }

  const isValid = await isValidSignature(payload, signature);

  if (!isValid) {
    return null;
  }

  try {
    const json = JSON.parse(decodeText(base64UrlDecode(payload)));
    return dealerSessionSchema.parse(json);
  } catch {
    return null;
  }
}

async function isValidSignature(payload: string, signature: string) {
  const secret = getSessionSecret();
  const key = await crypto.subtle.importKey(
    "raw",
    encodeText(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encodeText(payload)),
  );
  const received = base64UrlDecode(signature);

  if (expected.length !== received.length) {
    return false;
  }

  let diff = 0;

  for (let index = 0; index < expected.length; index += 1) {
    diff |= expected[index] ^ received[index];
  }

  return diff === 0;
}

function getSessionSecret() {
  if (process.env.AUTH_SESSION_SECRET) {
    return process.env.AUTH_SESSION_SECRET;
  }

  if (process.env.NODE_ENV !== "production") {
    return "cargo-web-local-session-secret";
  }

  throw new Error("AUTH_SESSION_SECRET is required in production.");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(`${normalized}${padding}`);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function encodeText(value: string) {
  return new TextEncoder().encode(value);
}

function decodeText(value: Uint8Array) {
  return new TextDecoder().decode(value);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
