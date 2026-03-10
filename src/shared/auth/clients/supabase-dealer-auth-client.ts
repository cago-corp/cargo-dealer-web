import { z } from "zod";
import { DealerAuthError } from "@/shared/auth/auth-error";
import type { DealerAuthClient } from "@/shared/auth/clients/dealer-auth-client";
import type { DealerAccessState } from "@/shared/auth/auth-types";
import { getServerEnv } from "@/shared/config/env";

const supabaseLoginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number().int().positive(),
  user: z.object({
    id: z.string(),
    email: z.string().email().nullable(),
  }),
});

const dealerProfileStatusSchema = z.object({
  id: z.string(),
  email_approval: z.boolean(),
  business_card_approval: z.boolean(),
});

export const supabaseDealerAuthClient: DealerAuthClient = {
  async login(credentials) {
    const env = getServerEnv();
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      throw new DealerAuthError("Supabase connection settings are missing.", 500);
    }

    const loginResponse = await fetch(
      `${env.SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify(credentials),
      },
    );

    const loginJson = await readJson(loginResponse);
    if (!loginResponse.ok) {
      throw new DealerAuthError(
        getErrorMessage(loginJson) ?? "로그인에 실패했습니다.",
        loginResponse.status,
      );
    }

    const authResult = supabaseLoginResponseSchema.parse(loginJson);
    const accessState = await getDealerAccessState({
      dealerId: authResult.user.id,
      accessToken: authResult.access_token,
      supabaseUrl: env.SUPABASE_URL,
      anonKey: env.SUPABASE_ANON_KEY,
    });

    return {
      backend: "supabase",
      dealerId: authResult.user.id,
      email: authResult.user.email ?? credentials.email,
      accessState,
      accessToken: authResult.access_token,
      refreshToken: authResult.refresh_token,
      expiresAt: new Date(Date.now() + authResult.expires_in * 1000).toISOString(),
    };
  },

  async refreshSession(session) {
    const env = getServerEnv();
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !session.accessToken) {
      return session;
    }

    const accessState = await getDealerAccessState({
      dealerId: session.dealerId,
      accessToken: session.accessToken,
      supabaseUrl: env.SUPABASE_URL,
      anonKey: env.SUPABASE_ANON_KEY,
    });

    return {
      ...session,
      accessState,
    };
  },

  async logout(session) {
    const env = getServerEnv();
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !session?.accessToken) {
      return;
    }

    await fetch(`${env.SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    }).catch(() => null);
  },
};

async function getDealerAccessState(input: {
  dealerId: string;
  accessToken: string;
  supabaseUrl: string;
  anonKey: string;
}): Promise<DealerAccessState> {
  const profileResponse = await fetch(
    `${input.supabaseUrl}/rest/v1/profiles_dealer?select=id,email_approval,business_card_approval&id=eq.${input.dealerId}&limit=1`,
    {
      headers: {
        apikey: input.anonKey,
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!profileResponse.ok) {
    return "pending_approval";
  }

  const profileJson = await readJson(profileResponse);
  if (!Array.isArray(profileJson) || profileJson.length === 0) {
    return "incomplete_signup";
  }

  const parsedProfile = dealerProfileStatusSchema.safeParse(profileJson[0]);
  if (!parsedProfile.success) {
    return "pending_approval";
  }

  return parsedProfile.data.email_approval && parsedProfile.data.business_card_approval
    ? "active"
    : "pending_approval";
}

async function readJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getErrorMessage(json: unknown) {
  if (!json || typeof json !== "object") {
    return null;
  }

  if ("error_description" in json && typeof json.error_description === "string") {
    return json.error_description;
  }

  if ("msg" in json && typeof json.msg === "string") {
    return json.msg;
  }

  if ("message" in json && typeof json.message === "string") {
    return json.message;
  }

  return null;
}
