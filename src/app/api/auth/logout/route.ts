import { NextResponse } from "next/server";
import { getDealerAuthClient } from "@/shared/auth/get-dealer-auth-client";
import {
  clearDealerSessionCookie,
  getDealerSession,
} from "@/shared/auth/session";

export async function POST() {
  const session = await getDealerSession();
  const authClient = getDealerAuthClient();

  await authClient.logout(session);

  const response = NextResponse.json({ ok: true });
  clearDealerSessionCookie(response);
  return response;
}
