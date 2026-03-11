import { NextResponse } from "next/server";
import { z } from "zod";
import { getDealerSession } from "@/shared/auth/session";
import { updateDealerDealStatusForSession } from "@/shared/api/dealer-deal-server";

const updateDealerDealStatusRequestSchema = z.object({
  targetStatusCode: z.string().trim().min(1),
  reason: z.string().trim().max(200).optional(),
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
    const message = error instanceof Error ? error.message : "거래 상태 변경에 실패했습니다.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
