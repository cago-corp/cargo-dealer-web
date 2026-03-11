import { dealerPasswordChangeSchema } from "@/entities/mypage/schemas/dealer-mypage-detail-schema";

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
