import "server-only";

import { z } from "zod";
import { dealerProfileSchema, type DealerProfile } from "@/entities/dealer/schemas/dealer-profile-schema";
import {
  dealerMyInfoSchema,
  dealerNicknameUpdateSchema,
  type DealerMyInfo,
  type DealerNicknameUpdate,
} from "@/entities/mypage/schemas/dealer-mypage-detail-schema";
import { DealerAuthError } from "@/shared/auth/auth-error";
import type { DealerSession } from "@/shared/auth/auth-types";
import { getServerEnv } from "@/shared/config/env";
import {
  fetchDealerMyInfo as fetchMockDealerMyInfo,
  fetchDealerProfile as fetchMockDealerProfile,
  updateDealerNickname as updateMockDealerNickname,
} from "@/shared/api/dealer-mypage";

const booleanLikeSchema = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "t" || normalized === "1") {
      return true;
    }

    if (normalized === "false" || normalized === "f" || normalized === "0" || normalized === "") {
      return false;
    }
  }

  return false;
}, z.boolean());

const dealerProfileSummaryRowSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  nickname: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
  email_approval: booleanLikeSchema.optional().default(false),
  business_card_approval: booleanLikeSchema.optional().default(false),
  created_at: z.string().nullable().optional(),
});

type DealerProfileSummaryRow = z.output<typeof dealerProfileSummaryRowSchema>;
type DealerMyInfoRow = DealerProfileSummaryRow;

export async function fetchDealerProfileForSession(session: DealerSession): Promise<DealerProfile> {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    return fetchMockDealerProfile();
  }

  if (backend === "spring") {
    throw new Error("Spring dealer mypage backend is not implemented yet.");
  }

  const row = await fetchSupabaseDealerProfileSummaryRow(session);
  return toDealerProfile(row);
}

export async function fetchDealerMyInfoForSession(session: DealerSession): Promise<DealerMyInfo> {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    return fetchMockDealerMyInfo();
  }

  if (backend === "spring") {
    throw new Error("Spring dealer mypage backend is not implemented yet.");
  }

  const row = await fetchSupabaseDealerMyInfoRow(session);
  return toDealerMyInfo(row);
}

export async function updateDealerNicknameForSession(
  session: DealerSession,
  input: DealerNicknameUpdate,
): Promise<DealerMyInfo> {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    return updateMockDealerNickname(input);
  }

  if (backend === "spring") {
    throw new Error("Spring dealer mypage backend is not implemented yet.");
  }

  const env = getRequiredSupabaseDataEnv(session);
  const parsed = dealerNicknameUpdateSchema.parse(input);

  const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/profiles_dealer?id=eq.${session.dealerId}&select=id,name,nickname,phone,email,company_name,email_approval,business_card_approval,created_at`,
    {
      method: "PATCH",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=representation",
      },
      cache: "no-store",
      body: JSON.stringify({
        nickname: parsed.nickname,
      }),
    },
  );

  const responseJson = await readJson(response);
  if (!response.ok) {
    throw new Error(getSupabaseErrorMessage(responseJson) ?? "닉네임을 변경하지 못했습니다.");
  }

  const firstRow = Array.isArray(responseJson) ? responseJson[0] : responseJson;
  const row = dealerProfileSummaryRowSchema.parse(firstRow);
  return toDealerMyInfo(row);
}

async function fetchSupabaseDealerProfileSummaryRow(
  session: DealerSession,
): Promise<DealerProfileSummaryRow> {
  const env = getRequiredSupabaseDataEnv(session);
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/rpc/get_my_dealer_profile`,
    {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
      body: "{}",
    },
  );

  const responseJson = await readJson(response);
  if (!response.ok) {
    throw new Error(getSupabaseErrorMessage(responseJson) ?? "내정보를 불러오지 못했습니다.");
  }

  const firstRow = Array.isArray(responseJson) ? responseJson[0] : responseJson;
  if (!firstRow) {
    throw new DealerAuthError("딜러 프로필을 찾지 못했습니다.", 404);
  }

  return dealerProfileSummaryRowSchema.parse(firstRow);
}

async function fetchSupabaseDealerMyInfoRow(session: DealerSession): Promise<DealerMyInfoRow> {
  return fetchSupabaseDealerProfileSummaryRow(session);
}

function toDealerProfile(row: DealerProfileSummaryRow): DealerProfile {
  return dealerProfileSchema.parse({
    id: row.id,
    dealerName: row.name ?? "정보 없음",
    dealerNickname: row.nickname ?? null,
    companyName: row.company_name ?? "업체명 확인 필요",
    ownerName: row.name ?? "정보 없음",
    approvalStatus: row.email_approval && row.business_card_approval ? "active" : "pending",
    branchCount: 1,
  });
}

function toDealerMyInfo(row: DealerMyInfoRow): DealerMyInfo {
  return dealerMyInfoSchema.parse({
    dealerName: row.name ?? "정보 없음",
    dealerNickname: row.nickname ?? null,
    phone: row.phone ?? null,
    email: row.email ?? null,
    companyName: row.company_name ?? "업체명 확인 필요",
    recruiterRegistrationNumber: null,
    approvalStatus: row.email_approval && row.business_card_approval ? "active" : "pending",
    joinedAt: normalizeIsoDateString(row.created_at),
  });
}

function resolveDealerDataBackend(session: DealerSession) {
  const env = getServerEnv();
  return env.DEALER_DATA_BACKEND ?? session.backend;
}

function getRequiredSupabaseDataEnv(session: DealerSession) {
  const env = getServerEnv();
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !session.accessToken) {
    throw new Error("Supabase dealer mypage data env is not configured.");
  }

  return {
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
    accessToken: session.accessToken,
  };
}

function getSupabaseErrorMessage(payload: unknown) {
  if (payload && typeof payload === "object" && "message" in payload) {
    return typeof payload.message === "string" ? payload.message : null;
  }

  return null;
}

async function readJson(response: Response) {
  return response.json().catch(() => null);
}

function normalizeIsoDateString(value: string | null | undefined) {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}
