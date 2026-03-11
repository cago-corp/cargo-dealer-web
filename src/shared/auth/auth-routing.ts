import type { DealerAccessState } from "@/shared/auth/auth-types";
import { appRoutes } from "@/shared/config/routes";

const protectedRoutePrefixes = [
  "/home",
  "/favorites",
  "/bids",
  "/deals",
  "/chat",
  "/chat-window",
  "/mypage",
  "/dashboard",
  "/quote",
  "/quotes",
] as const;

const signupRoutePrefixes = [
  "/signup-terms",
  "/signup-form",
  "/signup-card",
  "/signup-complete",
] as const;

export function isDealerProtectedPath(pathname: string) {
  return protectedRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isDealerSignupPath(pathname: string) {
  return signupRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isDealerLoginPath(pathname: string) {
  return (
    pathname === appRoutes.login() ||
    pathname === appRoutes.findId() ||
    pathname === appRoutes.findPassword()
  );
}

export function isDealerPendingApprovalPath(pathname: string) {
  return pathname === appRoutes.pendingApproval();
}

export function isDealerAuthPath(pathname: string) {
  return (
    isDealerLoginPath(pathname) ||
    isDealerSignupPath(pathname) ||
    isDealerPendingApprovalPath(pathname)
  );
}

export function getDealerEntryRoute(
  accessState: DealerAccessState,
  requestedPath?: string | null,
) {
  switch (accessState) {
    case "incomplete_signup":
      return appRoutes.signupForm();
    case "pending_approval":
      return appRoutes.pendingApproval();
    case "active":
    default:
      return sanitizeDealerRedirectPath(requestedPath) ?? appRoutes.home();
  }
}

export function sanitizeDealerRedirectPath(value?: string | null) {
  if (!value || !value.startsWith("/")) {
    return null;
  }

  if (value.startsWith("//") || value.startsWith("/api/")) {
    return null;
  }

  if (isDealerAuthPath(value)) {
    return null;
  }

  return value;
}
