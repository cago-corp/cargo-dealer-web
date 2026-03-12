import { dealerAuctionDetailSchema } from "@/entities/auction/schemas/dealer-auction-detail-schema";
import {
  dealerAuctionWorkspaceDataSchema,
  type DealerAuctionWorkspaceFilters,
  type DealerAuctionWorkspaceMode,
} from "@/entities/auction/schemas/dealer-auction-workspace-schema";

export async function fetchDealerAuctionWorkspaceFromApi(
  mode: DealerAuctionWorkspaceMode,
  filters: DealerAuctionWorkspaceFilters,
) {
  const requestSearchParams = new URLSearchParams();

  requestSearchParams.set("mode", mode);
  requestSearchParams.set("search", filters.search);
  requestSearchParams.set("importFilter", filters.importFilter);
  requestSearchParams.set("sort", filters.sort);

  const response = await fetch(`/api/dealer/home/workspace?${requestSearchParams}`, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  return readApiResponse(response, dealerAuctionWorkspaceDataSchema);
}

export async function fetchDealerAuctionDetailFromApi(auctionId: string) {
  const response = await fetch(`/api/dealer/home/auctions/${auctionId}`, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  return readApiResponse(response, dealerAuctionDetailSchema);
}

export async function toggleDealerAuctionFavoriteFromApi(auctionId: string) {
  const response = await fetch(`/api/dealer/home/auctions/${auctionId}/favorite`, {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
  });

  return readApiResponse(
    response,
    dealerAuctionDetailSchema.pick({ id: true, isFavorited: true }),
  );
}

async function readApiResponse<T>(response: Response, schema: {
  parse: (payload: unknown) => T;
}) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? payload.message
        : null;

    throw new Error(
      typeof message === "string" ? message : "홈 데이터를 불러오지 못했습니다.",
    );
  }

  return schema.parse(payload);
}
