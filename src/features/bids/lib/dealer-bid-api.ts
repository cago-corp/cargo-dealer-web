import { z } from "zod";
import { dealerAuctionPurchaseMethodSchema } from "@/entities/auction/schemas/dealer-auction-brief-schema";
import {
  dealerBidCapitalOptionSchema,
  dealerBidDetailSchema,
  dealerBidListItemSchema,
  dealerBidServiceOptionSchema,
  dealerBidSuccessSchema,
} from "@/entities/bid/schemas/dealer-bid-schema";

const dealerBidRankSchema = z.object({
  myRank: z.number().int().positive(),
  totalBids: z.number().int().positive(),
  myBidPrice: z.number().int().nonnegative(),
});

const dealerBidOptionsSchema = z.object({
  serviceOptions: dealerBidServiceOptionSchema.array(),
  capitalOptions: dealerBidCapitalOptionSchema.array(),
});

const dealerBidSubmitInputSchema = z.object({
  auctionId: z.string(),
  purchaseMethod: dealerAuctionPurchaseMethodSchema,
  vehiclePrice: z.number().int().nonnegative(),
  monthlyPaymentValue: z.number().int().nonnegative().nullable(),
  discountAmountValue: z.number().int().nonnegative(),
  capitalId: z.string().nullable(),
  selectedServiceIds: z.array(z.string()),
  note: z.string(),
});

const dealerBidSubmitResultSchema = z.object({
  submissionId: z.string(),
});

export async function fetchDealerBidListFromApi() {
  const response = await fetch("/api/dealer/bids", {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  return readApiResponse(response, dealerBidListItemSchema.array());
}

export async function fetchDealerBidDetailFromApi(auctionId: string) {
  const response = await fetch(`/api/dealer/bids/${auctionId}`, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  return readApiResponse(response, dealerBidDetailSchema);
}

export async function fetchDealerBidRankFromApi(auctionId: string) {
  const response = await fetch(`/api/dealer/bids/${auctionId}/rank`, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  const payload = await response.json().catch(() => null);

  if (response.status === 404 || payload === null) {
    return null;
  }

  if (!response.ok) {
    throw new Error(getApiErrorMessage(payload, "입찰 순위를 불러오지 못했습니다."));
  }

  return dealerBidRankSchema.nullable().parse(payload);
}

export async function fetchDealerBidOptionsFromApi() {
  const response = await fetch("/api/dealer/bids/options", {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  return readApiResponse(response, dealerBidOptionsSchema);
}

export async function submitDealerBidFromApi(input: z.input<typeof dealerBidSubmitInputSchema>) {
  const response = await fetch("/api/dealer/bids", {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return readApiResponse(response, dealerBidSubmitResultSchema);
}

export async function fetchDealerBidSuccessFromApi(submissionId: string) {
  const response = await fetch(`/api/dealer/bids/submissions/${submissionId}`, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  return readApiResponse(response, dealerBidSuccessSchema);
}

async function readApiResponse<T>(
  response: Response,
  schema: {
    parse: (payload: unknown) => T;
  },
) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(payload, "입찰 데이터를 불러오지 못했습니다."));
  }

  return schema.parse(payload);
}

function getApiErrorMessage(payload: unknown, fallbackMessage: string) {
  if (payload && typeof payload === "object" && "message" in payload) {
    return typeof payload.message === "string" ? payload.message : fallbackMessage;
  }

  return fallbackMessage;
}
