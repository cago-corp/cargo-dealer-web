import { NextResponse, type NextRequest } from "next/server";
import { getDealerEntryRoute, isDealerAuthPath, isDealerLoginPath, isDealerPendingApprovalPath, isDealerProtectedPath, isDealerSignupPath, sanitizeDealerRedirectPath } from "@/shared/auth/auth-routing";
import { decodeDealerSessionCookieValue } from "@/shared/auth/session-codec";
import { dealerSessionCookieName } from "@/shared/auth/session-contract";
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

  const session = await decodeDealerSessionCookieValue(
    request.cookies.get(dealerSessionCookieName)?.value,
    getSessionSecret(),
  );

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

function getSessionSecret() {
  if (process.env.AUTH_SESSION_SECRET) {
    return process.env.AUTH_SESSION_SECRET;
  }

  if (process.env.NODE_ENV !== "production") {
    return "cargo-web-local-session-secret";
  }

  throw new Error("AUTH_SESSION_SECRET is required in production.");
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
