import { NextResponse } from "next/server";
import { z } from "zod";
import { getDealerSession } from "@/shared/auth/session";
import { updateDealerDealExpectedDateForSession } from "@/shared/api/dealer-deal-server";

const updateDealerDealScheduleRequestSchema = z.object({
  kind: z.enum(["assignment", "release"]),
  date: z.string().date(),
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
    const message = error instanceof Error ? error.message : "거래 일정 저장에 실패했습니다.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
