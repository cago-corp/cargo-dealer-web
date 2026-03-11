import {
  dealerContractInitDataSchema,
  dealerContractSubmitSchema,
  type DealerContractSubmitPayload,
} from "@/entities/deal/schemas/dealer-contract-schema";

export async function fetchDealerContractInitDataFromApi(dealId: string) {
  const response = await fetch(`/api/dealer/deals/${dealId}/contract`, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  return readApiResponse(response, dealerContractInitDataSchema);
}

export async function submitDealerContractFromApi(
  dealId: string,
  payload: DealerContractSubmitPayload,
) {
  const response = await fetch(`/api/dealer/deals/${dealId}/contract`, {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dealerContractSubmitSchema.parse(payload)),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      result && typeof result === "object" && "message" in result ? result.message : null;

    throw new Error(typeof message === "string" ? message : "최종 계약 전송에 실패했습니다.");
  }

  return result;
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
      typeof message === "string"
        ? message
        : "계약 입력 초기 데이터를 불러오지 못했습니다.",
    );
  }

  return schema.parse(payload);
}
