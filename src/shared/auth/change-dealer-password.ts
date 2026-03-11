import "server-only";

import { DealerAuthError } from "@/shared/auth/auth-error";
import { changeMockDealerPassword } from "@/shared/auth/clients/mock-dealer-auth-client";
import type { DealerSession } from "@/shared/auth/auth-types";
import { getServerEnv } from "@/shared/config/env";

export async function changeDealerPassword(input: {
  session: DealerSession;
  currentPassword: string;
  nextPassword: string;
}) {
  switch (input.session.backend) {
    case "mock":
      changeMockDealerPassword({
        email: input.session.email,
        currentPassword: input.currentPassword,
        nextPassword: input.nextPassword,
      });
      return;
    case "supabase":
      await changeSupabaseDealerPassword(input);
      return;
    case "spring":
    default:
      throw new DealerAuthError("비밀번호 변경은 아직 지원되지 않습니다.", 501);
  }
}

async function changeSupabaseDealerPassword(input: {
  session: DealerSession;
  currentPassword: string;
  nextPassword: string;
}) {
  const env = getServerEnv();
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new DealerAuthError("비밀번호 변경 구성이 올바르지 않습니다.", 500);
  }

  const verifyResponse = await fetch(
    `${env.SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        email: input.session.email,
        password: input.currentPassword,
      }),
    },
  );

  const verifyJson = await verifyResponse.json().catch(() => null);
  if (!verifyResponse.ok) {
    throw new DealerAuthError(
      readErrorMessage(verifyJson) ?? "현재 비밀번호를 확인해 주세요.",
      verifyResponse.status,
    );
  }

  const accessToken =
    typeof verifyJson?.access_token === "string"
      ? verifyJson.access_token
      : input.session.accessToken;

  if (!accessToken) {
    throw new DealerAuthError("로그인 세션을 다시 확인해 주세요.", 401);
  }

  const updateResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      password: input.nextPassword,
    }),
  });

  const updateJson = await updateResponse.json().catch(() => null);
  if (!updateResponse.ok) {
    throw new DealerAuthError(
      readErrorMessage(updateJson) ?? "비밀번호를 변경하지 못했습니다.",
      updateResponse.status,
    );
  }
}

function readErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const message = record.msg ?? record.message ?? record.error_description ?? record.error;
  return typeof message === "string" ? message : null;
}
