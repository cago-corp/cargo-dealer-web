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

export async function updateDealerDealStatusFromApi(input: {
  dealId: string;
  targetStatusCode: string;
  reason?: string;
}) {
  const response = await fetch(`/api/dealer/deals/${input.dealId}/status`, {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      targetStatusCode: input.targetStatusCode,
      reason: input.reason,
    }),
  });

  return readApiResponse(response, okResponseSchema);
}

export async function updateDealerDealScheduleFromApi(input: {
  dealId: string;
  kind: "assignment" | "release";
  date: string;
}) {
  const response = await fetch(`/api/dealer/deals/${input.dealId}/schedule`, {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kind: input.kind,
      date: input.date,
    }),
  });

  return readApiResponse(response, okResponseSchema);
}

export async function cancelDealerDealFromApi(input: {
  dealId: string;
  reason: string;
}) {
  const response = await fetch(`/api/dealer/deals/${input.dealId}/cancel`, {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reason: input.reason,
    }),
  });

  return readApiResponse(response, okResponseSchema);
}

const okResponseSchema = {
  parse(payload: unknown) {
    return payload;
  },
};

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
