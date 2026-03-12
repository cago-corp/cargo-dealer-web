import { DealerAuthError } from "@/shared/auth/auth-error";

export function getSafeRouteErrorMessage(error: unknown, fallback: string) {
  if (error instanceof DealerAuthError && error.statusCode >= 400 && error.statusCode < 500) {
    return error.message;
  }

  return fallback;
}

export function getSafeRouteErrorStatus(error: unknown, defaultStatus = 500) {
  if (error instanceof DealerAuthError && error.statusCode >= 400 && error.statusCode < 500) {
    return error.statusCode;
  }

  return defaultStatus;
}
