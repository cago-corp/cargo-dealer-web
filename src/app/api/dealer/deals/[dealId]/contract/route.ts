import { NextResponse } from "next/server";
import { getDealerSession } from "@/shared/auth/session";
import {
  fetchDealerContractInitDataForSession,
  submitDealerFinalContractForSession,
} from "@/shared/api/dealer-deal-server";
import { dealerContractSubmitSchema } from "@/entities/deal/schemas/dealer-contract-schema";

type RouteContext = {
  params: Promise<{
    dealId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getDealerSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { dealId } = await context.params;

  try {
    const initData = await fetchDealerContractInitDataForSession(session, dealId);
    return NextResponse.json(initData);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "계약 입력 초기 데이터를 불러오지 못했습니다.";

    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getDealerSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsedPayload = dealerContractSubmitSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return NextResponse.json({ message: "계약 입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const { dealId } = await context.params;

  try {
    await submitDealerFinalContractForSession(session, dealId, parsedPayload.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "최종 계약 전송에 실패했습니다.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
