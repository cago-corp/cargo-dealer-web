import { z } from "zod";
import { DealerAuthError } from "@/shared/auth/auth-error";
import type { DealerAuthClient } from "@/shared/auth/clients/dealer-auth-client";
import type {
  DealerAccessState,
  DealerLoginCredentials,
  DealerSession,
  DealerSignupPayload,
} from "@/shared/auth/auth-types";
import { getServerEnv } from "@/shared/config/env";

const supabaseAuthSessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number().int().positive(),
  user: z.object({
    id: z.string(),
    email: z.string().email().nullable(),
  }),
});

const supabaseSignupResponseSchema = z.object({
  access_token: z.string().optional().nullable(),
  refresh_token: z.string().optional().nullable(),
  expires_in: z.number().int().positive().optional().nullable(),
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
    const env = getRequiredSupabaseEnv();
    const sessionResult = await signInWithPassword({
      credentials,
      supabaseUrl: env.SUPABASE_URL,
      anonKey: env.SUPABASE_ANON_KEY,
    });

    return createDealerSession({
      accessToken: sessionResult.access_token,
      anonKey: env.SUPABASE_ANON_KEY,
      dealerId: sessionResult.user.id,
      email: sessionResult.user.email ?? credentials.email,
      expiresIn: sessionResult.expires_in,
      refreshToken: sessionResult.refresh_token,
      supabaseUrl: env.SUPABASE_URL,
    });
  },

  async signup(payload) {
    const env = getRequiredSupabaseEnv();
    const signupResult = await signUpWithPassword({
      anonKey: env.SUPABASE_ANON_KEY,
      payload,
      supabaseUrl: env.SUPABASE_URL,
    });

    const sessionResult =
      signupResult.access_token &&
      signupResult.refresh_token &&
      signupResult.expires_in
        ? {
            access_token: signupResult.access_token,
            refresh_token: signupResult.refresh_token,
            expires_in: signupResult.expires_in,
            user: signupResult.user,
          }
        : await signInWithPassword({
            credentials: {
              email: payload.email,
              password: payload.password,
            },
            supabaseUrl: env.SUPABASE_URL,
            anonKey: env.SUPABASE_ANON_KEY,
          });

    await createDealerProfile({
      accessToken: sessionResult.access_token,
      anonKey: env.SUPABASE_ANON_KEY,
      dealerId: sessionResult.user.id,
      email: sessionResult.user.email ?? payload.email,
      payload,
      supabaseUrl: env.SUPABASE_URL,
    });

    return {
      backend: "supabase",
      dealerId: sessionResult.user.id,
      email: sessionResult.user.email ?? payload.email,
      accessState: "pending_approval",
      accessToken: sessionResult.access_token,
      refreshToken: sessionResult.refresh_token,
      expiresAt: new Date(Date.now() + sessionResult.expires_in * 1000).toISOString(),
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

async function signInWithPassword(input: {
  credentials: DealerLoginCredentials;
  supabaseUrl: string;
  anonKey: string;
}) {
  const loginResponse = await fetch(
    `${input.supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: input.anonKey,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify(input.credentials),
    },
  );

  const loginJson = await readJson(loginResponse);
  if (!loginResponse.ok) {
    throw new DealerAuthError(
      getErrorMessage(loginJson) ?? "로그인에 실패했습니다.",
      loginResponse.status,
    );
  }

  return supabaseAuthSessionSchema.parse(loginJson);
}

async function signUpWithPassword(input: {
  payload: DealerSignupPayload;
  supabaseUrl: string;
  anonKey: string;
}) {
  const signupResponse = await fetch(`${input.supabaseUrl}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: input.anonKey,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      email: input.payload.email,
      password: input.payload.password,
    }),
  });

  const signupJson = await readJson(signupResponse);
  if (!signupResponse.ok) {
    throw new DealerAuthError(
      getErrorMessage(signupJson) ?? "회원가입에 실패했습니다.",
      signupResponse.status,
    );
  }

  return supabaseSignupResponseSchema.parse(signupJson);
}

async function createDealerProfile(input: {
  accessToken: string;
  anonKey: string;
  dealerId: string;
  email: string;
  payload: DealerSignupPayload;
  supabaseUrl: string;
}) {
  const profileResponse = await fetch(
    `${input.supabaseUrl}/rest/v1/profiles_dealer?on_conflict=id&select=id,email_approval,business_card_approval`,
    {
      method: "POST",
      headers: {
        apikey: input.anonKey,
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      cache: "no-store",
      body: JSON.stringify({
        id: input.dealerId,
        name: input.payload.name,
        nickname: input.payload.nickname || null,
        phone: input.payload.phone,
        email: input.email,
        company_name: input.payload.companyName,
        email_approval: false,
        business_card_approval: false,
        business_card_image_url: input.payload.businessCardImageUrl ?? null,
        push_all_enabled: true,
        push_quiet_enabled: false,
        push_chat_message_enabled: true,
        push_status_change_enabled: true,
        tos_agreed: input.payload.tosAgreed,
        privacy_policy_agreed: true,
        third_party_info_agreed: true,
        customer_info_protection_agreed: true,
        marketing_activity_agreed: input.payload.marketingNotificationOptIn,
        marketing_notification_opt_in: input.payload.marketingNotificationOptIn,
        electronic_document_agreed: true,
        location_based_service_agreed: true,
      }),
    },
  );

  const profileJson = await readJson(profileResponse);
  if (!profileResponse.ok) {
    throw new DealerAuthError(
      getErrorMessage(profileJson) ?? "딜러 프로필 생성에 실패했습니다.",
      profileResponse.status,
    );
  }

  const firstRecord = Array.isArray(profileJson) ? profileJson[0] : profileJson;
  const parsedStatus = dealerProfileStatusSchema.safeParse(firstRecord);
  if (!parsedStatus.success) {
    throw new DealerAuthError("딜러 프로필 응답을 확인하지 못했습니다.", 500);
  }
}

async function createDealerSession(input: {
  accessToken: string;
  anonKey: string;
  dealerId: string;
  email: string;
  expiresIn: number;
  refreshToken: string;
  supabaseUrl: string;
}): Promise<DealerSession> {
  const accessState = await getDealerAccessState({
    dealerId: input.dealerId,
    accessToken: input.accessToken,
    supabaseUrl: input.supabaseUrl,
    anonKey: input.anonKey,
  });

  return {
    backend: "supabase",
    dealerId: input.dealerId,
    email: input.email,
    accessState,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    expiresAt: new Date(Date.now() + input.expiresIn * 1000).toISOString(),
  };
}

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

function getRequiredSupabaseEnv() {
  const env = getServerEnv();
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new DealerAuthError("Supabase connection settings are missing.", 500);
  }

  return {
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
    SUPABASE_URL: env.SUPABASE_URL,
  };
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
