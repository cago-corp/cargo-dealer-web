import { dealerProfileSchema } from "@/entities/dealer/schemas/dealer-profile-schema";
import {
  dealerMyInfoSchema,
  dealerNicknameUpdateSchema,
  dealerPasswordChangeSchema,
} from "@/entities/mypage/schemas/dealer-mypage-detail-schema";

export async function fetchDealerProfileFromApi() {
  const response = await fetch("/api/dealer/mypage/profile", {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  return readApiResponse(response, dealerProfileSchema, "마이페이지 정보를 불러오지 못했습니다.");
}

export async function fetchDealerMyInfoFromApi() {
  const response = await fetch("/api/dealer/mypage/my-info", {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  return readApiResponse(response, dealerMyInfoSchema, "내정보를 불러오지 못했습니다.");
}

export async function updateDealerNicknameFromApi(input: { nickname: string }) {
  const parsed = dealerNicknameUpdateSchema.parse(input);
  const response = await fetch("/api/dealer/mypage/my-info/nickname", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    credentials: "same-origin",
    body: JSON.stringify(parsed),
  });

  return readApiResponse(response, dealerMyInfoSchema, "닉네임을 변경하지 못했습니다.");
}

export async function changeDealerPasswordFromApi(input: {
  currentPassword: string;
  nextPassword: string;
  confirmPassword: string;
}) {
  const parsed = dealerPasswordChangeSchema.parse(input);
  const response = await fetch("/api/auth/password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parsed),
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      json && typeof json === "object" && typeof json.message === "string"
        ? json.message
        : "비밀번호를 변경하지 못했습니다.";
    throw new Error(message);
  }

  const redirectTo =
    json && typeof json === "object" && typeof json.redirectTo === "string"
      ? json.redirectTo
      : "/login";

  return {
    redirectTo,
  };
}

async function readApiResponse<T>(response: Response, schema: { parse: (payload: unknown) => T }, fallback: string) {
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      json && typeof json === "object" && typeof json.message === "string"
        ? json.message
        : fallback;
    throw new Error(message);
  }

  return schema.parse(json);
}
