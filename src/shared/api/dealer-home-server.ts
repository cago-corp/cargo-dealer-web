import "server-only";

import { z } from "zod";
import type { DealerSession } from "@/shared/auth/auth-types";
import {
  dealerAuctionDetailSchema,
  type DealerAuctionDetail,
} from "@/entities/auction/schemas/dealer-auction-detail-schema";
import {
  dealerAuctionWorkspaceDataSchema,
  type DealerAuctionWorkspaceData,
  type DealerAuctionWorkspaceFilters,
  type DealerAuctionWorkspaceMode,
} from "@/entities/auction/schemas/dealer-auction-workspace-schema";
import { getServerEnv } from "@/shared/config/env";
import { resolvePublicAssetUrl } from "@/shared/lib/url/resolve-public-asset-url";
import {
  fetchDealerAuctionDetail as fetchMockDealerAuctionDetail,
  fetchDealerAuctionWorkspace as fetchMockDealerAuctionWorkspace,
  toggleDealerAuctionFavorite as toggleMockDealerAuctionFavorite,
} from "@/shared/api/dealer-marketplace";

const dealerAuctionBriefRpcSchema = z.object({
  auction_id: z.string(),
  vehicle_grade_id: z.string(),
  vehicle_grade_name: z.string(),
  vehicle_grade_trim: z.string().nullable().optional(),
  brand_name: z.string(),
  model_name: z.string(),
  model_year_start: z.number().int().nullable().optional(),
  purchase_method: z.enum(["현금", "할부", "리스"]),
  requested_at: z.string(),
  expire_at: z.string(),
  deadline_at: z.string(),
  remaining_time_seconds: z.number().int().nonnegative(),
  remaining_deadline_time_seconds: z.number().int(),
  user_name: z.string().nullable().optional(),
  user_region: z.string().nullable().optional(),
  delivery_region: z.string().nullable().optional(),
  annual_mileage: z.number().int().nullable().optional(),
  exterior_color_image_url: z.string().nullable().optional(),
  interior_color_image_url: z.string().nullable().optional(),
  bid_count: z.number().int().nonnegative(),
  view_count: z.number().int().nonnegative(),
  is_favorited: z.boolean(),
  is_imported: z.boolean().optional().default(false),
  fuel: z.string().nullable().optional(),
});

const dealerAuctionDetailBidServiceRpcSchema = z.object({
  option_type_id: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

const dealerAuctionDetailBidRpcSchema = z.object({
  bid_id: z.string(),
  vehicle_price: z.number().int(),
  monthly_payment: z.number().int(),
  discount_amount: z.number().int().nullable().optional(),
  capital_id: z.string().nullable().optional(),
  capital_name: z.string().nullable().optional(),
  dealer_id: z.string(),
  dealer_name: z.string().nullable().optional(),
  dealer_rating: z.number().nullable().optional(),
  services: dealerAuctionDetailBidServiceRpcSchema.array().default([]),
});

const dealerAuctionDetailRpcSchema = z.object({
  auction_id: z.string(),
  profiles_user_id: z.string(),
  vehicle_grade_id: z.string(),
  vehicle_exterior_color_id: z.string().nullable().optional(),
  vehicle_interior_color_id: z.string().nullable().optional(),
  purchase_method: z.enum(["현금", "할부", "리스"]),
  contract_months: z.number().int().nullable().optional(),
  advance_down_payment_percent: z.number().int().nullable().optional(),
  deposit_down_payment_percent: z.number().int().nullable().optional(),
  advance_down_payment_amount: z.number().int().nullable().optional(),
  deposit_down_payment_amount: z.number().int().nullable().optional(),
  annual_mileage: z.number().int().nullable().optional(),
  customer_type: z.string().nullable().optional(),
  user_region: z.string().nullable().optional(),
  delivery_region: z.string().nullable().optional(),
  status_type_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  expire_at: z.string(),
  deadline_at: z.string(),
  canceled_reason: z.string().nullable().optional(),
  vehicle_grade_name: z.string(),
  vehicle_grade_trim: z.string().nullable().optional(),
  vehicle_grade_price: z.number().int().nullable().optional(),
  brand_name: z.string(),
  model_name: z.string(),
  model_year_start: z.number().int().nullable().optional(),
  status_code: z.enum(["경매중", "경매 종료"]),
  status_name: z.string(),
  remaining_time_seconds: z.number().int().nonnegative(),
  remaining_deadline_time_seconds: z.number().int(),
  exterior_color_image_url: z.string().nullable().optional(),
  interior_color_image_url: z.string().nullable().optional(),
  vehicle_grade_image_url: z.string().nullable().optional(),
  user_name: z.string().nullable().optional(),
  fuel: z.string().nullable().optional(),
  view_count: z.number().int().nonnegative(),
  bid_count: z.number().int().nonnegative(),
  is_favorited: z.boolean(),
  bids: dealerAuctionDetailBidRpcSchema.array().default([]),
});

const dealerDashboardSummaryRpcSchema = z.object({
  bidding_count: z.number().int().nonnegative().default(0),
  processing_count: z.number().int().nonnegative().default(0),
  completed_count: z.number().int().nonnegative().default(0),
});

const toggleDealerAuctionFavoriteResultSchema = z.object({
  favorite_id: z.string(),
  auction_id: z.string(),
  is_favorited: z.boolean(),
});

const dealerHomeRpcFetchLimit = 500;

type DealerAuctionBriefRpc = z.output<typeof dealerAuctionBriefRpcSchema>;
type DealerAuctionDetailRpc = z.output<typeof dealerAuctionDetailRpcSchema>;

export async function fetchDealerHomeWorkspaceForSession(
  session: DealerSession,
  mode: DealerAuctionWorkspaceMode,
  filters: DealerAuctionWorkspaceFilters,
) {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    return fetchMockDealerAuctionWorkspace(mode, filters);
  }

  if (backend === "spring") {
    throw new Error("Spring dealer home backend is not implemented yet.");
  }

  return fetchSupabaseDealerHomeWorkspace(session, mode, filters);
}

export async function fetchDealerHomeAuctionDetailForSession(
  session: DealerSession,
  auctionId: string,
) {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    return fetchMockDealerAuctionDetail(auctionId);
  }

  if (backend === "spring") {
    throw new Error("Spring dealer home backend is not implemented yet.");
  }

  return fetchSupabaseDealerAuctionDetail(session, auctionId);
}

export async function toggleDealerHomeAuctionFavoriteForSession(
  session: DealerSession,
  auctionId: string,
) {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    const result = await toggleMockDealerAuctionFavorite(auctionId);
    return {
      id: result.id,
      isFavorited: result.isFavorited,
    };
  }

  if (backend === "spring") {
    throw new Error("Spring dealer home backend is not implemented yet.");
  }

  return toggleSupabaseDealerAuctionFavorite(session, auctionId);
}

async function fetchSupabaseDealerHomeWorkspace(
  session: DealerSession,
  mode: DealerAuctionWorkspaceMode,
  filters: DealerAuctionWorkspaceFilters,
): Promise<DealerAuctionWorkspaceData> {
  const [auctionRecords, favoriteRecords, dashboardSummary] = await Promise.all([
    fetchDealerAuctionBriefRecords(session, "home"),
    fetchDealerAuctionBriefRecords(session, "favorites"),
    fetchDealerDashboardSummary(session),
  ]);
  const brandImportedMap = await fetchBrandImportedMap(session);

  const baseItems: DealerAuctionBriefRpc[] =
    mode === "favorites" ? favoriteRecords : auctionRecords;
  const items = applyWorkspaceFilters(
    baseItems.map((record) => toDealerAuctionBrief(record, brandImportedMap)),
    filters,
  );

  return dealerAuctionWorkspaceDataSchema.parse({
    items,
    summary: {
      totalAuctions: auctionRecords.length,
      favoriteAuctions: favoriteRecords.length,
      bidCount: dashboardSummary.bidding_count,
      dealCount: dashboardSummary.processing_count,
      visibleCount: items.length,
    },
  });
}

async function fetchSupabaseDealerAuctionDetail(
  session: DealerSession,
  auctionId: string,
): Promise<DealerAuctionDetail> {
  const [detailRecord, briefRecords] = await Promise.all([
    fetchDealerAuctionDetailRecord(session, auctionId),
    fetchDealerAuctionBriefRecords(session, "home"),
  ]);

  const briefRecord =
    briefRecords.find((record) => record.auction_id === auctionId) ?? null;
  const [brandImportedMap, brandLogoPath, exteriorColorName, interiorColorName] = await Promise.all([
    fetchBrandImportedMap(session),
    fetchBrandLogoPath(session, detailRecord.brand_name),
    fetchLookupNameById(
      session,
      "vehicle_exterior_color",
      detailRecord.vehicle_exterior_color_id,
    ),
    fetchLookupNameById(
      session,
      "vehicle_interior_color",
      detailRecord.vehicle_interior_color_id,
    ),
  ]);

  return toDealerAuctionDetail({
    detailRecord: detailRecord as DealerAuctionDetailRpc,
    briefRecord: briefRecord as DealerAuctionBriefRpc | null,
    brandImportedMap,
    brandLogoPath,
    exteriorColorName,
    interiorColorName,
    session,
  });
}

async function toggleSupabaseDealerAuctionFavorite(
  session: DealerSession,
  auctionId: string,
) {
  const result = await callSupabaseRpc(
    session,
    "toggle_dealer_auction_favorite",
    { p_auction_id: auctionId },
    toggleDealerAuctionFavoriteResultSchema.array(),
  );

  if (!result[0]) {
    throw new Error("찜 상태를 갱신하지 못했습니다.");
  }

  return {
    id: result[0].auction_id,
    isFavorited: result[0].is_favorited,
  };
}

async function fetchDealerAuctionBriefRecords(
  session: DealerSession,
  mode: DealerAuctionWorkspaceMode,
): Promise<DealerAuctionBriefRpc[]> {
  const rpcName =
    mode === "favorites"
      ? "get_dealer_my_favorite_auctions_brief"
      : "get_dealer_auctions_brief";

  return callSupabaseRpc(
    session,
    rpcName,
    {
      p_limit: dealerHomeRpcFetchLimit,
      p_offset: 0,
    },
    dealerAuctionBriefRpcSchema.array(),
  );
}

async function fetchDealerAuctionDetailRecord(
  session: DealerSession,
  auctionId: string,
): Promise<DealerAuctionDetailRpc> {
  const result = await callSupabaseRpc(
    session,
    "get_dealer_auction_detail_with_log",
    { p_auction_id: auctionId },
    dealerAuctionDetailRpcSchema.array(),
  );

  if (!result[0]) {
    throw new Error("경매 상세를 찾을 수 없습니다.");
  }

  return result[0];
}

async function fetchDealerDashboardSummary(session: DealerSession) {
  return callSupabaseRpc(
    session,
    "get_dealer_dashboard_summary",
    {},
    dealerDashboardSummaryRpcSchema,
  );
}

async function fetchBrandLogoPath(session: DealerSession, brandName: string) {
  const record = await fetchTableRecord(session, "vehicle_brand", {
    select: "image_url",
    name: `eq.${brandName}`,
    limit: "1",
  });

  return typeof record?.image_url === "string" ? record.image_url : null;
}

async function fetchBrandImportedMap(session: DealerSession) {
  const records = await fetchTableRecords(session, "vehicle_brand", {
    select: "name,is_imported",
  });

  return new Map<string, boolean>(
    records.flatMap((record) => {
      if (typeof record?.name !== "string" || typeof record?.is_imported !== "boolean") {
        return [];
      }

      return [[record.name, record.is_imported] as const];
    }),
  );
}

async function fetchLookupNameById(
  session: DealerSession,
  tableName: string,
  id: string | null | undefined,
) {
  if (!id) {
    return null;
  }

  const record = await fetchTableRecord(session, tableName, {
    select: "name",
    id: `eq.${id}`,
    limit: "1",
  });

  return typeof record?.name === "string" ? record.name : null;
}

async function fetchTableRecord(
  session: DealerSession,
  tableName: string,
  searchParams: Record<string, string>,
) {
  const records = await fetchTableRecords(session, tableName, searchParams);
  return records[0] ?? null;
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
    throw new Error("Supabase dealer home data env is not configured.");
  }

  return {
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
    SUPABASE_IMAGE_BASE_URL: env.SUPABASE_IMAGE_BASE_URL,
    accessToken: session.accessToken,
  };
}

function applyWorkspaceFilters(
  items: DealerAuctionWorkspaceData["items"],
  filters: DealerAuctionWorkspaceFilters,
) {
  const normalizedSearch = filters.search.trim().toLowerCase();

  const filteredItems = items.filter((item) => {
    if (filters.importFilter === "domestic" && item.isImported) {
      return false;
    }

    if (filters.importFilter === "imported" && !item.isImported) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return [
      item.sellerName,
      item.brandName,
      item.modelName,
      item.trimName,
      item.regionLabel,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch);
  });

  return filteredItems.sort((left, right) => {
    return Date.parse(right.openedAt) - Date.parse(left.openedAt);
  });
}

function toDealerAuctionBrief(
  record: DealerAuctionBriefRpc,
  brandImportedMap: Map<string, boolean>,
) {
  return {
    id: record.auction_id,
    sellerName: record.user_name?.trim() || "고객",
    brandName: record.brand_name,
    modelName: record.model_name,
    trimName: buildTrimLabel(record.vehicle_grade_name, record.vehicle_grade_trim),
    purchaseMethod: record.purchase_method,
    regionLabel: record.user_region?.trim() || record.delivery_region?.trim() || "-",
    isFavorited: record.is_favorited,
    isImported: brandImportedMap.get(record.brand_name) ?? record.is_imported,
    openedAt: toIsoDateTime(record.requested_at),
    expireAt: toIsoDateTime(record.expire_at),
    deadlineAt: toIsoDateTime(record.deadline_at),
    yearLabel: record.model_year_start ? `${record.model_year_start}년식` : "-",
    mileageLabel: record.annual_mileage
      ? `${new Intl.NumberFormat("ko-KR").format(record.annual_mileage)}km`
      : "-",
    askingPriceValue: 0,
    askingPriceLabel: "-",
    viewCount: record.view_count,
    bidCount: record.bid_count,
    bidState: resolveBidState(record.expire_at, "경매중"),
    statusLabel: resolveStatusLabel({
      closingAt: record.expire_at,
      hasMyBid: false,
      statusCode: "경매중",
    }),
    dealStage: "none" as const,
  };
}

function toDealerAuctionDetail(input: {
  detailRecord: DealerAuctionDetailRpc;
  briefRecord: DealerAuctionBriefRpc | null;
  brandImportedMap: Map<string, boolean>;
  brandLogoPath: string | null;
  exteriorColorName: string | null;
  interiorColorName: string | null;
  session: DealerSession;
}) {
  const {
    detailRecord,
    briefRecord,
    brandImportedMap,
    brandLogoPath,
    exteriorColorName,
    interiorColorName,
    session,
  } = input;
  const env = getServerEnv();
  const imageUrl = resolvePublicAssetUrl(
    env.SUPABASE_IMAGE_BASE_URL,
    detailRecord.exterior_color_image_url ?? detailRecord.vehicle_grade_image_url ?? null,
  );
  const myBid = detailRecord.bids.find((bid) => bid.dealer_id === session.dealerId);

  return dealerAuctionDetailSchema.parse({
    id: detailRecord.auction_id,
    sellerName: detailRecord.user_name?.trim() || "고객",
    brandName: detailRecord.brand_name,
    modelName: detailRecord.model_name,
    trimName: buildTrimLabel(
      detailRecord.vehicle_grade_name,
      detailRecord.vehicle_grade_trim,
    ),
    purchaseMethod: detailRecord.purchase_method,
    regionLabel:
      detailRecord.user_region?.trim() || detailRecord.delivery_region?.trim() || "-",
    isFavorited: detailRecord.is_favorited,
    isImported:
      brandImportedMap.get(detailRecord.brand_name) ?? briefRecord?.is_imported ?? false,
    openedAt: toIsoDateTime(detailRecord.created_at),
    expireAt: toIsoDateTime(detailRecord.expire_at),
    deadlineAt: toIsoDateTime(detailRecord.deadline_at),
    yearLabel: detailRecord.model_year_start
      ? `${detailRecord.model_year_start}년식`
      : "-",
    mileageLabel: detailRecord.annual_mileage
      ? `${new Intl.NumberFormat("ko-KR").format(detailRecord.annual_mileage)}km`
      : "-",
    askingPriceValue: detailRecord.vehicle_grade_price ?? 0,
    askingPriceLabel:
      detailRecord.vehicle_grade_price === null ||
      detailRecord.vehicle_grade_price === undefined
        ? "-"
        : `${new Intl.NumberFormat("ko-KR").format(detailRecord.vehicle_grade_price)}원`,
    viewCount: detailRecord.view_count,
    bidCount: detailRecord.bid_count,
    bidState: myBid
      ? "my_bid"
      : resolveBidState(detailRecord.expire_at, detailRecord.status_code),
    statusLabel: resolveStatusLabel({
      closingAt: detailRecord.expire_at,
      hasMyBid: Boolean(myBid),
      statusCode: detailRecord.status_code,
    }),
    dealStage: "none" as const,
    imageUrl,
    brandLogoImageUrl: resolvePublicAssetUrl(env.SUPABASE_IMAGE_BASE_URL, brandLogoPath),
    fuelType: detailRecord.fuel?.trim() || "-",
    statusCode: detailRecord.status_code,
    contractMonths: detailRecord.contract_months ?? null,
    advanceDownPaymentAmount: detailRecord.advance_down_payment_amount ?? null,
    depositDownPaymentAmount: detailRecord.deposit_down_payment_amount ?? null,
    annualMileage: detailRecord.annual_mileage ?? null,
    deliveryRegion: detailRecord.delivery_region?.trim() || "-",
    userRegion: detailRecord.user_region?.trim() || "-",
    customerType: detailRecord.customer_type ?? null,
    vehicleExteriorColorName: exteriorColorName,
    vehicleInteriorColorName: interiorColorName,
    description: null,
    myBidSubmissionId: myBid?.bid_id ?? null,
  });
}

function resolveBidState(closingAt: string, statusCode: "경매중" | "경매 종료" = "경매중") {
  if (statusCode === "경매 종료" || Date.parse(closingAt) <= Date.now()) {
    return "closed" as const;
  }

  const remainingMilliseconds = Date.parse(closingAt) - Date.now();
  if (remainingMilliseconds <= 90 * 60 * 1000) {
    return "closing" as const;
  }

  return "open" as const;
}

function resolveStatusLabel(input: {
  closingAt: string;
  hasMyBid: boolean;
  statusCode: "경매중" | "경매 종료";
}) {
  if (input.hasMyBid) {
    return "내 입찰 진행";
  }

  if (input.statusCode === "경매 종료" || Date.parse(input.closingAt) <= Date.now()) {
    return "경매 종료";
  }

  if (Date.parse(input.closingAt) - Date.now() <= 90 * 60 * 1000) {
    return "마감 임박";
  }

  return "경매중";
}

function buildTrimLabel(vehicleGradeName: string, vehicleGradeTrim?: string | null) {
  return [vehicleGradeName, vehicleGradeTrim].filter(Boolean).join(" ");
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
