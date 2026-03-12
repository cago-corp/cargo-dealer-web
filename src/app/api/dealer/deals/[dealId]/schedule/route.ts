import { NextResponse } from "next/server";
import { z } from "zod";
import { getDealerSession } from "@/shared/auth/session";
import { updateDealerDealExpectedDateForSession } from "@/shared/api/dealer-deal-server";
import { getSafeRouteErrorMessage, getSafeRouteErrorStatus } from "@/shared/api/route-error";
import { checkRateLimit, getRateLimitHeaders } from "@/shared/security/rate-limit";

const updateDealerDealScheduleRequestSchema = z.object({
  kind: z.enum(["assignment", "release"]),
  date: z.string().date(),
});
const dealerDealScheduleRateLimitRule = {
  windowMs: 5 * 60 * 1000,
  maxRequests: 20,
} as const;

type RouteContext = {
  params: Promise<{
    dealId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const rateLimit = checkRateLimit(request, "dealer:deal-schedule", dealerDealScheduleRateLimitRule);

  if (!rateLimit.ok) {
    return NextResponse.json(
      { message: "일정 변경 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) },
    );
  }

  const session = await getDealerSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsedPayload = updateDealerDealScheduleRequestSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return NextResponse.json({ message: "거래 일정 입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const { dealId } = await context.params;

  try {
    await updateDealerDealExpectedDateForSession(session, {
      dealId,
      assignmentDate:
        parsedPayload.data.kind === "assignment" ? parsedPayload.data.date : null,
      releaseDate: parsedPayload.data.kind === "release" ? parsedPayload.data.date : null,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: getSafeRouteErrorMessage(error, "거래 일정 저장에 실패했습니다.") },
      { status: getSafeRouteErrorStatus(error, 500) },
    );
  }
}
