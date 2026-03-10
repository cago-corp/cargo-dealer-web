import "server-only";

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { NextResponse } from "next/server";
import type { DealerSession } from "@/shared/auth/auth-types";
import { getServerEnv } from "@/shared/config/env";

const dealerSessionSchema = z.object({
  backend: z.enum(["mock", "supabase", "spring"]),
  dealerId: z.string(),
  email: z.string().email(),
  approvalStatus: z.enum(["active", "pending"]),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.string().datetime(),
});

const dealerSessionCookieName = "cargo_dealer_session";

export async function getDealerSession(): Promise<DealerSession | null> {
  const cookieStore = await cookies();
  return parseDealerSession(cookieStore.get(dealerSessionCookieName)?.value);
}

export function setDealerSessionCookie(response: NextResponse, session: DealerSession) {
  response.cookies.set({
    name: dealerSessionCookieName,
    value: serializeDealerSession(session),
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

function serializeDealerSession(session: DealerSession) {
  const payload = Buffer.from(
    JSON.stringify(dealerSessionSchema.parse(session)),
    "utf8",
  ).toString("base64url");
  const signature = signPayload(payload).toString("base64url");

  return `${payload}.${signature}`;
}

function parseDealerSession(rawValue?: string | null): DealerSession | null {
  if (!rawValue) {
    return null;
  }

  const [payload, signature] = rawValue.split(".");
  if (!payload || !signature) {
    return null;
  }

  if (!isValidSignature(payload, signature)) {
    return null;
  }

  try {
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return dealerSessionSchema.parse(json);
  } catch {
    return null;
  }
}

function isValidSignature(payload: string, signature: string) {
  try {
    const expected = signPayload(payload);
    const received = Buffer.from(signature, "base64url");

    return expected.length === received.length && timingSafeEqual(expected, received);
  } catch {
    return false;
  }
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest();
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
