import "server-only";

import { z } from "zod";
import {
  dealerBidCapitalOptionSchema,
  dealerBidDetailSchema,
  dealerBidListItemSchema,
  dealerBidServiceOptionSchema,
  dealerBidSubmissionSchema,
  dealerBidSuccessSchema,
  type DealerBidDetail,
  type DealerBidCapitalOption,
  type DealerBidListItem,
  type DealerBidServiceOption,
  type DealerBidSuccess,
} from "@/entities/bid/schemas/dealer-bid-schema";
import type { DealerSession } from "@/shared/auth/auth-types";
import { getServerEnv } from "@/shared/config/env";
import {
  fetchDealerBidSuccess as fetchMockDealerBidSuccess,
  fetchDealerBidDetail as fetchMockDealerBidDetail,
  fetchDealerBidList as fetchMockDealerBidList,
  fetchDealerBidRank as fetchMockDealerBidRank,
  listDealerBidCapitalOptions as listMockDealerBidCapitalOptions,
  listDealerBidServiceOptions as listMockDealerBidServiceOptions,
  submitDealerBid as submitMockDealerBid,
} from "@/shared/api/dealer-marketplace";
import {
  fetchDealerHomeAuctionDetailForSession,
  fetchDealerHomeWorkspaceForSession,
} from "@/shared/api/dealer-home-server";

const statusInfoRpcSchema = z.object({
  status_code: z.string(),
  status_name: z.string(),
  canceled: z.boolean().optional().default(false),
  canceled_reason: z.string().nullable().optional(),
});

const auctionTimeInfoRpcSchema = z.object({
  expire_at: z.string(),
  deadline_at: z.string(),
  remaining_expire_seconds: z.number().int(),
  remaining_deadline_seconds: z.number().int(),
});

const auctionInfoRpcSchema = z.object({
  auction_id: z.string(),
  purchase_method: z.string(),
  user_region: z.string().nullable().optional(),
  delivery_region: z.string().nullable().optional(),
  contract_months: z.number().int().nullable().optional(),
  annual_mileage: z.number().int().nullable().optional(),
  customer_type: z.string().nullable().optional(),
  advance_down_payment_amount: z.number().int().nullable().optional(),
  deposit_down_payment_amount: z.number().int().nullable().optional(),
  auction_status: statusInfoRpcSchema,
  auction_time_info: auctionTimeInfoRpcSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

const vehicleInfoRpcSchema = z.object({
  vehicle_brand_name: z.string(),
  vehicle_model_name: z.string(),
  vehicle_grade_name: z.string(),
  vehicle_grade_id: z.string(),
  vehicle_grade_trim: z.string().nullable().optional(),
});

const userInfoRpcSchema = z.object({
  user_id: z.string(),
  user_name: z.string(),
  user_phone: z.string().nullable().optional(),
});

const bidOptionRpcSchema = z.object({
  option_type_id: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

const bidInfoRpcSchema = z.object({
  bid_id: z.string(),
  vehicle_price: z.number(),
  monthly_payment: z.number(),
  discount_amount: z.number().nullable().optional(),
  capital_id: z.string().nullable().optional(),
  bid_status: statusInfoRpcSchema,
  bid_options: bidOptionRpcSchema.array().default([]),
  created_at: z.string(),
  updated_at: z.string(),
});

const dealerMyBidRpcSchema = z.object({
  auction_info: auctionInfoRpcSchema,
  vehicle_info: vehicleInfoRpcSchema,
  user_info: userInfoRpcSchema,
  bid_info: bidInfoRpcSchema.nullable().optional(),
  view_count: z.number().int().nonnegative().default(0),
  bid_count: z.number().int().nonnegative().default(0),
  has_my_bid: z.boolean().nullable().optional(),
});

const dealerBidRankRpcSchema = z.object({
  my_rank: z.number().int().positive(),
  total_bids: z.number().int().positive(),
  my_bid_price: z.number().int().nonnegative(),
});

const insertDealerBidRpcSchema = z.object({
  success: z.boolean(),
  bid_id: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  error_message: z.string().nullable().optional(),
});

const dealerBidRpcFetchLimit = 500;

type DealerMyBidRpc = z.output<typeof dealerMyBidRpcSchema>;

export async function fetchDealerBidListForSession(
  session: DealerSession,
): Promise<DealerBidListItem[]> {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    return fetchMockDealerBidList();
  }

  if (backend === "spring") {
    throw new Error("Spring dealer bid backend is not implemented yet.");
  }

  const [records, homeWorkspace] = await Promise.all([
    fetchDealerMyBidRecords(session),
    fetchDealerHomeWorkspaceForSession(session, "home", {
      search: "",
      importFilter: "all",
      sort: "latest",
    }),
  ]);
  const homeMap = new Map(homeWorkspace.items.map((item) => [item.id, item]));

  return records.map((record) => {
    const auctionId = record.auction_info.auction_id;
    const homeItem = homeMap.get(auctionId);
    const expireAt = toIsoDateTime(record.auction_info.auction_time_info.expire_at);

    return dealerBidListItemSchema.parse({
      submissionId: record.bid_info?.bid_id ?? auctionId,
      auctionId,
      vehicleLabel: `${record.vehicle_info.vehicle_brand_name} ${record.vehicle_info.vehicle_model_name}`,
      purchaseMethod: normalizePurchaseMethod(record.auction_info.purchase_method),
      yearLabel: homeItem?.yearLabel ?? "-",
      fuelType: "-",
      bidCount: record.bid_count,
      deadlineAt: expireAt,
      statusLabel: Date.parse(expireAt) > Date.now() ? "입찰 진행" : "종료",
      currentRank: null,
    });
  });
}

export async function fetchDealerBidDetailForSession(
  session: DealerSession,
  auctionId: string,
): Promise<DealerBidDetail> {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    return fetchMockDealerBidDetail(auctionId);
  }

  if (backend === "spring") {
    throw new Error("Spring dealer bid backend is not implemented yet.");
  }

  const [records, auction, rank] = await Promise.all([
    fetchDealerMyBidRecords(session),
    fetchDealerHomeAuctionDetailForSession(session, auctionId),
    fetchDealerBidRankForSession(session, auctionId).catch(() => null),
  ]);

  const record = records.find((item) => item.auction_info.auction_id === auctionId);
  if (!record?.bid_info) {
    throw new Error("내 입찰 정보를 찾을 수 없습니다.");
  }

  const [capitalName, optionTypeMap] = await Promise.all([
    fetchLookupNameById(session, "capital", record.bid_info.capital_id),
    fetchOptionTypeNameMap(
      session,
      record.bid_info.bid_options.flatMap((option) =>
        typeof option.option_type_id === "string" ? [option.option_type_id] : [],
      ),
    ),
  ]);
  const expireAt = toIsoDateTime(record.auction_info.auction_time_info.expire_at);

  return dealerBidDetailSchema.parse({
    auction,
    submission: dealerBidSubmissionSchema.parse({
      id: record.bid_info.bid_id,
      auctionId,
      purchaseMethod: normalizePurchaseMethod(record.auction_info.purchase_method),
      monthlyPaymentValue: Math.round(record.bid_info.monthly_payment),
      discountAmountValue: Math.round(record.bid_info.discount_amount ?? 0),
      capitalId: record.bid_info.capital_id ?? null,
      capitalName,
      note: "",
      currentRank: rank?.myRank ?? null,
      services: record.bid_info.bid_options.map((option, index) => ({
        id: option.option_type_id ?? `service-${index}`,
        name:
          (option.option_type_id ? optionTypeMap.get(option.option_type_id) : null) ??
          "선택 옵션",
        description: option.note ?? "",
      })),
      state: Date.parse(expireAt) > Date.now() ? "bidding" : "closed",
      submittedAt: toIsoDateTime(record.bid_info.created_at),
    }),
    totalBidders: rank?.totalBids ?? Math.max(record.bid_count, 1),
  });
}

export async function fetchDealerBidSuccessForSession(
  session: DealerSession,
  submissionId: string,
): Promise<DealerBidSuccess> {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    return fetchMockDealerBidSuccess(submissionId);
  }

  if (backend === "spring") {
    throw new Error("Spring dealer bid backend is not implemented yet.");
  }

  const records = await fetchDealerMyBidRecordsWithRetry(session, submissionId);
  const record = records.find((item) => item.bid_info?.bid_id === submissionId);

  if (!record) {
    throw new Error("입찰 완료 정보를 찾을 수 없습니다.");
  }

  const detail = await fetchDealerBidDetailForSession(
    session,
    record.auction_info.auction_id,
  );

  return dealerBidSuccessSchema.parse({
    auction: detail.auction,
    submission: detail.submission,
  });
}

export async function fetchDealerBidRankForSession(
  session: DealerSession,
  auctionId: string,
) {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    const mockRank = await fetchMockDealerBidRank(auctionId);

    if (mockRank === null) {
      return null;
    }

    return {
      myRank: mockRank,
      totalBids: mockRank,
      myBidPrice: 0,
    };
  }

  if (backend === "spring") {
    throw new Error("Spring dealer bid backend is not implemented yet.");
  }

  const result = await callSupabaseRpc(
    session,
    "get_dealer_bid_rank",
    { p_auction_id: auctionId },
    dealerBidRankRpcSchema.array(),
  );

  if (!result[0]) {
    return null;
  }

  return {
    myRank: result[0].my_rank,
    totalBids: result[0].total_bids,
    myBidPrice: result[0].my_bid_price,
  };
}

export async function fetchDealerBidServiceOptionsForSession(
  session: DealerSession,
): Promise<DealerBidServiceOption[]> {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    return listMockDealerBidServiceOptions();
  }

  if (backend === "spring") {
    throw new Error("Spring dealer bid backend is not implemented yet.");
  }

  const records = await fetchTableRecords(session, "option_type", {
    select: "id,name",
    order: "name.asc",
  });

  return dealerBidServiceOptionSchema.array().parse(
    records.flatMap((record) => {
      if (typeof record?.id !== "string" || typeof record?.name !== "string") {
        return [];
      }

      return [
        {
          id: record.id,
          name: record.name,
          description: "",
        },
      ];
    }),
  );
}

export async function fetchDealerBidCapitalOptionsForSession(
  session: DealerSession,
): Promise<DealerBidCapitalOption[]> {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    return listMockDealerBidCapitalOptions();
  }

  if (backend === "spring") {
    throw new Error("Spring dealer bid backend is not implemented yet.");
  }

  const records = await fetchTableRecords(session, "capital", {
    select: "id,name",
    order: "name.asc",
  });

  return dealerBidCapitalOptionSchema.array().parse(
    records.flatMap((record) => {
      if (typeof record?.id !== "string" || typeof record?.name !== "string") {
        return [];
      }

      return [{ id: record.id, name: record.name }];
    }),
  );
}

type SubmitDealerBidInput = {
  auctionId: string;
  purchaseMethod: "현금" | "할부" | "리스" | "장기렌트";
  vehiclePrice: number;
  monthlyPaymentValue: number | null;
  discountAmountValue: number;
  capitalId: string | null;
  selectedServiceIds: string[];
  note: string;
};

export async function submitDealerBidForSession(
  session: DealerSession,
  input: SubmitDealerBidInput,
) {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    return submitMockDealerBid({
      auctionId: input.auctionId,
      purchaseMethod: input.purchaseMethod,
      selectedServiceIds: input.selectedServiceIds,
      note: input.note,
      monthlyPaymentValue: input.monthlyPaymentValue,
      discountAmountValue: input.discountAmountValue,
      capitalId: input.capitalId,
    });
  }

  if (backend === "spring") {
    throw new Error("Spring dealer bid backend is not implemented yet.");
  }

  const result = await callSupabaseRpc(
    session,
    "insert_dealer_bid",
    {
      p_auction_id: input.auctionId,
      p_dealer_id: session.dealerId,
      p_vehicle_price: input.vehiclePrice,
      p_monthly_payment: input.monthlyPaymentValue ?? 0,
      p_discount_amount: input.discountAmountValue,
      p_capital_id: input.capitalId,
      p_provided_option_types: input.selectedServiceIds,
      p_provided_option_note: input.note || null,
    },
    insertDealerBidRpcSchema,
  );

  if (!result.success || !result.bid_id) {
    throw new Error(
      result.error_message ?? result.message ?? "입찰 제출에 실패했습니다.",
    );
  }

  return result.bid_id;
}

async function fetchDealerMyBidRecords(session: DealerSession): Promise<DealerMyBidRpc[]> {
  return callSupabaseRpc(
    session,
    "get_dealer_my_bid",
    {
      p_limit: dealerBidRpcFetchLimit,
      p_offset: 0,
    },
    dealerMyBidRpcSchema.array(),
  );
}

async function fetchDealerMyBidRecordsWithRetry(
  session: DealerSession,
  submissionId: string,
) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const records = await fetchDealerMyBidRecords(session);

    if (records.some((item) => item.bid_info?.bid_id === submissionId)) {
      return records;
    }

    if (attempt < 2) {
      await sleep(400);
    }
  }

  return fetchDealerMyBidRecords(session);
}

async function fetchOptionTypeNameMap(session: DealerSession, optionTypeIds: string[]) {
  if (optionTypeIds.length === 0) {
    return new Map<string, string>();
  }

  const records = await fetchTableRecords(session, "option_type", {
    select: "id,name",
  });

  return new Map<string, string>(
    records.flatMap((record) => {
      if (
        typeof record?.id !== "string" ||
        typeof record?.name !== "string" ||
        !optionTypeIds.includes(record.id)
      ) {
        return [];
      }

      return [[record.id, record.name] as const];
    }),
  );
}

function normalizePurchaseMethod(value: string | null | undefined) {
  if (value === "현금" || value === "할부" || value === "리스" || value === "장기렌트") {
    return value;
  }

  if (value?.includes("렌트")) {
    return "장기렌트" as const;
  }

  return "현금" as const;
}

async function fetchLookupNameById(
  session: DealerSession,
  tableName: string,
  id: string | null | undefined,
) {
  if (!id) {
    return null;
  }

  const records = await fetchTableRecords(session, tableName, {
    select: "name",
    id: `eq.${id}`,
    limit: "1",
  });
  const record = records[0];

  return typeof record?.name === "string" ? record.name : null;
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
    throw new Error("Supabase dealer bid data env is not configured.");
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

function sleep(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
