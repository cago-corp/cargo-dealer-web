import { NextResponse } from "next/server";
import { dealerNicknameUpdateSchema } from "@/entities/mypage/schemas/dealer-mypage-detail-schema";
import { getDealerSession } from "@/shared/auth/session";
import { updateDealerNicknameForSession } from "@/shared/api/dealer-mypage-server";
import { getSafeRouteErrorMessage, getSafeRouteErrorStatus } from "@/shared/api/route-error";

export async function PATCH(request: Request) {
  const session = await getDealerSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const requestJson = await request.json().catch(() => null);
  const parsed = dealerNicknameUpdateSchema.safeParse(requestJson);
  if (!parsed.success) {
    return NextResponse.json({ message: "닉네임 형식을 확인해 주세요." }, { status: 400 });
  }

  try {
    const nextInfo = await updateDealerNicknameForSession(session, parsed.data);
    return NextResponse.json(nextInfo);
  } catch (error) {
    return NextResponse.json(
      { message: getSafeRouteErrorMessage(error, "닉네임을 변경하지 못했습니다.") },
      { status: getSafeRouteErrorStatus(error, 500) },
    );
  }
}
