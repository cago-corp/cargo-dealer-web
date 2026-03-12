import "server-only";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { DealerSession } from "@/shared/auth/auth-types";
import {
  decodeDealerSessionCookieValue,
  encodeDealerSessionCookieValue,
} from "@/shared/auth/session-codec";
import {
  dealerSessionCookieName,
} from "@/shared/auth/session-contract";
import { getServerEnv } from "@/shared/config/env";

export async function getDealerSession(): Promise<DealerSession | null> {
  const cookieStore = await cookies();
  return decodeDealerSessionCookieValue(
    cookieStore.get(dealerSessionCookieName)?.value,
    getSessionSecret(),
  );
}

export async function setDealerSessionCookie(response: NextResponse, session: DealerSession) {
  response.cookies.set({
    name: dealerSessionCookieName,
    value: await encodeDealerSessionCookieValue(session, getSessionSecret()),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(session.expiresAt),
  });
}

export function clearDealerSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: dealerSessionCookieName,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

function getSessionSecret() {
  const env = getServerEnv();
  if (env.AUTH_SESSION_SECRET) {
    return env.AUTH_SESSION_SECRET;
  }

  if (process.env.NODE_ENV !== "production") {
    return "cargo-web-local-session-secret";
  }

  throw new Error("AUTH_SESSION_SECRET is required in production.");
}
