import { NextResponse } from "next/server";
import { dealerPasswordChangeSchema } from "@/entities/mypage/schemas/dealer-mypage-detail-schema";
import { DealerAuthError } from "@/shared/auth/auth-error";
import { changeDealerPassword } from "@/shared/auth/change-dealer-password";
import { clearDealerSessionCookie, getDealerSession } from "@/shared/auth/session";
import { appRoutes } from "@/shared/config/routes";
import { checkRateLimit, getRateLimitHeaders } from "@/shared/security/rate-limit";

const dealerPasswordRateLimitRule = {
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
} as const;

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, "auth:password", dealerPasswordRateLimitRule);

  if (!rateLimit.ok) {
    return NextResponse.json(
      { message: "비밀번호 변경 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) },
    );
  }

  const session = await getDealerSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = dealerPasswordChangeSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: "비밀번호 입력값을 다시 확인해 주세요." }, { status: 400 });
  }

  try {
    await changeDealerPassword({
      session,
      currentPassword: parsed.data.currentPassword,
      nextPassword: parsed.data.nextPassword,
    });

    const response = NextResponse.json({
      ok: true,
      redirectTo: appRoutes.login(),
    });
    clearDealerSessionCookie(response);
    return response;
  } catch (error) {
    const authError =
      error instanceof DealerAuthError
        ? error
        : new DealerAuthError("비밀번호를 변경하지 못했습니다.", 500);

    return NextResponse.json({ message: authError.message }, { status: authError.statusCode });
  }
}
