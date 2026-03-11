import { NextResponse } from "next/server";
import { z } from "zod";
import { getDealerSession } from "@/shared/auth/session";
import { cancelDealerDealForSession } from "@/shared/api/dealer-deal-server";
import { getSafeRouteErrorMessage, getSafeRouteErrorStatus } from "@/shared/api/route-error";

const cancelDealerDealRequestSchema = z.object({
  reason: z.string().trim().min(1).max(200),
});

type RouteContext = {
  params: Promise<{
    dealId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await getDealerSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsedPayload = cancelDealerDealRequestSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return NextResponse.json({ message: "거래 취소 사유를 입력해 주세요." }, { status: 400 });
  }

  const { dealId } = await context.params;

  try {
    await cancelDealerDealForSession(session, {
      dealId,
      reason: parsedPayload.data.reason,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: getSafeRouteErrorMessage(error, "거래 취소에 실패했습니다.") },
      { status: getSafeRouteErrorStatus(error, 500) },
    );
  }
}
