import {
  dealerDealDetailSchema,
  dealerDealListItemSchema,
} from "@/entities/deal/schemas/dealer-deal-schema";

export async function fetchDealerDealListFromApi() {
  const response = await fetch("/api/dealer/deals", {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  return readApiResponse(response, dealerDealListItemSchema.array());
}

export async function fetchDealerDealDetailFromApi(dealId: string) {
  const response = await fetch(`/api/dealer/deals/${dealId}`, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  return readApiResponse(response, dealerDealDetailSchema);
}

async function readApiResponse<T>(
  response: Response,
  schema: {
    parse: (payload: unknown) => T;
  },
) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? payload.message
        : null;

    throw new Error(
      typeof message === "string" ? message : "거래 데이터를 불러오지 못했습니다.",
    );
  }

  return schema.parse(payload);
}
