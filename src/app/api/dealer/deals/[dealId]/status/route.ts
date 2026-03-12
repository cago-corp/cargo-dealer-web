import { NextResponse } from "next/server";
import { z } from "zod";
import { getDealerSession } from "@/shared/auth/session";
import { updateDealerDealStatusForSession } from "@/shared/api/dealer-deal-server";
import { getSafeRouteErrorMessage, getSafeRouteErrorStatus } from "@/shared/api/route-error";
import { checkRateLimit, getRateLimitHeaders } from "@/shared/security/rate-limit";

const updateDealerDealStatusRequestSchema = z.object({
  targetStatusCode: z.string().trim().min(1),
  reason: z.string().trim().max(200).optional(),
});
const dealerDealStatusRateLimitRule = {
  windowMs: 5 * 60 * 1000,
  maxRequests: 20,
} as const;

type RouteContext = {
  params: Promise<{
    dealId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const rateLimit = checkRateLimit(request, "dealer:deal-status", dealerDealStatusRateLimitRule);

  if (!rateLimit.ok) {
    return NextResponse.json(
      { message: "상태 변경 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) },
    );
  }

  const session = await getDealerSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsedPayload = updateDealerDealStatusRequestSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return NextResponse.json({ message: "거래 상태 입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const { dealId } = await context.params;

  try {
    await updateDealerDealStatusForSession(session, {
      dealId,
      targetStatusCode: parsedPayload.data.targetStatusCode,
      reason: parsedPayload.data.reason,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: getSafeRouteErrorMessage(error, "거래 상태 변경에 실패했습니다.") },
      { status: getSafeRouteErrorStatus(error, 500) },
    );
  }
}
