import "server-only";

import { z } from "zod";
import type { DealerSession } from "@/shared/auth/auth-types";
import { getServerEnv } from "@/shared/config/env";
import {
  dealerDealDetailSchema,
  dealerDealListItemSchema,
  type DealerDealDetail,
  type DealerDealListItem,
  type DealerDealStage,
  type DealerDealStep,
} from "@/entities/deal/schemas/dealer-deal-schema";
import {
  fetchDealerDealDetail as fetchMockDealerDealDetail,
  fetchDealerDealList as fetchMockDealerDealList,
} from "@/shared/api/dealer-marketplace";

const dealerDealOptionRpcSchema = z.object({
  deal_option_id: z.string().nullable().optional(),
  option_type_id: z.string().nullable().optional(),
  option_type_name: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

const dealerDealStepHistoryRpcSchema = z.object({
  deal_step_history_id: z.string().nullable().optional(),
  from_status_id: z.string().nullable().optional(),
  from_status_name: z.string().nullable().optional(),
  to_status_id: z.string().nullable().optional(),
  to_status_name: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});

const dealerDealRpcSchema = z.object({
  deal_id: z.string(),
  auction_id: z.string(),
  vehicle_grade_id: z.string(),
  vehicle_grade_name: z.string(),
  vehicle_grade_trim: z.string().nullable().optional(),
  brand_name: z.string(),
  model_name: z.string(),
  model_year_start: z.number().int(),
  fuel: z.string().nullable().optional(),
  purchase_method: z.string().nullable().optional(),
  requested_at: z.string(),
  deal_created_at: z.string(),
  user_region: z.string().nullable().optional(),
  delivery_region: z.string().nullable().optional(),
  annual_mileage: z.number().int().nullable().optional(),
  user_name: z.string().nullable().optional(),
  user_phone: z.string().nullable().optional(),
  status_code: z.string().nullable().optional(),
  status_name: z.string().nullable().optional(),
  bid_count: z.number().int().nonnegative(),
  view_count: z.number().int().nonnegative(),
  expected_assignment_week: z.string().nullable().optional(),
  expected_assignment_date: z.string().nullable().optional(),
  expected_release_week: z.string().nullable().optional(),
  expected_release_date: z.string().nullable().optional(),
  final_vehicle_price: z.number().int().nullable().optional(),
  final_monthly_payment: z.number().int().nullable().optional(),
  final_contract_months: z.number().int().nullable().optional(),
  final_advance_down_payment_percent: z.number().int().nullable().optional(),
  final_deposit_down_payment_percent: z.number().int().nullable().optional(),
  final_advance_down_payment_amount: z.number().int().nullable().optional(),
  final_deposit_down_payment_amount: z.number().int().nullable().optional(),
  final_customer_type: z.string().nullable().optional(),
  capital_id: z.string().nullable().optional(),
  capital_name: z.string().nullable().optional(),
  deal_options: dealerDealOptionRpcSchema.array().nullish().default([]),
  deal_step_history: dealerDealStepHistoryRpcSchema.array().nullish().default([]),
});

const dealerDealListRpcLimit = 500;

type DealerDealRpc = z.output<typeof dealerDealRpcSchema>;

export async function fetchDealerDealListForSession(
  session: DealerSession,
): Promise<DealerDealListItem[]> {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    return fetchMockDealerDealList();
  }

  if (backend === "spring") {
    throw new Error("Spring dealer deal backend is not implemented yet.");
  }

  const records = await callSupabaseRpc(
    session,
    "get_dealer_my_deals",
    {
      p_limit: dealerDealListRpcLimit,
      p_offset: 0,
    },
    dealerDealRpcSchema.array(),
  );

  const chatRoomIdMap = await fetchChatRoomIdMap(
    session,
    records.map((record) => record.deal_id),
  );

  return records
    .map((record) => toDealerDealListItem(record, chatRoomIdMap.get(record.deal_id) ?? null))
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
}

export async function fetchDealerDealDetailForSession(
  session: DealerSession,
  dealId: string,
): Promise<DealerDealDetail> {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    return fetchMockDealerDealDetail(dealId);
  }

  if (backend === "spring") {
    throw new Error("Spring dealer deal backend is not implemented yet.");
  }

  const [records, chatRoomId] = await Promise.all([
    callSupabaseRpc(
      session,
      "get_dealer_my_deal_by_deal_id",
      { p_deal_id: dealId },
      dealerDealRpcSchema.array(),
    ),
    fetchChatRoomIdByDealId(session, dealId),
  ]);

  const record = records[0];

  if (!record) {
    throw new Error("거래 상세를 불러오지 못했습니다.");
  }

  return dealerDealDetailSchema.parse({
    ...toDealerDealListItem(record, chatRoomId),
    statusCode: record.status_code ?? "계약요청",
    statusName: record.status_name ?? "거래 상태 확인이 필요합니다.",
    askingPriceLabel: formatWon(record.final_vehicle_price),
    submittedAt: toIsoDateTime(record.deal_created_at),
    expectedAssignmentDate: record.expected_assignment_date
      ? toIsoDateTime(record.expected_assignment_date)
      : null,
    expectedReleaseDate: record.expected_release_date
      ? toIsoDateTime(record.expected_release_date)
      : null,
    contractMonths: record.final_contract_months ?? null,
    advanceDownPaymentAmount: record.final_advance_down_payment_amount ?? null,
    depositDownPaymentAmount: record.final_deposit_down_payment_amount ?? null,
    annualMileage: record.annual_mileage ?? null,
    customerType: record.final_customer_type ?? null,
    vehicleExteriorColorName: null,
    vehicleInteriorColorName: null,
    note: getDealNote(record),
    services: (record.deal_options ?? []).map((option, index) => ({
      id: option.deal_option_id ?? option.option_type_id ?? `service-${index}`,
      name: option.option_type_name ?? "선택 옵션",
      description: option.note ?? "",
    })),
    steps: buildDealSteps(record.status_code),
  });
}

export async function updateDealerDealStatusForSession(
  session: DealerSession,
  input: {
    dealId: string;
    targetStatusCode: string;
    reason?: string | null;
  },
) {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    throw new Error("Mock dealer deal mutations are not implemented yet.");
  }

  if (backend === "spring") {
    throw new Error("Spring dealer deal backend is not implemented yet.");
  }

  await callSupabaseRpc(
    session,
    "update_deal_status_with_log",
    {
      p_deal_id: input.dealId,
      p_to_status_code: input.targetStatusCode,
      p_reason: input.reason ?? null,
    },
    z.unknown(),
  );
}

export async function updateDealerDealExpectedDateForSession(
  session: DealerSession,
  input: {
    dealId: string;
    assignmentDate?: string | null;
    releaseDate?: string | null;
  },
) {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    throw new Error("Mock dealer deal mutations are not implemented yet.");
  }

  if (backend === "spring") {
    throw new Error("Spring dealer deal backend is not implemented yet.");
  }

  await callSupabaseRpc(
    session,
    "update_deal_with_options_full",
    {
      p_deal_id: input.dealId,
      p_expected_assignment_date: input.assignmentDate ?? null,
      p_expected_assignment_week: input.assignmentDate
        ? toDealerWeekString(input.assignmentDate)
        : null,
      p_expected_release_date: input.releaseDate ?? null,
      p_expected_release_week: input.releaseDate ? toDealerWeekString(input.releaseDate) : null,
    },
    z.unknown(),
  );
}

export async function cancelDealerDealForSession(
  session: DealerSession,
  input: {
    dealId: string;
    reason: string;
  },
) {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    throw new Error("Mock dealer deal mutations are not implemented yet.");
  }

  if (backend === "spring") {
    throw new Error("Spring dealer deal backend is not implemented yet.");
  }

  await callSupabaseRpc(
    session,
    "update_deal_cancel_with_log",
    {
      p_deal_id: input.dealId,
      p_cancel_reason: input.reason,
    },
    z.unknown(),
  );
}

function toDealerDealListItem(
  record: DealerDealRpc,
  chatRoomId: string | null,
): DealerDealListItem {
  return dealerDealListItemSchema.parse({
    id: record.deal_id,
    auctionId: record.auction_id,
    chatRoomId: chatRoomId ?? `pending:${record.deal_id}`,
    customerName: record.user_name ?? "고객 정보 없음",
    customerPhone: record.user_phone ?? null,
    vehicleLabel: `${record.brand_name} ${record.model_name} ${record.vehicle_grade_trim ?? record.vehicle_grade_name}`.trim(),
    purchaseMethod: normalizePurchaseMethod(record.purchase_method),
    stage: mapDealStage(record.status_code),
    statusDescription: record.status_name ?? "거래 상태 확인이 필요합니다.",
    deliveryRegion: record.delivery_region ?? record.user_region ?? "-",
    updatedAt: toIsoDateTime(record.expected_release_date ?? record.deal_created_at),
  });
}

function mapDealStage(statusCode: string | null | undefined): DealerDealStage {
  switch (statusCode) {
    case "계약요청":
    case "계약금_입금대기":
      return "서류 확인";
    case "배정진행":
    case "배정완료":
      return "계약 입력 대기";
    case "결제대기":
    case "결제완료":
    case "출고진행":
    case "출고지연":
      return "출고 준비";
    case "출고완료":
      return "출고 완료";
    default:
      return "서류 확인";
  }
}

function buildDealSteps(statusCode: string | null | undefined): DealerDealStep[] {
  const labels = ["계약금 입금", "차량 배정", "잔금 결제", "차량 출고"];
  const currentIndex = getDealStepIndex(statusCode);

  return labels.map((label, index) => ({
    label,
    state:
      index < currentIndex
        ? "completed"
        : index === currentIndex
          ? "current"
          : "upcoming",
  }));
}

function getDealStepIndex(statusCode: string | null | undefined) {
  switch (statusCode) {
    case "계약요청":
    case "계약금_입금대기":
      return 0;
    case "배정진행":
    case "배정완료":
      return 1;
    case "결제대기":
    case "결제완료":
      return 2;
    case "출고진행":
    case "출고지연":
    case "출고완료":
    case "계약취소":
      return 3;
    default:
      return 0;
  }
}

function normalizePurchaseMethod(
  value: string | null | undefined,
): "현금" | "할부" | "리스" | "장기렌트" {
  if (value === "현금" || value === "할부" || value === "리스" || value === "장기렌트") {
    return value;
  }

  if (value?.includes("렌트")) {
    return "장기렌트";
  }

  return "현금";
}

function getDealNote(record: DealerDealRpc) {
  const notedOptions = (record.deal_options ?? [])
    .map((option) => option.note?.trim())
    .filter((note): note is string => Boolean(note));

  if (notedOptions.length === 0) {
    return "전달된 메모가 없습니다.";
  }

  return notedOptions.join("\n");
}

async function fetchChatRoomIdMap(session: DealerSession, dealIds: string[]) {
  if (dealIds.length === 0) {
    return new Map<string, string>();
  }

  const records = await fetchTableRecords(session, "chat_room", {
    select: "id,deal_id",
    deal_id: `in.(${dealIds.join(",")})`,
  });

  return new Map<string, string>(
    records.flatMap((record) => {
      if (typeof record?.deal_id !== "string" || typeof record?.id !== "string") {
        return [];
      }

      return [[record.deal_id, record.id] as const];
    }),
  );
}

async function fetchChatRoomIdByDealId(session: DealerSession, dealId: string) {
  const records = await fetchTableRecords(session, "chat_room", {
    select: "id",
    deal_id: `eq.${dealId}`,
    limit: "1",
  });

  return typeof records[0]?.id === "string" ? records[0].id : null;
}

async function fetchTableRecords(
  session: DealerSession,
  tableName: string,
  searchParams: Record<string, string>,
) {
  const env = getRequiredSupabaseDataEnv(session);
  const requestUrl = new URL(`${env.SUPABASE_URL}/rest/v1/${tableName}`);

  for (const [key, value] of Object.entries(searchParams)) {
    requestUrl.searchParams.set(key, value);
  }

  const response = await fetch(requestUrl, {
    method: "GET",
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const responseJson = await readJson(response);
  if (!response.ok) {
    return [];
  }

  return Array.isArray(responseJson) ? responseJson : [];
}

async function callSupabaseRpc<TSchema extends z.ZodTypeAny>(
  session: DealerSession,
  rpcName: string,
  params: Record<string, unknown>,
  schema: TSchema,
): Promise<z.output<TSchema>> {
  const env = getRequiredSupabaseDataEnv(session);
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/${rpcName}`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(params),
  });

  const responseJson = await readJson(response);
  if (!response.ok) {
    throw new Error(getSupabaseErrorMessage(responseJson) ?? `${rpcName} 호출에 실패했습니다.`);
  }

  return schema.parse(responseJson);
}

function resolveDealerDataBackend(session: DealerSession) {
  const env = getServerEnv();
  return env.DEALER_DATA_BACKEND ?? session.backend;
}

function getRequiredSupabaseDataEnv(session: DealerSession) {
  const env = getServerEnv();
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !session.accessToken) {
    throw new Error("Supabase dealer deal data env is not configured.");
  }

  return {
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
    accessToken: session.accessToken,
  };
}

function toIsoDateTime(value: string) {
  return new Date(value).toISOString();
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

function formatWon(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function toDealerWeekString(dateValue: string) {
  const date = new Date(dateValue);
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const days =
    Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  const weekNum = Math.ceil((days + startOfYear.getUTCDay()) / 7);

  return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}
